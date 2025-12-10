import { FormEvent, useState } from 'react';
import {
  type CreateTaskInput,
  type Task,
  type TaskCategory,
  type TaskUrgency,
} from '../../api/taskTypes';
import { taskService } from '../../api/taskService';

interface CreateTaskPageProps {
  onCancel?: () => void;
  onCreated?: (task: Task) => void;
}

const CreateTaskPage: React.FC<CreateTaskPageProps> = ({
  onCancel,
  onCreated,
}) => {
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

  const tagOptions: { value: TaskCategory; label: string }[] = [
    { value: 'academic', label: 'Academic' },
    { value: 'daily', label: 'Daily' },
    { value: 'campus', label: 'Campus' },
    { value: 'other', label: 'Other' },
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
    };
  }

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
          <h1 id="create-task-title" className="create-task-title">
            Create Task
          </h1>
          <p className="create-task-subtitle">
            Share what you need help with. Clear tasks receive responses faster.
          </p>
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

          <div className="create-task-row">
            <div className="form-field">
              <label className="form-label" htmlFor="task-title">
                Task Title{' '}
                <span aria-hidden="true" className="required-indicator">
                  *
                </span>
                <span className="sr-only">required</span>
              </label>
              <input
                id="task-title"
                name="task-title"
                type="text"
                className="form-input"
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={fieldErrors.title ? 'true' : 'false'}
                aria-describedby={
                  fieldErrors.title ? 'task-title-error' : undefined
                }
              />
              {fieldErrors.title && (
                <p id="task-title-error" className="field-error" role="alert">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className="form-field form-field--compact">
              <label className="form-label" htmlFor="task-credits">
                Credit Reward{' '}
                <span aria-hidden="true" className="required-indicator">
                  *
                </span>
                <span className="sr-only">required</span>
              </label>
              <input
                id="task-credits"
                name="task-credits"
                type="number"
                min={1}
                className="form-input"
                inputMode="numeric"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                aria-invalid={fieldErrors.credits ? 'true' : 'false'}
                aria-describedby={
                  fieldErrors.credits ? 'task-credits-error' : undefined
                }
              />
              {fieldErrors.credits && (
                <p
                  id="task-credits-error"
                  className="field-error"
                  role="alert"
                >
                  {fieldErrors.credits}
                </p>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="task-description">
              Task Description{' '}
              <span aria-hidden="true" className="required-indicator">
                *
              </span>
              <span className="sr-only">required</span>
            </label>
            <textarea
              id="task-description"
              name="task-description"
              className="form-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={fieldErrors.description ? 'true' : 'false'}
              aria-describedby={
                fieldErrors.description ? 'task-description-error' : undefined
              }
            />
            <p className="field-hint">
              Be specific about what you need, where you are, and any timing
              details.
            </p>
            {fieldErrors.description && (
              <p
                id="task-description-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="create-task-row">
            <div className="form-field form-field--compact">
              <label className="form-label" htmlFor="task-duration">
                Estimate Time (minutes){' '}
                <span aria-hidden="true" className="required-indicator">
                  *
                </span>
                <span className="sr-only">required</span>
              </label>
              <input
                id="task-duration"
                name="task-duration"
                type="number"
                min={1}
                className="form-input"
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                aria-invalid={fieldErrors.duration ? 'true' : 'false'}
                aria-describedby={
                  fieldErrors.duration ? 'task-duration-error' : undefined
                }
              />
              {fieldErrors.duration && (
                <p
                  id="task-duration-error"
                  className="field-error"
                  role="alert"
                >
                  {fieldErrors.duration}
                </p>
              )}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="task-location">
                Location{' '}
                <span aria-hidden="true" className="required-indicator">
                  *
                </span>
                <span className="sr-only">required</span>
              </label>
              <input
                id="task-location"
                name="task-location"
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-invalid={fieldErrors.location ? 'true' : 'false'}
                aria-describedby={
                  fieldErrors.location ? 'task-location-error' : undefined
                }
              />
              {fieldErrors.location && (
                <p
                  id="task-location-error"
                  className="field-error"
                  role="alert"
                >
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
                <span>Online task</span>
              </label>
            </div>

            <div className="form-field urgency-field">
              <label className="form-label" htmlFor="task-urgency">
                Urgency
              </label>
              <select
                id="task-urgency"
                name="task-urgency"
                className="form-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as TaskUrgency)}
              >
                <option value="normal">Normal</option>
                <option value="flexible">Flexible</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <fieldset className="form-field">
            <legend className="form-label">
              Task Tag{' '}
              <span aria-hidden="true" className="required-indicator">
                *
              </span>
              <span className="sr-only">required</span>
            </legend>
            <p className="field-hint">
              Choose the main category so others can quickly understand your
              task.
            </p>

            <div className="tag-pill-group" role="radiogroup">
              {tagOptions.map((option) => {
                const isActive = category === option.value;
                return (
                  <label
                    key={option.value}
                    className={`tag-pill ${isActive ? 'tag-pill--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="task-category"
                      value={option.value}
                      checked={isActive}
                      onChange={() => setCategory(option.value)}
                      className="sr-only"
                    />
                    <span className="tag-pill-label">{option.label}</span>
                  </label>
                );
              })}
            </div>

            {fieldErrors.category && (
              <p id="task-category-error" className="field-error" role="alert">
                {fieldErrors.category}
              </p>
            )}
          </fieldset>

          <div className="create-task-footer">
            <button
              type="button"
              className="btn-outline"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CreateTaskPage;

