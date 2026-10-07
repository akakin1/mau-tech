import Link from 'next/link'
import { slug } from 'github-slugger'

import AdSence from "components/AdSence/AdSence"
import css_CutomH2 from "components/unified/CutomH2.module.scss"
export default function Output(e) {
    return (<>
        <div className={css_CutomH2.adsence}>
            <AdSence />
        </div>
        <h2 id={e.id}>
            {e.children}
        </h2>
    </>)
}
