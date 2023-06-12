import _ from "lodash";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import styled from "styled-components";

const components = {
    blockquote: ({ children, ...props }: any) => (
        <details>
            <summary>{props.title ?? "Note"}</summary>
            {children?.length === 1 && _.isString(children[0]) ? (
                <ReactMarkdown>{children[0]}</ReactMarkdown>
            ) : (
                children
            )}
        </details>
    ),
    video: (props: any) => <video width="100%" controls {...props}></video>,
    "video-gif": (props: any) => <video width="100%" autoPlay loop muted playsInline src={props.src}></video>,
    pdf: (props: any) => <embed width="100%" height="600px" src={props.src} />,
    //eslint-disable-next-line jsx-a11y/anchor-has-content
    a: (props: any) => <a target="_blank" {...props} />,
};

export const SimpleMarkdownViewer: React.FC<{ className?: string; source: string; center?: boolean }> = ({
    className,
    source,
}) => (
    <ReactMarkdown
        className={className}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, validHtml]]}
        components={components}
    >
        {source}
    </ReactMarkdown>
);

export const MarkdownViewer = styled(SimpleMarkdownViewer)`
    color: white;
    padding: 5px 20px 0 20px;
    text-align-last: ${props => (props.center ? "center" : "unset")};

    h1 {
        font-size: 32px;
        line-height: 47px;
        font-weight: 300;
        margin: 0px 0px 30px 0px;
    }

    p {
        font-size: 17px;
        font-weight: 300;
        line-height: 28px;
        text-align: justify;
    }

    img {
        max-width: 100%;
        border-radius: 1em;
        user-drag: none;
    }

    video {
        max-width: 100%;
        user-drag: none;
    }

    a {
        color: white;
    }

    details > summary {
        cursor: pointer;
        display: flex;
        align-items: center;
        outline: none;
        list-style: none;
        list-style-type: none;
        font-size: 33px;
        font-weight: 100;
        text-align: left;
        user-select: none;
    }

    details > summary::-webkit-details-marker {
        display: none;
    }

    details > summary::before {
        content: url(./img/note.svg);
        margin-right: 20px;
        top: 3px;
        position: relative;
    }

    details > summary::after {
        content: "keyboard_arrow_down";
        font-size: 35px;
        margin-left: 10px;
        font-family: "Material Icons";
    }

    details[open] > summary::after {
        transform: rotate(180deg);
    }
`;

export const validHtml = {
    strip: ["script"],
    clobberPrefix: "user-content-",
    clobber: ["name", "id"],
    ancestors: {
        tbody: ["table"],
        tfoot: ["table"],
        thead: ["table"],
        td: ["table"],
        th: ["table"],
        tr: ["table"],
    },
    protocols: {
        href: ["http", "https", "mailto"],
        cite: ["http", "https"],
        src: ["http", "https"],
        longDesc: ["http", "https"],
    },
    tagNames: [
        "embed",
        "iframe",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "br",
        "b",
        "i",
        "strong",
        "em",
        "a",
        "pre",
        "code",
        "img",
        "tt",
        "div",
        "ins",
        "del",
        "sup",
        "sub",
        "p",
        "ol",
        "ul",
        "table",
        "thead",
        "tbody",
        "tfoot",
        "blockquote",
        "dl",
        "dt",
        "dd",
        "kbd",
        "q",
        "samp",
        "var",
        "hr",
        "ruby",
        "rt",
        "rp",
        "li",
        "tr",
        "td",
        "th",
        "s",
        "strike",
        "summary",
        "details",
        "caption",
        "figure",
        "figcaption",
        "abbr",
        "bdo",
        "cite",
        "dfn",
        "mark",
        "small",
        "span",
        "time",
        "wbr",
        "input",
        "video",
        "video-gif",
        "pdf",
    ],
    attributes: {
        embed: ["src"],
        iframe: ["src"],
        a: ["href"],
        img: ["src", "longDesc"],
        input: [
            ["type", "checkbox"],
            ["disabled", true],
        ],
        li: [["className", "task-list-item"]],
        div: ["itemScope", "itemType"],
        blockquote: ["cite"],
        del: ["cite"],
        ins: ["cite"],
        q: ["cite"],
        video: ["src", "playsinline", "controls", "autoplay", "loop", "mute"],
        "video-gif": ["src"],
        pdf: ["src"],
        "*": [
            "abbr",
            "accept",
            "acceptCharset",
            "accessKey",
            "action",
            "align",
            "alt",
            "ariaDescribedBy",
            "ariaHidden",
            "ariaLabel",
            "ariaLabelledBy",
            "axis",
            "border",
            "cellPadding",
            "cellSpacing",
            "char",
            "charOff",
            "charSet",
            "checked",
            "clear",
            "cols",
            "colSpan",
            "color",
            "compact",
            "coords",
            "dateTime",
            "dir",
            "disabled",
            "encType",
            "htmlFor",
            "frame",
            "headers",
            "height",
            "hrefLang",
            "hSpace",
            "isMap",
            "id",
            "label",
            "lang",
            "maxLength",
            "media",
            "method",
            "multiple",
            "name",
            "noHref",
            "noShade",
            "noWrap",
            "open",
            "prompt",
            "readOnly",
            "rel",
            "rev",
            "rows",
            "rowSpan",
            "rules",
            "scope",
            "selected",
            "shape",
            "size",
            "span",
            "start",
            "summary",
            "tabIndex",
            "target",
            "title",
            "type",
            "useMap",
            "vAlign",
            "value",
            "vSpace",
            "width",
            "itemProp",
        ],
    },
    required: {
        input: {
            type: "checkbox",
            disabled: true,
        },
    },
};
