import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ subject, chapter, unit, topic, quizType, questionId }) => {
  const items = [];
  if (subject)
    items.push({ label: subject.replace(/_/g, ' '), path: `/${subject}` });
  if (chapter)
    items.push({ label: chapter.replace(/_/g, ' '), path: `/${subject}/${chapter}` });
  if (unit)
    items.push({ label: unit.replace(/_/g, ' '), path: `/${subject}/${chapter}/${unit}` });
  if (topic)
    items.push({
      label: topic.replace(/_/g, ' '),
      path: `/${subject}/${chapter}/${unit}/${topic}`,
    });
  if (quizType)
    items.push({
      label: quizType.replace(/_/g, ' '),
      path: `/${subject}/${chapter}/${unit}/${topic}/${quizType}`,
    });
  if (questionId)
    items.push({ label: `Question ${questionId}`, path: null });

  return (
    <nav className="mb-6 text-gray-600 text-sm">
      <Link to="/" className="hover:text-blue-600">
        Home
      </Link>
      {items.map((item, index) => (
        <span key={index}>
          {' > '}
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
