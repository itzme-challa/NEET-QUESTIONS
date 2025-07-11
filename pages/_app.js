import '../styles/globals.css'
import Head from 'next/head'
import React from 'react' // Added to fix ReferenceError

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div className="text-red-500 text-center p-4">Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  )
}

export default MyApp
