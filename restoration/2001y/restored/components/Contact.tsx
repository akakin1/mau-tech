import classNames from "classnames";
import css from "styles/components/contact.module.scss";
import { useEffect, useState } from "react";

export default function Output({ name }) {
   let [stateOpen, stateOpen_set] = useState(false);
   useEffect(() => {
      const close = (event) => { if (event.key === "Escape") stateOpen_set(false); };
      window.addEventListener("keydown", close);
      return () => window.removeEventListener("keydown", close);
   }, []);
   return (
      <>
         <section className={classNames(
            css.overlay,
            { [css.open]: stateOpen }
         )}
         >
            <button
               type="button"
               className={css.bg}
               aria-label="Contactを閉じる"
               onClick={() => stateOpen_set(!stateOpen)}
            ></button>
            <div
               className={css.modal}
               role={stateOpen ? "dialog" : "button"}
               aria-label="Contact"
               aria-modal={stateOpen || undefined}
               tabIndex={stateOpen ? -1 : 0}
               onClick={() => stateOpen_set(true)}
               onKeyDown={(event) => {
                  if (!stateOpen && (event.key === "Enter" || event.key === " ")) {
                     event.preventDefault(); stateOpen_set(true);
                  }
               }}
            >
               <h3>Contact</h3>
               <form method="post" action="https://2001y-portfolio.form.newt.so/v1/ktMviMs9b">
                  <label htmlFor="contact-name">お名前</label>
                  <input id="contact-name" type="text" name="name" placeholder="田中 太郎" required />
                  <label htmlFor="contact-email">メールアドレス</label>
                  <input
                     id="contact-email"
                     type="email"
                     name="email"
                     placeholder="mail@example.com"
                     required
                  />
                  <label htmlFor="contact-body">お問い合わせ内容</label>
                  <textarea
                     id="contact-body"
                     name="body"
                     placeholder="その他、ご自由にご記入ください。"
                  ></textarea>
                  <button type="submit">Submit</button>
               </form>
            </div>
         </section>
      </>
   );
}
