import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";

import c_blog from "styles/blog.module.scss"
import c_heading from "styles/heading.module.scss";
import c_ptimeline from "styles/components/timeline.module.scss";

export default function Output(props) {
    return (
        <>
            <section style={{ "--no": props.no, "--c": props.color }}>
                <div className={c_ptimeline.data}>
                    <h2>テスト1</h2>
                    <ul>
                        <li>test1</li>
                        <li>test2</li>
                        <li>test3</li>
                    </ul>
                </div>
                <div className={c_ptimeline.term_border}>
                    <div className={c_ptimeline.top} style={{ "--size": "1.4" }}></div>
                </div>
            </section>
        </>
    );
}
