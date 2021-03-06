import './ProductOverviewPage.less';
import {createElement} from 'react';
import {ReactPage, ReactPageProps} from 'solidify-lib/react/ReactPage';

// ----------------------------------------------------------------------------- STRUCT

interface States {}

export class ProductOverviewPage extends ReactPage<ReactPageProps, States> {
  // ------------------------------------------------------------------------- INIT

  prepare() {}

  // ------------------------------------------------------------------------- RENDERING

  render() {
    return (
      <div className="ProductOverviewPage" ref="root">
        ProductOverviewPage
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
export default ProductOverviewPage;
