import React, { memo } from "react";

const Highlight = memo(({ children }) => (
    <span className="primary">{children}</span>
));
Highlight.displayName = 'Highlight';

export const H = memo(({ children }) => <span className="highlight">{children}</span>); // ModalHighlight 축약
H.displayName = 'H';

export default Highlight;
