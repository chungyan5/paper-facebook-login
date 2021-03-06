/**
Element for including a Facebook Login button
After including the button the FB object is at a global scope and
can be used for API calls.

Example:
```
<custom-style>
    <style>
      #fbLogin {
        --paper-facebook-login: {
          background-color: #303c46;
          border-radius: 25px;
        }
      }
    </style>
</custom-style>
<paper-facebook-login id="fbLogin" text="login"></paper-facebook-login>
```

### Styling

Style the buttons with CSS as you would a normal DOM element.

The following custom properties and mixins are available:

Custom property | Description | Default
----------------|-------------|----------
`--paper-facebook-login` | Mixin applied on the button | `{}`
`--paper-facebook-login-icon` | Mixin applied on the icon | `{}`
`--paper-facebook-login-text` | Mixin applied on the text | `{}`

@customElement
@element paper-facebook-login
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '@polymer/paper-button/paper-button.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
class PaperFacebookLogin extends PolymerElement {
  static get template() {
    return html`
        <style>
            paper-button#fbLogin {
                background-color: #3b5998;
                color: #f7f7f7;
                text-align: left;
                text-transform: none;
                min-height: 40px;
                display: grid;
                grid-template-columns: 5% 95%;
                grid-template-areas: "svg span";
                @apply(--paper-facebook-login);
            }
            svg {
                padding: 1%;
                margin-left: 5px;
                width: 100%;
                fill: white;
                grid-area: svg;

                @apply(--paper-facebook-login-icon);
            }
            span {
                text-align: center;
                width: 100%;
                position: relative;
                grid-area: span;

                @apply(--paper-facebook-login-text);
            }
        </style>
        <paper-button id="fbLogin" raised="" on-click="login" disabled\$="[[loading]]">
            <svg viewBox="0 0 7.94 16.74">
                <path d="M5.39,16.79H2.29V8.52H0.22V5.67H2.29V4c0-2.32.63-3.74,3.37-3.74H7.94V3.1H6.51c-1.07,0-1.12.4-1.12,1.14V5.67H8L7.65,8.52H5.39v8.27Z" transform="translate(-0.12 -0.15)" style="stroke:#000;stroke-miterlimit:10;stroke-width:0.20000000298023224px"></path>
            </svg>
            <span>[[text]]</span>
        </paper-button>
`;
  }

  static get is() {
      return 'paper-facebook-login';
  }

  static get properties() {
      return {
          /** The language of the button. */
          language: {
              type: String,
              value: 'en_US'
          },
          /** The app ID of your Facebook app. Create one at https://developers.facebook.com/apps/ */
          appId: {
              type: String,
              value: ''
          },
          /** The `version` attribute specifies which FB API version should be used. Example 'v3.0'. */
          version: {
              type: String,
              value: 'v6.0'
          },
          /** The button text to display */
          text: {
              type: String,
              value: 'Sign-in with Facebook'
          },
          /** if true, don't wait for user input to query facebook */
          autoConnect: {
              type: Boolean,
              value: false
          },
          /** The loading state of login */
          loading: {
              type: Boolean,
              value: false
          },
          /** Whether you want to set a cookie in order to allow the server to access the session. */
          cookie: {
              type: Boolean,
              value: true
          },
          /** The user object as returned by Facebook graphApi */
          user: {
              type: Object,
              notify: true
          },
          /** The scope that you want access to.
           * (see https://developers.facebook.com/docs/facebook-login/permissions/v3.0). Should be space delimited */
          scope: {
              type: String,
              value: "email"
          },
          /** Set to true to log some debug info to the console */
          debug: {
              type: Boolean,
              value: false
          }
      };
  }

  connectedCallback() {
      super.connectedCallback();
      if (!this.appId) {
          console.error("Missing attribute appId for paper-facebook-login");
          return;
      }
      window.fbAsyncInit = () => {
          FB.init({
              appId: this.get('appId'),
              status: true,
              cookie: this.get('cookie'),
              autoLogAppEvents: true,
              xfbml: true,
              version: this.get('version')
          });
          if (this.get('autoConnect'))
              FB.getLoginStatus(res => this._statusChanged(res), e => console.log(e));
      };
      if (!window.FB) {
          ((d, s, id) => {
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {return;}
              js = d.createElement(s); js.id = id;
              js.src = `https://connect.facebook.net/${this.get('language') || 'en_US'}/sdk.js`;
              fjs.parentNode.insertBefore(js, fjs);
          })(document, 'script', 'facebook-jssdk');
      }
  }

  /** Called when user connection status changed
   * @private
   * @param {Event} response the user object */
  _statusChanged(response) {
      this.set('loading', false);
      let fields = this.get('scope').split(',').map(x => x.replace('user_', ''))
          .concat(['id', 'picture', 'last_name', 'first_name']).join(',');
      if (response.status === 'connected') {
          FB.api(`/me?fields=${fields}`, response => {
              if (response.error) {
                  if (this.debug) console.error('error', response.error.message);
              } else {
                  if (this.debug) console.info('success', response);
                      this.set('user', Object.assign({ token: FB.getAccessToken() }, response));
                  this.dispatchEvent(new CustomEvent('facebook-user-connected', {
                      detail: {
                          user: this.get('user')
                      }
                  }));
              }
          });
      } else if (response.status === 'not_authorized') {
          if (this.debug) console.warn('not_authorized', response);
      } else {
          if (this.debug) console.error('error', response);
      }
  }

  /** Used to log the user in the current app */
  login() {
      if (this.debug) console.info(this.scope);
      this.set('loading', true);
      FB.login(res => this._statusChanged(res), {scope: this.get('scope')});
  }

  /** Used to logout the user in the current app */
  logout() {
      FB.logout();
  }
}

customElements.define(PaperFacebookLogin.is, PaperFacebookLogin);
