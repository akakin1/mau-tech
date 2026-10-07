import Link from "next/link";
function Error({ statusCode }) {
   return (
      <>
         <h1>${statusCode}</h1>
         <p>
            {statusCode
               ? `サーバーで error: ${statusCode} が発生しました。`
               : 'クライアントでエラーが発生しました。'}
         </p>
         <p>
            <Link legacyBehavior href="/">
               <a>トップページにもどる</a>
            </Link>
         </p>


      </>
   )
}

Error.getInitialProps = ({ res, err }) => {
   const statusCode = res ? res.statusCode : err ? err.statusCode : 404
   return { statusCode }
}

export default Error
