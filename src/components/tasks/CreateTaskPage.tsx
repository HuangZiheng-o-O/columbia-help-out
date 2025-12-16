import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  type CreateTaskInput,
  type Task,
  type TaskCategory,
  type TaskUrgency,
} from '../../api/taskTypes';
import { taskService } from '../../api/taskService';
import { suggestLocations } from '../../utils/geocoder';
import { useUser } from '../../context/UserContext';

interface CreateTaskPageProps {
  onCancel?: () => void;
  onCreated?: (task: Task) => void;
}

const CreateTaskPage: React.FC<CreateTaskPageProps> = ({
  onCancel,
  onCreated,
}) => {
  const { currentUser } = useUser();
  // TODO: replace with real user balance from auth/profile
  const availableCredits = 80;
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<TaskCategory>('academic');
  const [urgency, setUrgency] = useState<TaskUrgency>('normal');

  const [isOnline, setIsOnline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);

  const tagOptions: { value: TaskCategory; label: string; icon: string }[] = [
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'daily', label: 'Daily', icon: '☀️' },
    { value: 'campus', label: 'Campus', icon: '🏫' },
    { value: 'other', label: 'Other', icon: '🏷️' },
  ];

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Task title is required.';
    }

    const creditsNumber = Number(credits);
    if (!credits.trim() || Number.isNaN(creditsNumber)) {
      errors.credits = 'Please enter a valid number.';
    } else if (creditsNumber <= 0) {
      errors.credits = 'Credits must be greater than zero.';
    } else if (creditsNumber > availableCredits) {
      errors.credits = `Not enough credits. Available: ${availableCredits}.`;
    }

    if (!description.trim()) {
      errors.description = 'Task description is required.';
    }

    const durationNumber = Number(duration);
    if (!duration.trim() || Number.isNaN(durationNumber)) {
      errors.duration = 'Please enter a valid number of minutes.';
    } else if (durationNumber <= 0) {
      errors.duration = 'Duration must be greater than zero.';
    }

    if (!location.trim()) {
      errors.location = 'Location is required.';
    }

    if (!category) {
      errors.category = 'Please choose a task tag.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildPayload(): CreateTaskInput {
    return {
      title: title.trim(),
      shortDescription: description.trim(),
      category,
      credits: Number(credits),
      location: location.trim(),
      durationMinutes: Number(duration),
      isOnline,
      urgency,
      tags: [category],
      createdByUid: currentUser?.uid ?? '',
      publisherEmail: currentUser?.email ?? '',
    };
  }

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setLocationSuggestions(suggestLocations(value).map((s) => s.label));
  };

  const handleSelectSuggestion = (label: string) => {
    setLocation(label);
    setLocationSuggestions([]);
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const isValid = validate();
    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload();
      const created = await taskService.createTask(payload);
      setIsSubmitting(false);

      setTitle('');
      setCredits('');
      setDescription('');
      setDuration('');
      setLocation('');
      setCategory('academic');
      setIsOnline(false);
      setUrgency('normal');
      setFieldErrors({});

      if (onCreated) {
        onCreated(created);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setFormError('Failed to publish task. Please try again.');
    }
  }

  return (
    <main className="create-task-page" aria-labelledby="create-task-title">
      <section className="create-task-card">
        <header className="create-task-header">
          <button type="button" className="btn-back" onClick={onCancel}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 id="create-task-title" className="create-task-title">
              Post a New Task
            </h1>
            <p className="create-task-subtitle">
              Get help from the community by sharing your task details.
            </p>
          </div>
        </header>

        <form
          className="create-task-form"
          onSubmit={handleSubmit}
          aria-describedby={formError ? 'create-task-error' : undefined}
          noValidate
        >
          {formError && (
            <div
              id="create-task-error"
              className="form-error-message"
              role="alert"
            >
              {formError}
            </div>
          )}

          <div className="form-section">
            {/*<h2 className="form-section-title">Basic Info</h2>*/}
            <div className="create-task-row">
              <div className="form-field">
                <label className="form-label" htmlFor="task-title">
                  Task Title <span className="required-indicator">*</span>
                </label>
                <input
                  id="task-title"
                  name="task-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Help me move a sofa"
                  autoComplete="off"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-invalid={fieldErrors.title ? 'true' : 'false'}
                />
                {fieldErrors.title && (
                  <p className="field-error" role="alert">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div className="form-field form-field--compact">
                <label className="form-label" htmlFor="task-credits">
                  Credits <span className="required-indicator">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">💎</span>
                  <input
                    id="task-credits"
                    name="task-credits"
                    type="number"
                    min={1}
                    className="form-input has-icon"
                    placeholder="30"
                    inputMode="numeric"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    aria-invalid={fieldErrors.credits ? 'true' : 'false'}
                  />
                </div>
                {fieldErrors.credits && (
                  <p className="field-error" role="alert">
                    {fieldErrors.credits}
                  </p>
                )}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="task-description">
                Description <span className="required-indicator">*</span>
              </label>
              <textarea
                id="task-description"
                name="task-description"
                className="form-textarea"
                rows={4}
                placeholder="Describe what you need help with..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={fieldErrors.description ? 'true' : 'false'}
              />
              {fieldErrors.description && (
                <p className="field-error" role="alert">
                  {fieldErrors.description}
                </p>
              )}
            </div>
          </div>

          <div className="form-section">
            {/*<h2 className="form-section-title">Logistics</h2>*/}
            <div className="create-task-row">
              <div className="form-field form-field--compact">
                <label className="form-label" htmlFor="task-duration">
                  Duration (min) <span className="required-indicator">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">⏱️</span>
                  <input
                    id="task-duration"
                    name="task-duration"
                    type="number"
                    min={1}
                    className="form-input has-icon"
                    placeholder="30"
                    inputMode="numeric"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    aria-invalid={fieldErrors.duration ? 'true' : 'false'}
                  />
                </div>
                {fieldErrors.duration && (
                  <p className="field-error" role="alert">
                    {fieldErrors.duration}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="task-location">
                  Location <span className="required-indicator">*</span>
                </label>
                <div className="input-with-icon location-autocomplete">
                  <span className="input-icon">📍</span>
                  <input
                    id="task-location"
                    name="task-location"
                    type="text"
                    className="form-input has-icon"
                    placeholder="e.g. Butler Library"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    aria-invalid={fieldErrors.location ? 'true' : 'false'}
                    autoComplete="off"
                  />
                  {locationSuggestions.length > 0 && (
                    <ul className="location-suggestions" role="listbox">
                      {locationSuggestions.map((item) => (
                        <li key={item}>
                          <button
                            type="button"
                            className="location-suggestion-btn"
                            onClick={() => handleSelectSuggestion(item)}
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {fieldErrors.location && (
                  <p className="field-error" role="alert">
                    {fieldErrors.location}
                  </p>
                )}
              </div>
            </div>

            <div className="create-task-row create-task-row--meta">
              <div className="form-field checkbox-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                  />
                  <span>This is an online task</span>
                </label>
              </div>

              <div className="form-field urgency-field">
                <label className="form-label" htmlFor="task-urgency">
                  Urgency
                </label>
                <div className="select-wrapper">
                  <select
                    id="task-urgency"
                    name="task-urgency"
                    className="form-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as TaskUrgency)}
                  >
                    <option value="normal">📅 Normal</option>
                    <option value="flexible">🕐 Flexible</option>
                    <option value="urgent">⚡ Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Category</h2>
            <div className="tag-pill-group" role="radiogroup">
              {tagOptions.map((option) => {
                const isActive = category === option.value;
                return (
                  <label
                    key={option.value}
                    className={`tag-card ${isActive ? 'tag-card--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="task-category"
                      value={option.value}
                      checked={isActive}
                      onChange={() => setCategory(option.value)}
                      className="sr-only"
                    />
                    <span className="tag-card-icon">{option.icon}</span>
                    <span className="tag-card-label">{option.label}</span>
                  </label>
                );
              })}
            </div>
            {fieldErrors.category && (
              <p className="field-error" role="alert">
                {fieldErrors.category}
              </p>
            )}
          </div>

          <div className="create-task-footer">
            <button
              type="button"
              className="btn-text"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary btn-large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Task'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CreateTaskPage;

