import React from 'react';
import Button from '@material-ui/core/Button';

import './Modal.css';

const modal = props => (
  <div className="modal">
    <header className="modal__header">
      <h1>{props.title}</h1>
    </header>
    <section className="modal__content">{props.children}</section>
    <section className="modal__actions form-actions">
      {props.canCancel && (
        <Button className="btn" onClick={props.onCancel}>
          Cancel
        </Button>
      )}
      {props.canConfirm && (
        <Button className="btn" onClick={props.onConfirm}>
          { props.confirmText }
        </Button>
      )}
    </section>
  </div>
);

export default modal;