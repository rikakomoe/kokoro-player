import { html, css } from 'lit-element'
import { PLAY_ORDER_SHUFFLE, PLAY_ORDER_SINGLE } from 'kokoro'
import { Lrc, Runner } from 'lrc-kit'

import { Component } from '../utils/component'
import { connect } from '../utils/lit-redux'
import { iconfont } from '../iconfont'
import { SrcUtil } from '../utils/srcutil'

class Player extends Component {
  static get properties () {
    return {
      currentSong: { type: Object },
      playing: { type: Object },
      lyrics: { type: Object },
      lang: { type: String },
      langAvailable: { type: Array },
      pnKind: { type: String },
      pnKindAvailable: { type: Array },
      index: { type: Number },
      player: { type: Object },
      playlist: { type: Array },
      darkMode: { type: Boolean },
      playOrder: { type: String },
      played: { type: Number },
      buffered: { type: Array },
      isVolumeControlShown: { type: Boolean },
      isPlaylistShowing: { type: Boolean },
      isDesktopLyricsShowing: { type: Boolean },
      dragging: { type: Boolean },
      top: { type: Number },
      left: { type: Number },
      right: { type: Number },
      bottom: { type: Number },
      mobileDefaultSide: { type: String },
      desktopLyricsDragging: { type: Boolean },
      desktopLyricsVerticalCenter: { type: Number },
      desktopLyricsHorizontalCenter: { type: Number },
      desktopLyricsColorSchemes: { type: Array },
      desktopLyricsColorSchemeIndex: { type: Number },
      desktopLyricsFontSize: { type: Number },
      shouldShowSmallWindow: { type: Boolean },
      shouldMobileShowMainWindow: { type: Boolean },
      shrinkToLeft: { type: Boolean }
    }
  }

