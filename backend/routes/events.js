const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const verifyToken = require('../middleware/auth');

router.post('/create', verifyToken, async (req, res) => {
  try {
    const requiredFields = ['name', 'description', 'date', 'time', 'venue'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const eventData = {
      ...req.body,
      createdBy: req.user.userId,
      date: new Date(req.body.date),
      status: req.body.status || 'draft',
      updatedAt: Date.now()
    };

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(eventData.time.from) || !timeRegex.test(eventData.time.to)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
    }

    const query = req.body._id ? 
      { _id: req.body._id, createdBy: req.user.userId } : 
      { name: req.body.name };

    const event = await Event.findOneAndUpdate(
      query,
      eventData,
      { 
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    const io = req.app.get('io');
    if (req.body._id) {
      io.emit('eventUpdated', {
        eventId: event._id,
        updates: eventData
      });
    } else {
      io.emit('eventCreated', {
        eventId: event._id,
        name: event.name
      });
    }

    res.status(201).json({
      message: req.body._id ? 'Event updated successfully' : 'Event created successfully',
      event: {
        _id: event._id,
        name: event.name,
        date: event.date,
        status: event.status
      }
    });

  } catch (error) {
    console.error('Error creating/updating event:', error);
    if (error.code === 11000 && error.keyPattern?.name) {
      return res.status(400).json({ 
        error: 'An event with this name already exists' 
      });
    }
    res.status(400).json({ 
      error: error.message || 'Failed to create/update event',
      details: error.errors
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      status = 'published'
    } = req.query;

    const query = { status };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('attendees', 'name');

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error in GET /events:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-events', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { createdBy: req.user.userId },
        { attendees: req.user.userId }
      ]
    }).sort({ date: 1 });

    res.json({
      created: events.filter(event => event.createdBy.toString() === req.user.userId),
      registered: events.filter(event => event.attendees.includes(req.user.userId))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/registration-status', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const isRegistered = event.attendees.includes(req.user.userId);
    res.json({ isRegistered });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check registration status' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    const io = req.app.get('io');
    io.emit('eventUpdated', {
      eventId: updatedEvent._id,
      updates: req.body
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.attendees.includes(req.user.userId)) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    event.attendees.push(req.user.userId);
    await event.save();

    const io = req.app.get('io');
    
    io.to(`event:${event._id}`).emit('attendeeUpdate', {
      eventId: event._id,
      count: event.attendees.length
    });

    res.json({ 
      message: 'Successfully registered for event',
      attendeeCount: event.attendees.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;