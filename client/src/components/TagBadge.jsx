/**
 * TagBadge — a pill-shaped clickable tag label.
 * @param {string}   tag       - Tag text to display
 * @param {Function} onClick   - Optional click handler (e.g., filter by tag)
 */
const TagBadge = ({ tag, onClick }) => (
  <span
    className="tag-badge"
    onClick={(e) => {
      e.stopPropagation(); // prevent card click from firing
      onClick?.(tag);
    }}
  >
    #{tag}
  </span>
);

export default TagBadge;