  static get styles () {
    return css`
      ${iconfont}
      :host {
        position: fixed;
      }

      .move-handle, .btn {
        user-select: none;
      }

      .move-handle.dragging {
        cursor: grabbing !important;
      }

      .main-window {
        position: fixed;
        width: 315px;
        height: 560px;
        border-radius: 15px;
        box-shadow: 0 0.3px 0.96px #666;
        background-color: #fbfbfb;
        color: var(--kokoro-primary-color);
        padding: 10px;
      }

      .main-window.dark {
        background-color: #000;
      }

      .main-window.disconnected {
        opacity: 0.85;
        backdrop-filter: blur(4px);
      }

      .main-window.dark .underlay > .background {
        opacity: 0.94;
        filter: blur(40px);
      }

      .underlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        border-radius: 15px;
        overflow: hidden;
      }

      .underlay > .background {
        position: absolute;
        top: -50px;
        left: -50px;
        right: -50px;
        bottom: -50px;
        opacity: 0.06;
      }

      .dark .underlay > .filter {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
      }

      .main-window .move-handle {
        height: 8px;
        width: 50px;
        margin: 4px auto;
        border-radius: 6px;
        background-color: var(--kokoro-white);
        opacity: 0.94;
        cursor: grab;
      }

      .main-window .move-handle .handle-bar {
        overflow: hidden;
        margin-top: -4px;
        z-index: 2;
        position: relative;
      }

      .main-window > .control-box {
        height: 84px;
        font-size: 24px;
        position: relative;
        user-select: none;
      }

      .main-window > .control-box > .panel {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        transition: top 200ms ease-in, bottom 200ms ease-in;
        overflow: hidden;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
      }

      .main-window > .control-box .control-panel.hide {
        bottom: 100%;
      }

      .main-window > .control-box .volume-playback-panel.hide {
        top: 100%
      }

      .main-window > .control-box .volume-playback-panel > .volume-playback-panel-close {
        position: absolute;
        top: 4px;
        left: 4px;
        font-size: 20px;
        cursor: pointer;
      }

      .main-window > .control-box .volume-playback-panel .btn {
        width: 40%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        cursor: initial;
      }

      .main-window > .control-box .volume-playback-panel .btn > kokoro-track {
        margin: 0 10px;
        flex: 1 1 auto;
      }

      .main-window > .control-box .btn {
        display: inline-block;
        line-height: 1;
        cursor: pointer;
      }

      .main-window > .control-box .btn > .icon {
        vertical-align: top;
      }

      .main-window > .control-box .btn.play {
        font-size: 48px;
      }

      .main-window > .control-box kokoro-progress {
        position: absolute;
        bottom: 0;
        left: -10px;
        right: -10px;
        transform: translateY(50%);
      }

      .main-window > .cover-box {
        box-sizing: border-box;
        height: 315px;
        padding: 20px;
        margin: 8px 0;
        user-select: none;
      }

      .main-window > .cover-box > img {
        width: 100%;
      }

      .main-window > .lyrics-box {
        margin-top: -10px;
        padding: 10px;
        overflow: hidden;
      }

      .main-window > .lyrics-box h1 {
        font-size: 24px;
        line-height: 1.45;
        margin: 0;
        font-weight: normal;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .main-window > .lyrics-box h2 {
        font-size: 18px;
        line-height: 1.4;
        margin: 0;
        font-weight: normal;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .playlist-panel.hide {
        left: 100%;
      }

      .main-window > .playlist-panel.hide {
        display: block;
      }

      .playlist-panel {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(251, 251, 251, 0.94);
        backdrop-filter: blur(1px);
        border-radius: 15px;
        overflow: hidden;
        transition: left 200ms, top 200ms;
      }

      .playlist {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: calc(100% - 36px);
        padding: 26px 37px 26px 10px;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .dark .playlist-panel {
        background-color: rgba(0, 0, 0, 0.9);
      }

      .playlist > .playlist-item-box > .playlist-item {
        box-sizing: border-box;
        height: 46px;
        padding: 4px 10px;
        display: inline-block;
        white-space: nowrap;
        max-width: 100%;
        vertical-align: top;
        position: relative;
      }

      .playlist > .playlist-item-box {
        transition: transform 250ms ease-in-out;
        transform-origin: left center;
        line-height: 1;
        margin: 6px 0;
        cursor: pointer;
      }

      .playlist > .playlist-item-box:hover {
        transform: scale(1.1);
      }

      .playlist > .playlist-item-box:hover > .playlist-item {
        border-left: 3px var(--kokoro-primary-color) solid;
      }

      .playlist .playlist-item.current {
        background: rgba(0, 0, 0, 0.1);
        border-left: 3px var(--kokoro-primary-color) solid;
      }

      .dark .playlist .playlist-item.current {
        background: rgba(251, 251, 251, 0.2);
      }

      .playlist > .playlist-item-box > .playlist-item.current::after {
        content: '';
        position: absolute;
        top: 0;
        right: -10px;
        border-top: 23px transparent solid;
        border-left: 5px rgba(0, 0, 0, 0.1) solid;
        border-right: 5px transparent solid;
        border-bottom: 23px rgba(0, 0, 0, 0.1) solid;
      }

      .dark .playlist > .playlist-item-box > .playlist-item.current::after {
        border-left: 5px rgba(251, 251, 251, 0.2) solid;
        border-bottom: 23px rgba(251, 251, 251, 0.2) solid;
      }

      .playlist .playlist-item > .title {
        font-size: 14px;
        line-height: 22px;
        margin-right: 24px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playlist .playlist-item > .artist {
        font-size: 12px;
        line-height: 16px;
        margin-right: 24px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playlist > .playlist-item-box:hover > .playlist-item > .remove {
        visibility: visible;
        transform: rotate(0);
      }

      .playlist .playlist-item > .remove {
        float: right;
        display: block;
        line-height: 38px;
        height: 38px;
        font-size: 16px;
        visibility: hidden;
        transform: rotate(-180deg);
        transition: transform 250ms;
      }

      .playlist .playlist-item > .remove > .icon {
        vertical-align: top;
      }

      .playlist-panel > .playlist-close {
        position: absolute;
        top: 30px;
        left: 12px;
        font-size: 20px;
        cursor: pointer;
      }

      .playlist-panel > .playlist-clear {
        position: absolute;
        top: 65px;
        left: 12px;
        font-size: 20px;
        cursor: pointer;
      }

      .disconnected-panel {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: -1;
      }

      .main-window > div.hide {
        display: none;
      }

      .small-window {
        position: fixed;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        background-color: #fbfbfb;
        border: 1px #bbb solid;
        box-shadow: 0 0.3px 0.96px #666;
        color: var(--kokoro-primary-color);
        transform: scale(0.5);
        transition: transform 250ms;
      }

      .small-window.dark {
        border: none;
        background-color: #000;
        box-shadow: 0 0 3px #eee;
      }

      .small-window:hover, .small-window.dragging, .small-window.dragging.disconnected:hover {
        transform: scale(1);
      }

      .small-window.disconnected:hover {
        transform: scale(0.5);
      }

      .small-window.disconnected {
        opacity: 0.85;
        backdrop-filter: blur(4px);
      }

      .small-window > .cover-box {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.1;
      }

      .small-window.disconnected > .cover-box {
        display: none;
      }

      .small-window.dark > .cover-box {
        opacity: 0.4;
        filter: blur(40px);
      }

      .small-window > .control-box {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: -1px;
        display: grid;
        grid-template-columns: repeat(2, 50%);
        grid-template-rows: repeat(2, 50%);
        transform: rotate(45deg);
      }

      .small-window > .control-box .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        cursor: pointer;
      }

      .small-window > .control-box .btn .icon {
        transform: rotate(-45deg);
      }

      .small-window > .control-box > .btn {
        border-right: 1px #bbb solid;
        border-bottom: 1px #bbb solid;
      }

      .small-window.dark > .control-box > .btn {
        border: none;
        box-shadow: 0 0 2px;
      }

      .small-window > .control-box > .move-handle {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(-45deg) scale(2.3);
        width: 54px;
        height: 54px;
        border-radius: 50%;
        border: 1px #bbb solid;
        margin: 0;
        background: radial-gradient(#fff, rgba(255, 255, 255, 0.99) 70%, rgba(255, 255, 255, 0.8));
        overflow: hidden;
        transition: transform 250ms;
        cursor: grab;
      }

      .small-window > .control-box > .move-handle .btn .icon {
        transform: none;
      }

      .small-window.dark > .control-box > .move-handle {
        border: none;
        box-shadow: 0 0 4px;
      }

      .small-window.dark > .control-box > .move-handle {
        background: #000;
      }

      .small-window:hover > .control-box > .move-handle {
        transform: translate(-50%, -50%) rotate(-45deg) scale(1);
      }

      .small-window.disconnected:hover > .control-box > .move-handle {
        transform: translate(-50%, -50%) rotate(-45deg) scale(2.3);
      }

      .small-window.spin-rev > .control-box > .move-handle > .btn {
        animation: spin-rev 45s linear infinite;
      }

      .small-window > .control-box > .move-handle > .btn {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        font-size: 28px;
        cursor: inherit;
      }

      .small-window > .control-box > .move-handle > .move-handle-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.06;
        z-index: -1;
      }

      .small-window.dark > .control-box > .move-handle > .move-handle-bg {
        opacity: 0.94;
        filter: blur(36px);
      }

      .small-window.spin-rev > .control-box > .move-handle > .move-handle-bg {
        animation: spin-rev 45s linear infinite;
      }

      .small-window.disconnected > .control-box > .move-handle > .move-handle-bg {
        display: none;
      }

      .small-window-mobile {
        position: fixed;
        width: 30px;
        height: 20px;
        background: var(--kokoro-black);
        backdrop-filter: blur(4px);
        color: var(--kokoro-white);
        font-size: 12px;
        display: none;
        cursor: pointer;
      }

      .small-window-mobile.left {
        left: 0;
        border-radius: 0 10px 10px 0;
      }

      .small-window-mobile.right {
        right: 0;
        border-radius: 10px 0 0 10px;
      }

      .small-window-mobile.dark {
        background: var(--kokoro-white);
        color: var(--kokoro-black);
      }

      .small-window-mobile > .icon {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 20px;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: scale(0.9);
      }

      .small-window-mobile.left > .icon {
        right: 0;
      }

      .small-window-mobile.right > .icon {
        left: 0;
      }

      .main-window.mobile {
        display: none;
        flex-direction: column;
        justify-content: space-between;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: auto;
        height: auto;
        visibility: visible;
        border-radius: 0;
        transition: left 250ms, right 250ms;
        z-index: 9999;
      }

      .main-window.mobile.hide {
        left: calc(100% + 5px);
        right: calc(-100% - 5px);
      }

      .main-window.mobile > .cover-box .btn {
        font-size: 24px;
        position: relative;
        left: -15px;
        top: -4px;
        cursor: pointer;
      }

      .mobile .disconnected-panel .btn {
        font-size: 24px;
        position: absolute;
        top: 34px;
        left: 20px;
        cursor: pointer;
      }

      .main-window.mobile > .cover-box img {
        border-radius: 50%;
        position: absolute;
        width: 100%;
        animation: spin 45s linear infinite;
      }

      .main-window.mobile .underlay {
        border-radius: 0;
      }

      .main-window.mobile > .cover-box {
        width: auto;
        height: 0;
        padding: 28px 0 calc(100% - 28px) 0;
        margin-left: 28px;
        margin-right: 28px;
        line-height: 0;
        position: relative;
      }

      .main-window.mobile > .lyrics-box {
        flex: 1 1 auto;
        max-height: 200px;
        box-sizing: border-box;
      }

      .main-window.mobile > .control-box {
        margin: 10px 0;
      }

      .main-window.mobile > .control-box kokoro-progress {
        position: absolute;
        top: 0;
        left: -10px;
        right: -10px;
        transform: translateY(-50%);
      }

      .main-window.mobile > .control-box .volume-playback-panel > .volume-playback-panel-close {
        top: 50%;
        transform: translateY(-50%);
      }

      .mobile .playlist-panel.hide {
        top: 100%;
        left: 0;
      }

      .mobile .playlist-panel {
        top: 20%;
        border-radius: 15px 15px 0 0;
      }

      .mobile .playlist > .playlist-item-box:hover {
        transform: scale(1);
      }

      .mobile .playlist {
        width: calc(100% - 52px);
        margin: 60px 26px 26px 26px;
        padding: 0;
      }

      .mobile .playlist-panel > .playlist-close {
        top: 20px;
        left: 26px;
      }

      .mobile .playlist-panel > .playlist-clear {
        top: 20px;
        left: auto;
        right: 26px;
      }

      .mobile .playlist-panel-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
      }

      .mobile .playlist-panel-mask.hide {
        display: none;
      }

      .mobile .playlist > .playlist-item-box > .playlist-item {
        display: block;
      }

      .mobile .playlist > .playlist-item-box > .playlist-item > .remove {
        visibility: visible;
        transform: none !important;
      }

      @keyframes spin {
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes spin-rev {
        100% {
          transform: rotate(-360deg);
        }
      }

      @media screen and (max-width: 500px) {
        .small-window, .main-window {
          display: none;
        }

        .small-window-mobile {
          display: block;
        }

        .main-window.mobile {
          display: flex;
        }
      }

      .desktop-lyrics-window.hide {
        display: none;
      }

      .desktop-lyrics-window {
        position: fixed;
        width: 90%;
        max-width: 600px;
        transform: translate(-50%, -50%);
        user-select: none;
      }
      
      .desktop-lyrics-window:hover {
        background: rgba(0, 0, 0, 0.6);
        box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
        border-radius: 4px;
        cursor: grab;
      }

      .desktop-lyrics-window.dragging {
        cursor: grabbing;
      }
      
      .desktop-lyrics-window > .tool-bar {
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        display: none;
        font-size: 14px;
        line-height: 1;
      }

      .desktop-lyrics-window > .btn.close {
        display: none;
        position: absolute;
        top: 6px;
        left: 6px;
        line-height: 1;
      }

      .desktop-lyrics-window > .btn.close > .icon {
        vertical-align: top;
      }

      .desktop-lyrics-window:hover > .btn.close {
        display: block;
      }
      
      .desktop-lyrics-window .btn {
        color: var(--kokoro-white);
        text-shadow: 0 0 1px var(--kokoro-white);
        font-size: 14px;
        cursor: pointer;
      }

      .desktop-lyrics-window > .tool-bar > .btn {
        margin: 0 3px;
      }

      .desktop-lyrics-window > .tool-bar > .btn > .preview {
        width: 14px;
        height: 14px;
        display: inline-block;
        vertical-align: top;
        border-radius: 2px;
      }
      
      .desktop-lyrics-window:hover > .tool-bar {
        display: flex;
      }
      
      .desktop-lyrics-window > .desktop-lyrics-panel {
        overflow: hidden;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .desktop-lyrics {
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        white-space: pre;
        line-height: normal;
      }
    `
  }

