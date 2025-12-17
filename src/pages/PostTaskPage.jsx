import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { taskService } from '../api/taskService';

const TASK_TAGS = [
  { id: 'academic', label: 'Academic', color: '#d1fae5' },
  { id: 'daily', label: 'Daily', color: '#fef3c7' },
  { id: 'career', label: 'Career', color: '#fce7f3' },
  { id: 'other', label: 'Other', color: '#e0e7ff' },
];

export default function PostTaskPage({ onCancel, onSuccess }) {
  const { currentUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    category: 'academic',
    description: '',
    durationMinutes: '',
    credits: '',
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagSelect = (tagId) => {
    setFormData((prev) => ({ ...prev, category: tagId }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    if (!formData.location.trim()) {
      alert('Please enter a location');
      return;
    }
    if (!formData.durationMinutes || Number(formData.durationMinutes) <= 0) {
      alert('Please enter a valid duration');
      return;
    }
    if (!formData.credits || Number(formData.credits) <= 0) {
      alert('Please enter valid credits');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await taskService.createTask({
        title: formData.title.trim(),
        shortDescription: formData.description.trim() || undefined,
        category: formData.category,
        credits: Number(formData.credits),
        location: formData.location.trim(),
        durationMinutes: Number(formData.durationMinutes),
        createdByUid: currentUser.uid,
        publisherEmail: currentUser.email,
      });

      alert('Task posted successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to post task:', error);
      alert('Failed to post task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-task-page">
      <div className="post-task-container">
        {/* Header */}
        <h1 className="post-task-title">Post a New Task</h1>
        <div className="post-task-divider"></div>

        {/* Form */}
        <div className="post-task-form">
          {/* Task Title */}
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder=""
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder=""
            />
          </div>

          {/* Task Tag */}
          <div className="form-group tag-group">
            <label className="form-label">Task Tag</label>
            <div className="tag-selector">
              {TASK_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-option ${formData.category === tag.id ? 'selected' : ''}`}
                  style={{ backgroundColor: tag.color }}
                  onClick={() => handleTagSelect(tag.id)}
                >
                  {formData.category === tag.id && <span className="tag-check">✓</span>}
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder=""
              rows={6}
            />
          </div>

          {/* Row 2: Duration & Credits */}
          <div className="form-row inline-row">
            <div className="form-group inline-group">
              <label className="form-label">Duration (min)</label>
              <input
                type="number"
                className="form-input small-input"
                value={formData.durationMinutes}
                onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
                min="1"
              />
            </div>
            <div className="form-group inline-group">
              <label className="form-label">Credits</label>
              <input
                type="number"
                className="form-input small-input"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', e.target.value)}
                min="1"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-launch"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Launch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

