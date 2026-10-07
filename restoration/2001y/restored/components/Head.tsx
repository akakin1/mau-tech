import Head from "next/head";
import Link from "next/link";

function Page(props) {
   const title = props.title || process.env.title;
   const jsonLd = props.breadcrumb
      ? JSON.stringify(props.breadcrumb).replace(/[<>&]/g, (character) => ({
         "<": "\\u003c",
         ">": "\\u003e",
         "&": "\\u0026",
      }[character]))
      : null;

   // if (res.breadcrumb) {
   //    res.breadcrumb = res.breadcrumb.map((e, i) => ({
   //       "@type": "ListItem",
   //       position: i + 1,
   //       name: e[0],
   //       item: _V.meta.baseURL + e[1],
   //    }));
   //    res.breadcrumb = {
   //       "@context": "https://schema.org",
   //       "@type": "BreadcrumbList",
   //       itemListElement: res.breadcrumb,
   //    };
   // }

   return (
      <Head>
         <meta property="og:type" content="article" />
         <meta name="twitter:card" content="summary_large_image" />
         {/* <meta name="twitter:site" content="@tcr_jp" /> */}
         {process.env.title && (
            <>
               <meta property="og:site_name" content={process.env.title} key="og:site_name" />
            </>
         )}
         {title && (
            <>
               <title key="title">{title}</title>
               <meta property="og:title" content={title} key="og:title" />
            </>
         )}
         {props.img && (
            <>
               <meta property="og:image" content={props.img} key="ogp" />
            </>
         )}
         {props.url && (
            <>
               <meta property="og:url" content={props.url} key="og:url" />
               <link rel="canonical" href={props.url} key="canonical" />
            </>
         )}
         {props.description && (
            <>
               <meta property="og:description" content={props.description} key="og:description" />
            </>
         )}
         {jsonLd && (
            <>
               <script
                  type="application/ld+json"
               >
                  {jsonLd}
               </script>
            </>
         )}
      </Head>
   );
}

export default Page;