  get paused () {
    return !this.currentSong || this.playing.paused
  }

  get isConnected () {
    return !!this.context.kokoro
  }

  get isMobile () {
    return (document.documentElement || document.body).clientWidth <= 500
  }

  constructor () {
    super()
    this.drag = this.drag.bind(this)
    this.stopDragging = this.stopDragging.bind(this)
    this.desktopLyricsDrag = this.desktopLyricsDrag.bind(this)
    this.desktopLyricsStopDragging = this.desktopLyricsStopDragging.bind(this)
    this.left = 0
    this.top = 100
    this.shouldShowSmallWindow = true
    this.shouldMobileShowMainWindow = false
    this.mobileDefaultSide = 'left'
    this.right = (document.documentElement || document.body).clientWidth - 122
    this.bottom = (document.documentElement || document.body).clientHeight - 100 - 122
    this.desktopLyricsColorSchemes = [
      { name: '夕阳', value: 'linear-gradient(-1deg, #e92201, #fb9c17, #e92201)' },
      { name: '蓝天', value: 'linear-gradient(-1deg, #0145d3, #118cfa, #0145d3)' },
      { name: '星野', value: 'linear-gradient(-1deg, #a5c9e5, #9da9eb, #c6bde2)' },
      { name: '山峦', value: 'linear-gradient(-1deg, #1dbf76, #67d74d, #1dbf76)' }
    ]
    this.desktopLyricsColorSchemeIndex = 0
    this.desktopLyricsFontSize = 30
    this.isDesktopLyricsShowing = true
  }

