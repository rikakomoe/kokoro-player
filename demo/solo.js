import { LitElement, html, css } from 'lit-element'

import { waveStyle, sharedPageStyle } from './style'

class SoloPage extends LitElement {
  static get properties () {
    return {
      connected: { type: Boolean },
      flatMode: { type: Boolean },
      darkMode: { type: Boolean }
    }
  }

  constructor () {
    super()
    this.connected = true
    this.flatMode = false
    this.darkMode = true
  }

  toggleConnect () {
    this.connected = !this.connected
    if (this.connected) {
      this.shadowRoot.querySelectorAll('kokoro-provider').forEach((provider) => {
        provider.connect(window.player)
      })
    } else {
      this.shadowRoot.querySelectorAll('kokoro-provider').forEach((provider) => {
        provider.disconnect()
      })
    }
  }

  static get styles () {
    return css`
      ${waveStyle}
      ${sharedPageStyle}
      .demo {
        background: linear-gradient(315deg, #24354E, #04142D);
      }
      .main {
        color: #ffe9f8;
      }
    `
  }

  firstUpdated (_) {
    this.shadowRoot.querySelector('#if').lyrics = {
      type: 'lrc',
      value: `[ti:如果你能够做我男朋友]
[ar:阮豆]
[al:如果你能够做我男朋友]
[00:00.000]作曲：久贤
[00:01.000]作词：久贤
[00:03.22]编曲：安苏羽
[00:23.26][01:23.67]请问你是什么星座
[00:25.45][01:25.27]能不能告诉我
[00:27.76][01:27.83]你是狮子座还是水瓶座
[00:29.82][01:30.26]不管是什么都很适合我
[00:32.50][01:32.32]每天都会许个愿望
[00:35.31][01:35.32]满足我的小幻想
[00:37.93][01:37.87]我只是害羞
[00:38.80][01:38.81]也怕出糗
[00:40.55][01:40.06]想鼓起勇气说
[00:41.92][01:41.99][02:02.58]如果你能够做我男朋友
[00:44.73][01:44.99][02:04.83]那就请你牵我手
[00:47.35][01:48.17][02:07.45]阳光 午后
[00:50.10][01:49.79][02:09.76]散步或郊游
[00:51.97][01:51.97][02:09.82]如果你能够做我男朋友
[00:54.78][01:54.90][02:14.94]那就请你点点头
[00:57.90][01:57.34][02:17.37]约定拉钩
[01:00.79]现在就跟我走
[02:00.02]现在就跟我
[02:19.74]现在就请你跟我走
[02:20.60]制作人：久贤
[02:21.97]混音：贾佳`
    }
  }

  render () {
    return html`
      <div class="demo waveAnimation">
        <div class="content">
          <nav-bar .location=${this.location} color="#ffe9f8"></nav-bar>
          <div class="main">
            <h1>Single Song Card</h1>
            <div class="landing">
              <kokoro-provider>
                <kokoro-single-card
                  id="if"
                  title="如果你能够做我男朋友"
                  artist="阮豆"
                  album="如果你能够做我男朋友"
                  src="https://cdn.innocent.love/%E9%98%AE%E8%B1%86%20-%20%E5%A6%82%E6%9E%9C%E4%BD%A0%E8%83%BD%E5%A4%9F%E5%81%9A%E6%88%91%E7%94%B7%E6%9C%8B%E5%8F%8B.mp3"
                  cover="https://cdn.innocent.love/%E9%98%AE%E8%B1%86%20-%20%E5%A6%82%E6%9E%9C%E4%BD%A0%E8%83%BD%E5%A4%9F%E5%81%9A%E6%88%91%E7%94%B7%E6%9C%8B%E5%8F%8B.jpg"
                  primaryColor="#bbbdd7"
                  secondaryColor="#a0a2bb"
                  backgroundColor="#2c3b58"
                  type="${this.flatMode ? 'flat' : 'classical'}"
                ></kokoro-single-card>
              </kokoro-provider>
            </div>
          </div>
          <kokoro-provider>
            <kokoro-player
              ?darkMode="${this.darkMode}"
              top="100"
              left="0"
              mobileDefaultSide="right"
              desktopLyricsColorSchemeIndex="2"
            ></kokoro-player>
          </kokoro-provider>
        </div>
        <div class="waveWrapperInner bgTop">
          <div class="wave waveTop" style="background-image: url('https://i.loli.net/2019/09/27/DgOiUhxQM69RlWL.png')"></div>
        </div>
        <div class="waveWrapperInner bgMiddle">
          <div class="wave waveMiddle" style="background-image: url('https://i.loli.net/2019/09/27/2Y3j86Mznb5tRwX.png')"></div>
        </div>
        <div class="waveWrapperInner bgBottom">
          <div class="wave waveBottom" style="background-image: url('https://i.loli.net/2019/09/27/GmvokX216OyHr7Q.png')"></div>
        </div>
      </div>
      <div class="source">
        <h1>Source Code</h1>
        <div>
          <label for="conn"><input type="checkbox" id="conn"
                                   ?checked="${this.connected}"
                                   @change="${this.toggleConnect}"
          /> Connected</label>
          <label for="flat"><input type="checkbox" id="flat"
                                   ?checked="${this.flatMode}"
                                   @change="${() => { this.flatMode = !this.flatMode }}"
          /> Flat mode</label>
          <label for="dark"><input type="checkbox" id="dark"
                                   ?checked="${this.darkMode}"
                                   @change="${() => { this.darkMode = !this.darkMode }}"
          /> Dark mode</label>
        </div>
        <source-box .snippets=${[{
          langCode: 'html',
          lang: 'HTML',
          code: `<html>
<head>
</head>
<body>
  <kokoro-provider>
    <!-- Single Song Card -->
    <kokoro-single-card
      id="if"
      title="如果你能够做我男朋友"
      artist="阮豆"
      album="如果你能够做我男朋友"
      src="https://cdn.innocent.love/阮豆 - 如果你能够做我男朋友.mp3"
      cover="https://cdn.innocent.love/阮豆 - 如果你能够做我男朋友.jpg"
      primaryColor="#bbbdd7"
      secondaryColor="#a0a2bb"
      backgroundColor="#2c3b58"${this.flatMode ? `
      type="flat"` : ''}
    ></kokoro-single-card>
  </kokoro-provider>
  <kokoro-provider>
    <!-- Player -->
    <kokoro-player${this.darkMode ? `
      darkMode` : ''}
      top="100"
      left="0"
      mobileDefaultSide="right"
      desktopLyricsColorSchemeIndex="2"
    ></kokoro-player>
  </kokoro-provider>
</body>
</html>`
        }, {
          langCode: 'javascript',
          lang: 'JavaScript',
          code: `import { Kokoro, Provider, PLAY_ORDER_LOOP } from 'kokoro-player' 

window.player = new Kokoro()
window.customElements.define('kokoro-provider', Provider${this.connected ? '.connect(window.player)' : ''})
${this.connected ? `// To disconnect
// document.querySelector('kokoro-provider').disconnect()` : `// To connect
// document.querySelector('kokoro-provider').connect(window.player)`}

// Set initial playlist
// More about Kokoro's API: https://kokoro.js.org
window.player.setPlaylist([{
  title: '你的答案',
  artist: '阿冗',
  album: '你的答案',
  src: 'https://cdn.innocent.love/阿冗 - 你的答案.mp3',
  cover: 'https://cdn.innocent.love/阿冗 - 你的答案.jpg'
}], 0, PLAY_ORDER_LOOP)`
      }]}></source-box>
      </div>
    `
  }
}

window.customElements.define('solo-page', SoloPage)
