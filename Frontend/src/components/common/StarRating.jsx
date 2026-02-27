import { useState } from "react";

const StarRating = ({
  rating = 0,
  maxStars = 5,
  size = "text-sm",
  interactive = false,
  onRate = null,
}) => {
  const [hovered, setHovered] = useState(0);

  const getStarType = (index) => {
    const value = interactive ? hovered || rating : rating;
    if (value >= index) return "full";
    if (value >= index - 0.5) return "half";
    return "empty";
  };

  return (
    <div className={`flex items-center gap-0.5 ${size}`}>
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => {
        const type = getStarType(star);
        return (
          <span
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={`transition-transform duration-100
              ${interactive ? "cursor-pointer hover:scale-125" : ""}
              ${type === "full" ? "text-amber-400" : ""}
              ${type === "half" ? "text-amber-300" : ""}
              ${type === "empty" ? "text-gray-300 dark:text-gray-600" : ""}`}
          >
            {type === "full" ? "★" : type === "half" ? "⭐" : "☆"}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;