  firstUpdated (_) {
    if (this.isMobile) {
      if (this.mobileDefaultSide === 'right') {
        this.right = 0
        this.left = (document.documentElement || document.body).clientWidth - 122
      } else {
        this.left = 0
        this.right = (document.documentElement || document.body).clientWidth - 122
      }
      this.shouldShowSmallWindow = true
    } else if (this.left + this.right !== (document.documentElement || document.body).clientWidth - 122) {
      if (this.right === 0) {
        this.left = (document.documentElement || document.body).clientWidth - 122
      } else {
        this.shouldShowSmallWindow = false
      }
    }
    if (this.shouldShowSmallWindow &&
      this.top + this.bottom !== (document.documentElement || document.body).clientHeight - 122) {
      if (this.top !== 100) {
        this.bottom = (document.documentElement || document.body).clientHeight - this.top - 122
      } else {
        this.top = (document.documentElement || document.body).clientHeight - this.bottom - 122
      }
    }
    this.cursorX = this.left
    this.shrinkToLeft = this.cursorX < ((document.documentElement || document.body).clientWidth / 2)
    this.desktopLyricsVerticalCenter = 150
    this.desktopLyricsHorizontalCenter = (document.documentElement || document.body).clientWidth / 2
  }

  updated (changedProperties) {
    if (changedProperties.get('playing') && this.lyrics) {
      this.shadowRoot.querySelector('#desktop-lyrics-panel').scrollLeft =
        (changedProperties.get('playing').currentTime - this.lyrics.currentSentenceStart) /
        (this.lyrics.currentSentenceEnd - this.lyrics.currentSentenceStart) *
        this.shadowRoot.querySelector('#desktop-lyrics-panel').scrollWidth
    }
  }

  isCurrentSong (song) {
    return SrcUtil.same(this.currentSong?.src, song.src)
  }

