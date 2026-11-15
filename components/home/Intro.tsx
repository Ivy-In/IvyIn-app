// The reel's opening: a dot grid with a spinner, then a light streak bursts across and the screen
// collapses into it, revealing the page. Pure CSS timing (styles in app/reel.css), so it never waits on
// JavaScript and always clears itself after 1.6 seconds. It plays once per browser tab: the inline script
// hides it on later page loads. Visitors who prefer reduced motion never see it.
export function Intro() {
  return (
    <>
      <div id="rl-intro" className="rl-intro" aria-hidden="true" suppressHydrationWarning>
        <div className="rl-intro-spin">
          <svg viewBox="0 0 44 44" width="44" height="44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="82 200" />
          </svg>
          <i />
        </div>
        <div className="rl-intro-burst" />
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var e=document.getElementById('rl-intro');if(sessionStorage.getItem('rl-intro')){e.style.display='none'}else{sessionStorage.setItem('rl-intro','1')}}catch(_){}",
        }}
      />
    </>
  );
}
