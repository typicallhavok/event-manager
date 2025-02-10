const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const verifyToken = require('../middleware/auth');

router.post('/create', verifyToken, async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: req.user.userId };
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

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