  render () {
    return html`
      <style>
        .main-window > .underlay > .background,
        .small-window > .cover-box,
        .small-window > .control-box > .move-handle > .move-handle-bg {
          background: url("${this.currentSong?.cover}") no-repeat scroll center center / cover;
        }
        :host {
          --kokoro-white: #cecece;
          --kokoro-black: rgba(0, 0, 0, 0.8);
          --kokoro-primary-color: ${this.darkMode ? '#cecece' : 'rgba(0, 0, 0, 0.8)'};
          --kokoro-secondary-color: ${this.darkMode ? '#8e8e8e' : 'rgba(0, 0, 0, 0.4)'};
          --kokoro-border-radius: 0;
        }
        .main-window {
          visibility: ${this.shouldShowSmallWindow ? 'hidden' : 'visible'};
        }
        .small-window {
          visibility: ${this.shouldShowSmallWindow ? 'visible' : 'hidden'};
          transform-origin: ${this.shrinkToLeft ? 'left' : 'right'} center;
        }
        .desktop-lyrics-window {
          height: ${this.desktopLyricsFontSize + 70}px;
        }
        .desktop-lyrics {
          background: ${this.desktopLyricsColorSchemes[this.desktopLyricsColorSchemeIndex]?.value};
          font-size: ${this.desktopLyricsFontSize}px;
        }
      </style>
      <div
        class="main-window ${this.darkMode ? 'dark' : ''} ${this.isConnected ? '' : 'disconnected'}"
        style="top: ${this.top}px; left: ${this.left}px"
      >
        <div class="handle-bar">
          <div
            class="move-handle ${this.dragging ? 'dragging' : ''}"
            @mousedown="${this.startDragging}"
            @touchstart="${this.startDragging}"
          ></div>
        </div>
        <div class="disconnected-panel ${this.isConnected ? 'hide' : ''}">
          Kokoro 播放器未连接
        </div>
        <div class="control-box ${this.isConnected ? '' : 'hide'}">
          <div class="control-panel panel ${this.isVolumeControlShown ? 'hide' : ''}">
            <a class="btn" @click="${() => { this.isDesktopLyricsShowing = !this.isDesktopLyricsShowing }}"
            ><i class="icon icon-lyrics${this.isDesktopLyricsShowing ? '-on' : ''}"></i></a>
            <a class="btn" @click="${this.nextPlayOrder}"><i class="icon icon-${this.playOrder === PLAY_ORDER_SINGLE
        ? 'solo' : this.playOrder === PLAY_ORDER_SHUFFLE ? 'shuffle' : 'loop'}"></i></a>
            <a class="btn" @click="${this.prev}"><i class="icon icon-previous"></i></a>
            <a class="btn play" @click="${this.togglePlay}"><i
              class="icon icon-${this.paused ? 'play' : 'pause'}-circle"
            ></i></a>
            <a class="btn" @click="${this.next}"><i class="icon icon-next"></i></a>
            <a class="btn" @click="${() => { this.isVolumeControlShown = !this.isVolumeControlShown }}"
            ><i class="icon icon-volume"></i></a>
            <a class="btn" @click="${this.togglePlaylist}"
            ><i class="icon icon-playlist"></i></a>
          </div>
          <div class="volume-playback-panel panel ${this.isVolumeControlShown ? '' : 'hide'}">
            <a class="btn volume"
               @mouseenter="${this.showVolumeTrack}"
               @mouseleave="${this.closeVolumeTrack}"
            >
              <i class="icon icon-volume"></i>
              <kokoro-track
                id="volume-track"
                .played="${this.player.volume}"
                .buffered="${[0, 1]}"
                @kokoro-change="${(e) => this.setVolume(e.detail.progress)}"
              ></kokoro-track>
            </a>
            <a class="volume-playback-panel-close"
               @click="${() => { this.isVolumeControlShown = !this.isVolumeControlShown }}"
            ><i class="icon icon-close"></i></a>
          </div>
          <kokoro-progress
            .played="${this.played}"
            .buffered="${this.buffered}"
            .currentTime="${this.playing.currentTime}"
            .totalTime="${this.playing.totalTime}"
            @kokoro-change="${(e) => { if (e.detail.commit) this.setCurrentProgress(e.detail.progress) }}"
          ></kokoro-progress>
        </div>
        <div class="cover-box ${this.isConnected ? '' : 'hide'}">
          ${this.currentSong ? html`
            <img src="${this.currentSong.cover}" />
          ` : ''}
        </div>
        <div class="lyrics-box ${this.isConnected ? '' : 'hide'}">
          <h1>${this.currentSong?.title}</h1>
          <h2>${this.currentSong?.artist}</h2>
        </div>
        <div class="playlist-panel ${this.isConnected && this.isPlaylistShowing ? '' : 'hide'}">
          <div class="playlist">
            ${this.playlist.map((song, index) => html`
              <div class="playlist-item-box" @click="${() => { this.setCurrentSong(song, index) }}">
                <div class="playlist-item ${this.isCurrentSong(song) ? 'current' : ''}">
                  <a class="remove" @click="${() => { this.removeSong(index) }}"
                  ><i class="icon icon-close"></i></a>
                  <div class="title">${song.title}</div>
                  <div class="artist">${song.artist} - ${song.album}</div>
                </div>
              </div>
            `)}
          </div>
          <a
            class="playlist-close"
            @click="${this.togglePlaylist}"
          ><i class="icon icon-close"></i></a>
          ${this.playlist.length ? html`
            <a
              class="playlist-clear"
              @click="${() => { this.clearPlaylist() }}"
            ><i class="icon icon-clear"></i></a>`
          : ''}
        </div>
        <div class="underlay ${this.isConnected ? '' : 'hide'}">
          <div class="background"></div>
          <div class="filter"></div>
        </div>
      </div>
      <div class="small-window ${
        this.isConnected && !this.paused ? 'spin-rev' : ''
      } ${this.darkMode ? 'dark' : ''} ${this.isConnected ? '' : 'disconnected'
      } ${this.dragging ? 'dragging' : ''}"
           style="top: ${this.top}px; ${this.shrinkToLeft
             ? `left: ${this.left}px;` : `right: ${this.right}px`}"
      >
        <div class="cover-box"></div>
        <div class="control-box">
          <a class="btn" @click="${this.togglePlay}"><i
            class="icon icon-${this.paused ? 'play' : 'pause'}"
          ></i></a>
          <a class="btn" @click="${this.next}"><i class="icon icon-next"></i></a>
          <a class="btn" @click="${this.prev}"><i class="icon icon-previous"></i></a>
          <a class="btn" @click="${() => { this.isDesktopLyricsShowing = !this.isDesktopLyricsShowing }}"
          ><i class="icon icon-lyrics${this.isDesktopLyricsShowing ? '-on' : ''}"></i></a>
          <div
            class="move-handle ${this.dragging ? 'dragging' : ''}"
            @mousedown="${this.startDragging}"
            @touchstart="${this.startDragging}"
          >
            <a class="btn"><i class="icon icon-note"></i></a>
            <div class="move-handle-bg"></div>
          </div>
        </div>
      </div>
      <div
        class="small-window-mobile ${this.shrinkToLeft
          ? 'left' : 'right'} ${this.darkMode ? 'dark' : ''}"
        style="top: ${this.top}px"
        @mousedown="${this.startDragging}"
        @touchstart="${this.startDragging}"
        @click="${this.toggleMainWindow}"
      >
        <i class="icon icon-note"></i>
      </div>
      <div
        class="main-window mobile ${this.darkMode ? 'dark' : ''
        } ${this.isConnected ? '' : 'disconnected'} ${this.shouldMobileShowMainWindow ? '' : 'hide'}"
      >
        <div class="disconnected-panel ${this.isConnected ? 'hide' : ''}">
          Kokoro 播放器未连接
          <a class="btn" @click="${this.toggleMainWindow}"><i class="icon icon-back"></i></a>
        </div>
        <div class="cover-box ${this.isConnected ? '' : 'hide'}">
          ${this.currentSong ? html`
            <img src="${this.currentSong.cover}" />
          ` : ''}
          <a class="btn" @click="${this.toggleMainWindow}"><i class="icon icon-back"></i></a>
        </div>
        <div class="lyrics-box ${this.isConnected ? '' : 'hide'}">
          <h1>${this.currentSong?.title}</h1>
          <h2>${this.currentSong?.artist}</h2>
        </div>
        <div class="control-box ${this.isConnected ? '' : 'hide'}">
          <div class="control-panel panel ${this.isVolumeControlShown ? 'hide' : ''}">
            <a class="btn" @click="${() => { this.isDesktopLyricsShowing = !this.isDesktopLyricsShowing }}"
            ><i class="icon icon-lyrics${this.isDesktopLyricsShowing ? '-on' : ''}"></i></a>
            <a class="btn" @click="${this.nextPlayOrder}"><i class="icon icon-${this.playOrder === PLAY_ORDER_SINGLE
      ? 'solo' : this.playOrder === PLAY_ORDER_SHUFFLE ? 'shuffle' : 'loop'}"></i></a>
            <a class="btn" @click="${this.prev}"><i class="icon icon-previous"></i></a>
            <a class="btn play" @click="${this.togglePlay}"><i
              class="icon icon-${this.paused ? 'play' : 'pause'}-circle"
            ></i></a>
            <a class="btn" @click="${this.next}"><i class="icon icon-next"></i></a>
            <a class="btn" @click="${() => { this.isVolumeControlShown = !this.isVolumeControlShown }}"
            ><i class="icon icon-volume"></i></a>
            <a class="btn" @click="${this.togglePlaylist}"
            ><i class="icon icon-playlist"></i></a>
          </div>
          <div class="volume-playback-panel panel ${this.isVolumeControlShown ? '' : 'hide'}">
            <a class="btn volume"
               @mouseenter="${this.showVolumeTrack}"
               @mouseleave="${this.closeVolumeTrack}"
            >
              <i class="icon icon-volume"></i>
              <kokoro-track
                id="volume-track"
                .played="${this.player.volume}"
                .buffered="${[0, 1]}"
                @kokoro-change="${(e) => this.setVolume(e.detail.progress)}"
              ></kokoro-track>
            </a>
            <a class="volume-playback-panel-close"
               @click="${() => { this.isVolumeControlShown = !this.isVolumeControlShown }}"
            ><i class="icon icon-close"></i></a>
          </div>
          <kokoro-progress
            .played="${this.played}"
            .buffered="${this.buffered}"
            .currentTime="${this.playing.currentTime}"
            .totalTime="${this.playing.totalTime}"
            @kokoro-change="${(e) => { if (e.detail.commit) this.setCurrentProgress(e.detail.progress) }}"
          ></kokoro-progress>
        </div>
        <div
          class="playlist-panel-mask ${this.isConnected && this.isPlaylistShowing ? '' : 'hide'}"
          @click="${this.togglePlaylist}"
        ></div>
        <div class="playlist-panel ${this.isConnected && this.isPlaylistShowing ? '' : 'hide'}">
          <div class="playlist">
            ${this.playlist.map((song, index) => html`
              <div class="playlist-item-box" @click="${() => { this.setCurrentSong(song, index) }}">
                <div class="playlist-item ${this.isCurrentSong(song) ? 'current' : ''}">
                  <a class="remove" @click="${() => { this.removeSong(index) }}"
                  ><i class="icon icon-close"></i></a>
                  <div class="title">${song.title}</div>
                  <div class="artist">${song.artist} - ${song.album}</div>
                </div>
              </div>
            `)}
          </div>
          <a
            class="playlist-close"
            @click="${this.togglePlaylist}"
          ><i class="icon icon-close"></i></a>
          ${this.playlist.length ? html`
            <a
              class="playlist-clear"
              @click="${() => { this.clearPlaylist() }}"
            ><i class="icon icon-clear"></i></a>`
      : ''}
        </div>
        <div class="underlay ${this.isConnected ? '' : 'hide'}">
          <div class="background"></div>
          <div class="filter"></div>
        </div>
      </div>
      <div
        id="desktop-lyrics-window"
        class="desktop-lyrics-window ${this.desktopLyricsDragging ? 'dragging' : ''
        } ${this.isDesktopLyricsShowing ? '' : 'hide'}"
        style="left: ${this.desktopLyricsHorizontalCenter}px; top: ${this.desktopLyricsVerticalCenter}px"
        @mousedown="${this.desktopLyricsStartDragging}"
        @touchstart="${this.desktopLyricsStartDragging}"
      >
        <div id="desktop-lyrics-panel" class="desktop-lyrics-panel">
          <span class="desktop-lyrics">${this.lyrics?.currentSentence}</span>
        </div>
        <div class="tool-bar">
          <a class="btn"><i class="icon icon-lock"></i></a>
          <a class="btn" @click="${this.prev}"><i class="icon icon-left"></i></a>
          <a class="btn" @click="${this.togglePlay}"
          ><i class="icon icon-${this.paused ? 'play' : 'pause'}"></i></a>
          <a class="btn" @click="${this.next}"><i class="icon icon-right"></i></a>
          <a class="btn" @click="${() => { if (this.desktopLyricsFontSize > 10) this.desktopLyricsFontSize -= 4 }}"
          ><i class="icon icon-font-smaller"></i></a>
          <a class="btn" @click="${() => { this.desktopLyricsFontSize += 4 }}"
          ><i class="icon icon-font-larger"></i></a>
          <a
            class="btn"
            title="${this.desktopLyricsColorSchemes[this.desktopLyricsColorSchemeIndex].name}"
            @click="${this.nextDesktopLyricsColorScheme}"
          >
            <i class="icon icon-font-color"></i>
            <i
              class="preview"
              style="background: ${this.desktopLyricsColorSchemes[this.desktopLyricsColorSchemeIndex].value}"
            ></i>
          </a>
        </div>
        <a 
          class="btn close"
          @click="${() => { this.isDesktopLyricsShowing = !this.isDesktopLyricsShowing }}"
        ><i class="icon icon-close"></i></a>
      </div>
    `
  }

