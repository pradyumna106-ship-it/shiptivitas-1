import React from 'react';
import ReactDOM from 'react-dom';
import Board from './Board';

describe('Board component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  });

  it('renders without crashing', () => {
    ReactDOM.render(<Board />, container);
  });

  it('renders exactly three swimlanes with class "Swimlane-column"', () => {
    ReactDOM.render(<Board />, container);
    const swimlanes = container.querySelectorAll('.Swimlane-column');
    expect(swimlanes.length).toBe(3);

    const titles = Array.from(swimlanes).map(s => s.querySelector('.Swimlane-title').textContent);
    expect(titles).toEqual(['Backlog', 'In Progress', 'Complete']);
  });

  it('renders all tasks in the backlog swimlane initially', () => {
    ReactDOM.render(<Board />, container);
    const swimlanes = container.querySelectorAll('.Swimlane-column');
    const backlogColumn = swimlanes[0].querySelector('.Swimlane-dragColumn');
    const inProgressColumn = swimlanes[1].querySelector('.Swimlane-dragColumn');
    const completeColumn = swimlanes[2].querySelector('.Swimlane-dragColumn');

    const backlogCards = backlogColumn.querySelectorAll('.Card');
    const inProgressCards = inProgressColumn.querySelectorAll('.Card');
    const completeCards = completeColumn.querySelectorAll('.Card');

    expect(backlogCards.length).toBe(20);
    expect(inProgressCards.length).toBe(0);
    expect(completeCards.length).toBe(0);

    backlogCards.forEach(card => {
      expect(card.classList.contains('Card-grey')).toBe(true);
      expect(card.getAttribute('data-status')).toBe('backlog');
    });
  });

  it('updates card color and status when moved to in-progress, complete, and backlog', () => {
    let boardInstance;
    ReactDOM.render(<Board ref={inst => { boardInstance = inst; }} />, container);

    const card = container.querySelector('.Card');
    expect(card.classList.contains('Card-grey')).toBe(true);
    expect(card.getAttribute('data-status')).toBe('backlog');

    // Move to In Progress
    boardInstance.onDrop(card, boardInstance.swimlanes.inProgress.current);
    expect(card.classList.contains('Card-grey')).toBe(false);
    expect(card.classList.contains('Card-blue')).toBe(true);
    expect(card.getAttribute('data-status')).toBe('in-progress');

    // Move to Complete
    boardInstance.onDrop(card, boardInstance.swimlanes.complete.current);
    expect(card.classList.contains('Card-blue')).toBe(false);
    expect(card.classList.contains('Card-green')).toBe(true);
    expect(card.getAttribute('data-status')).toBe('complete');

    // Move back to Backlog
    boardInstance.onDrop(card, boardInstance.swimlanes.backlog.current);
    expect(card.classList.contains('Card-green')).toBe(false);
    expect(card.classList.contains('Card-grey')).toBe(true);
    expect(card.getAttribute('data-status')).toBe('backlog');
  });

  it('cleans up Dragula instance on unmount', () => {
    let boardInstance;
    ReactDOM.render(<Board ref={inst => { boardInstance = inst; }} />, container);

    expect(boardInstance.drake).toBeDefined();
    const destroySpy = jest.spyOn(boardInstance.drake, 'destroy');

    ReactDOM.unmountComponentAtNode(container);
    expect(destroySpy).toHaveBeenCalled();
  });
});
