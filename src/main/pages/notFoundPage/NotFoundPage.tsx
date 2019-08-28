import './NotFoundPage.less';
import {createElement} from 'react';
const React = {createElement};
import {ReactPage, ReactPageProps} from 'solidify-lib/react/ReactPage';

// ----------------------------------------------------------------------------- STRUCT

interface States {}

export class NotFoundPage extends ReactPage<ReactPageProps, States> {
  // ------------------------------------------------------------------------- INIT

  prepare() {}

  // ------------------------------------------------------------------------- RENDERING

  render() {
    return (
      <div className="NotFoundPage" ref="root">
        NotFoundPage
      </div>
    );
  }

  // ------------------------------------------------------------------------- PAGE

  /**
   * Action on this page.
   * Check props.action and props.parameters to show proper content.
   */
  action() {
    // Remove if not used
  }

  /**
   * Play in animation.
   * Call complete handler when animation is done.
   */
  protected playInPromiseHandler(pCompleteHandler: () => void) {
    pCompleteHandler();
  }

  /**
   * Play out animation.
   * Call complete handler when animation is done.
   */
  protected playOutPromiseHandler(pCompleteHandler: () => void) {
    pCompleteHandler();
  }
}

// Also export as default
export default NotFoundPage;