  nextDesktopLyricsColorScheme () {
    if (this.desktopLyricsColorSchemeIndex + 1 === this.desktopLyricsColorSchemes.length) {
      this.desktopLyricsColorSchemeIndex = 0
    } else {
      this.desktopLyricsColorSchemeIndex++
    }
  }

  toggleMainWindow () {
    this.shouldMobileShowMainWindow = !this.shouldMobileShowMainWindow
    if (this.shouldMobileShowMainWindow) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  desktopLyricsStartDragging (e) {
    this.desktopLyricsDragging = true
    const e1 = (typeof window.TouchEvent !== 'undefined' && e instanceof window.TouchEvent)
      ? e.changedTouches[0]
      : e
    this.cursorX = e1.clientX
    this.cursorY = e1.clientY
    this.desktopLyricsDrag(e)
    if (e.type === 'mousedown') {
      document.addEventListener('mousemove', this.desktopLyricsDrag)
      document.addEventListener('mouseup', this.desktopLyricsStopDragging)
    }
    if (e.type === 'touchstart') {
      document.addEventListener('touchmove', this.desktopLyricsDrag, { passive: false })
      document.addEventListener('touchend', this.desktopLyricsStopDragging)
      document.addEventListener('touchcancel', this.desktopLyricsStopDragging)
    }
  }

  desktopLyricsDrag (e) {
    if (e.type === 'touchmove') e.preventDefault()
    e = (typeof window.TouchEvent !== 'undefined' && e instanceof window.TouchEvent)
      ? e.changedTouches[0]
      : e
    this.desktopLyricsHorizontalCenter += e.clientX - this.cursorX
    this.desktopLyricsVerticalCenter += e.clientY - this.cursorY
    this.cursorX = e.clientX
    this.cursorY = e.clientY
  }

  desktopLyricsStopDragging () {
    this.desktopLyricsDragging = false
    document.removeEventListener('mousemove', this.desktopLyricsDrag)
    document.removeEventListener('mouseup', this.desktopLyricsStopDragging)
    document.removeEventListener('touchmove', this.desktopLyricsDrag)
    document.removeEventListener('touchend', this.desktopLyricsStopDragging)
    document.removeEventListener('touchcancel', this.desktopLyricsStopDragging)
  }

  startDragging (e) {
    this.dragging = true
    const e1 = (typeof window.TouchEvent !== 'undefined' && e instanceof window.TouchEvent)
      ? e.changedTouches[0]
      : e
    this.cursorX = e1.clientX
    this.shrinkToLeft = this.cursorX < ((document.documentElement || document.body).clientWidth / 2)
    this.cursorY = e1.clientY
    this.drag(e)
    if (e.type === 'mousedown') {
      document.addEventListener('mousemove', this.drag)
      document.addEventListener('mouseup', this.stopDragging)
    }
    if (e.type === 'touchstart') {
      document.addEventListener('touchmove', this.drag, { passive: false })
      document.addEventListener('touchend', this.stopDragging)
      document.addEventListener('touchcancel', this.stopDragging)
    }
  }

  drag (e) {
    if (e.type === 'touchmove') e.preventDefault()
    e = (typeof window.TouchEvent !== 'undefined' && e instanceof window.TouchEvent)
      ? e.changedTouches[0]
      : e
    this.left += e.clientX - this.cursorX
    this.right -= e.clientX - this.cursorX
    this.top += e.clientY - this.cursorY
    this.cursorX = e.clientX
    this.shrinkToLeft = this.cursorX < ((document.documentElement || document.body).clientWidth / 2)
    this.cursorY = e.clientY
    if (this.isMobile) {
      this.shouldShowSmallWindow = true
      return
    }
    if (!this.shouldShowSmallWindow) {
      const ssw = this.left <= -62.5 || this.left >= (document.documentElement || document.body).clientWidth - 272.5
      if (ssw) {
        this.left = this.cursorX - 61
        this.top = this.cursorY - 61
        this.right = (document.documentElement || document.body).clientWidth - this.cursorX - 61
        this.shouldShowSmallWindow = true
      }
    } else {
      const ssw = this.left <= 65 || this.left >= (document.documentElement || document.body).clientWidth - 187
      if (!ssw) {
        this.left = this.cursorX - 167.5
        this.top = this.cursorY - 16
        this.shouldShowSmallWindow = false
      }
    }
  }

  stopDragging () {
    this.dragging = false
    if (this.top < 0) this.top = 0
    const bottomSafeArea = this.isMobile
      ? (document.documentElement || document.body).clientHeight - 20
      : this.shouldShowSmallWindow
        ? (document.documentElement || document.body).clientHeight - 122
        : (document.documentElement || document.body).clientHeight - 36
    if (this.top > bottomSafeArea) {
      this.top = bottomSafeArea
    }
    if (this.shouldShowSmallWindow && this.shrinkToLeft) {
      this.left = 0
      this.right = (document.documentElement || document.body).clientWidth - 122
    }
    if (this.shouldShowSmallWindow && !this.shrinkToLeft) {
      this.right = 0
      this.left = (document.documentElement || document.body).clientWidth - 122
    }
    document.removeEventListener('mousemove', this.drag)
    document.removeEventListener('mouseup', this.stopDragging)
    document.removeEventListener('touchmove', this.drag)
    document.removeEventListener('touchend', this.stopDragging)
    document.removeEventListener('touchcancel', this.stopDragging)
  }

  togglePlaylist () {
    this.isPlaylistShowing = !this.isPlaylistShowing
    const selector = this.isMobile ? '.mobile .playlist' : '.playlist'
    if (this.isPlaylistShowing && typeof this.index === 'number') {
      if (this.index === 0) {
        this.shadowRoot.querySelector(selector).scrollTop = 0
      } else {
        this.shadowRoot.querySelector(`${selector} > .playlist-item-box:nth-child(${this.index})`)
          .scrollIntoView(true)
      }
    }
  }

  setCurrentSong (song, index) {
    if (this.isCurrentSong(song)) return
    this.context.kokoro?.setCurrentSong(index)
  }

  removeSong (index) {
    this.context.kokoro?.removeSong(index)
  }

  clearPlaylist () {
    this.context.kokoro?.clearPlaylist()
  }

  prev () {
    this.context.kokoro?.previous()
  }

  next () {
    this.context.kokoro?.next()
  }

  togglePlay () {
    this.context.kokoro?.togglePlay()
  }

  nextPlayOrder () {
    this.context.kokoro?.nextPlayOrder()
  }

  setCurrentProgress (progress) {
    this.context.kokoro?.setCurrentTime(progress * this.playing.totalTime)
  }

  setVolume (volume) {
    this.context.kokoro?.setVolume(volume)
  }
}

const parseLrcLyrics = (function () {
  let originalLyrics = null
  let originalTranslationLyrics = null
  let parsedLyrics = null
  let parsedTranslationLyrics = null
  let lrcRunner
  let translationLrcRunner
  return (lyrics, time, totalTime, lang) => {
    if (!lyrics) return null
    if (!originalLyrics || lyrics.value !== originalLyrics) {
      originalLyrics = lyrics.value
      parsedLyrics = Lrc.parse(lyrics.value)
      parsedLyrics.lyrics.sort((a, b) => (a.timestamp - b.timestamp))
      lrcRunner = new Runner(parsedLyrics)
    }
    if (lang && lyrics.translations) {
      const transLyrics = lyrics.translations.find((l) => l.lang === lang)
      if (transLyrics && transLyrics.value !== originalTranslationLyrics) {
        originalTranslationLyrics = transLyrics.value
        parsedTranslationLyrics = Lrc.parse(transLyrics.value)
        parsedTranslationLyrics.lyrics.sort((a, b) => (a.timestamp - b.timestamp))
        translationLrcRunner = new Runner(parsedTranslationLyrics)
      }
    }
    lrcRunner.timeUpdate(time)
    if (translationLrcRunner) translationLrcRunner.timeUpdate(time)
    const currentLyric = lrcRunner.curLyric()
    let nextLyric
    if (lrcRunner.curIndex() + 1 >= parsedLyrics.lyrics.length) {
      nextLyric = { timestamp: totalTime, content: '' }
    } else {
      nextLyric = lrcRunner.getLyric(lrcRunner.curIndex() + 1)
    }
    return {
      lyrics: parsedLyrics,
      currentSentence: currentLyric.content,
      currentSentenceStart: currentLyric.timestamp,
      currentSentenceEnd: nextLyric.timestamp,
      currentSentenceTranslation: translationLrcRunner ? translationLrcRunner.curLyric() : null,
      nextSentence: nextLyric.content,
      nextSentenceTranslation: translationLrcRunner
        ? translationLrcRunner.curIndex() + 1 >= parsedTranslationLyrics.lyrics.length
          ? '' : translationLrcRunner.getLyric(translationLrcRunner.curIndex() + 1)
        : null
    }
  }
})()

const parseLyrics = (lyrics, currentTime, totalTime, lang, pnKind) => {
  if (!lyrics) return null
  if (lyrics.type === 'lrc') {
    return parseLrcLyrics(lyrics, currentTime, totalTime, lang)
  }
  console.error(`Unsupported lyrics type: ${lyrics.type}`)
  return null
}

const getLangAvailable = (lyrics) => {
  if (!lyrics) return null
  if (lyrics.type === 'lrc') {
    if (!lyrics.translations) return []
    return lyrics.translations.map((t) => t.lang)
  }
  console.error(`Unsupported lyrics type: ${lyrics.type}`)
  return []
}

const mapStateToProps = (state) => {
  return {
    currentSong: state.playing.song,
    lyrics: parseLyrics(state.playing.song.lyrics,
      state.playing.currentTime, state.playing.totalTime),
    langAvailable: getLangAvailable(state.playing.song.lyrics),
    pnKindAvailable: [],
    index: state.playlist.orderedIndexOfPlaying,
    playlist: state.playlist.orderedList.map((id) => state.playlist.songs[id]),
    playing: state.playing,
    player: state.player,
    played: state.playing.currentTime / state.playing.totalTime,
    buffered: state.playing.bufferedTime?.map(
      (buf) => [buf[0] / state.playing.totalTime, buf[1] / state.playing.totalTime]
    ),
    playOrder: state.playlist.playOrder
  }
}

const KokoroPlayer = connect(mapStateToProps)(Player)
window.customElements.define('kokoro-player', KokoroPlayer)
export default KokoroPlayer
