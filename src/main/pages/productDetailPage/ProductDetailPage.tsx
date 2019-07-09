import "./ProductDetailPage.less";
import {createElement} from "react";
import {ReactPage, ReactPageProps} from "solidify-lib/react/ReactPage";

// ----------------------------------------------------------------------------- STRUCT

interface States {

}

export class ProductDetailPage extends ReactPage<ReactPageProps, States> {

    // ------------------------------------------------------------------------- INIT

    prepare() {

    }

    // ------------------------------------------------------------------------- RENDERING

    render() {
        return <div className="ProductDetailPage" ref="root">
            <h1>Product slug "{this.props.parameters.slug}"</h1>
            <h5>Product id "{this.props.parameters.id}"</h5>
        </div>
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
export default ProductDetailPage;