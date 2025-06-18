import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const CardList = ({ items, onSelect, title }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.length === 0 ? (
        <p className="text-gray-600">No items available.</p>
      ) : (
        items.map((item) => (
          <div
            key={item}
            onClick={() => onSelect(item)}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 hover:shadow-md transition duration-300 flex justify-between items-center"
          >
            <span className="text-gray-800">{item}</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-blue-500" />
          </div>
        ))
      )}
    </div>
  </div>
);

export default CardList;
