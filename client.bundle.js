webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="typings/tsd.d.ts" />
	var react = __webpack_require__(2);
	var react_router = __webpack_require__(9);
	var data_source = __webpack_require__(5);
	var routes = __webpack_require__(6);
	__webpack_require__(8);
	function init(payload) {
	    var componentLoader = new ComponentLoader();
	    var jsonData = payload;
	    var appData = new data_source.DataSource(componentLoader, jsonData.config, jsonData.posts, jsonData.tags);
	    var appElement = document.getElementById('app');
	    react_router.run(routes.rootRoute, react_router.HistoryLocation, function (handler, state) {
	        var props = routes.fetchRouteProps(appData, state);
	        react.render(react.createElement(handler, props), appElement);
	    });
	}
	var ComponentLoader = (function () {
	    function ComponentLoader() {
	        this.catalog = __webpack_require__(1);
	    }
	    ComponentLoader.prototype.load = function (name) {
	        if (!this.catalog[name]) {
	            console.error("Unknown component: " + name + ". Available components: " + Object.keys(this.catalog));
	            // fallback to a placeholder
	            return null;
	        }
	        return this.catalog[name];
	    };
	    return ComponentLoader;
	})();
	window.fetch(appRoot + "/data.json").then(function (res) {
	    return res.json();
	}).catch(function (err) {
	    console.error("Failed to load route data file: " + err);
	    return {};
	}).then(function (json) {
	    if (!json) {
	        return;
	    }
	    init(json);
	});


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var react = __webpack_require__(2);
	var components = __webpack_require__(10);
	var scanner = __webpack_require__(11);
	/** DataSource provides the data required to render the various
	  * routes.
	  */
	var DataSource = (function () {
	    function DataSource(componentLoader, config, posts, tags) {
	        this.componentLoader = componentLoader;
	        this.config = config;
	        this.posts = posts;
	        this.tags = tags;
	    }
	    DataSource.prototype.convertPostExtract = function (post) {
	        var snippetMarkdown = scanner.extractSnippet(post.body);
	        var snippetJs = components.convertMarkdownToReactJs(snippetMarkdown);
	        var snippetComponent = components.reactComponentFromSource(snippetJs, this.componentLoader);
	        return {
	            title: post.metadata.title,
	            date: new Date(post.metadata.date),
	            snippet: react.createElement(snippetComponent),
	            url: scanner.postUrl(this.config, post.metadata)
	        };
	    };
	    DataSource.prototype.convertPost = function (post) {
	        var _this = this;
	        var contentJs = components.convertMarkdownToReactJs(post.body);
	        var postComponent = components.reactComponentFromSource(contentJs, this.componentLoader);
	        return {
	            title: post.metadata.title,
	            date: new Date(post.metadata.date),
	            tags: post.metadata.tags.map(function (tag) {
	                return {
	                    tag: tag,
	                    indexUrl: _this.config.rootUrl + "/posts/tagged/" + tag
	                };
	            }),
	            url: scanner.postUrl(this.config, post.metadata),
	            children: [react.createElement(postComponent, { key: 'post' })]
	        };
	    };
	    DataSource.prototype.recentPosts = function (count) {
	        var _this = this;
	        return this.posts.map(function (post) { return _this.convertPostExtract(post); });
	    };
	    DataSource.prototype.taggedPosts = function (tag) {
	        var _this = this;
	        return this.tags[tag].map(function (post) { return _this.convertPostExtract(post); });
	    };
	    DataSource.prototype.fetchPost = function (id) {
	        var matches = this.posts.filter(function (post) { return post.metadata.slug === id; });
	        if (matches.length > 0) {
	            return this.convertPost(matches[0]);
	        }
	        else {
	            return null;
	        }
	    };
	    DataSource.prototype.fetchHeaderInfo = function () {
	        return {
	            name: this.config.author.name,
	            photoUrl: this.config.author.photoUrl,
	            socialLinks: {
	                twitter: this.config.author.twitterId,
	                github: this.config.author.githubId,
	                email: this.config.author.email
	            },
	            rootUrl: this.config.rootUrl
	        };
	    };
	    return DataSource;
	})();
	exports.DataSource = DataSource;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var assign = __webpack_require__(15);
	var react = __webpack_require__(2);
	var react_router = __webpack_require__(9);
	var header_view = __webpack_require__(12);
	var post_view = __webpack_require__(13);
	var post_list_view = __webpack_require__(14);
	function fetchRouteProps(data, state) {
	    // gather all of the data that this route requires
	    var routeData = {
	        params: state.params,
	        title: ''
	    };
	    state.routes.forEach(function (route) {
	        var handler = route.handler;
	        if (handler.fetchData) {
	            // currently assumes that fetchData() returns a result
	            // immediately. In future we may want to expand this
	            // to allow promises
	            var result = handler.fetchData(data, state.params);
	            assign(routeData, result);
	        }
	    });
	    return routeData;
	}
	exports.fetchRouteProps = fetchRouteProps;
	var BlogRoute = (function (_super) {
	    __extends(BlogRoute, _super);
	    function BlogRoute() {
	        _super.apply(this, arguments);
	    }
	    BlogRoute.fetchData = function (model) {
	        var headerInfo = model.fetchHeaderInfo();
	        return {
	            title: headerInfo.name,
	            header: headerInfo
	        };
	    };
	    BlogRoute.prototype.render = function () {
	        return react.DOM.div({}, header_view.HeaderF(this.props.header), react.createElement(react_router.RouteHandler, this.props));
	    };
	    return BlogRoute;
	})(react.Component);
	var PostRoute = (function (_super) {
	    __extends(PostRoute, _super);
	    function PostRoute() {
	        _super.apply(this, arguments);
	    }
	    PostRoute.fetchData = function (model, params) {
	        var post = model.fetchPost(params.postId);
	        return {
	            title: post.title,
	            post: post
	        };
	    };
	    PostRoute.prototype.render = function () {
	        return post_view.PostF(this.props.post);
	    };
	    return PostRoute;
	})(react.Component);
	var PostListRoute = (function (_super) {
	    __extends(PostListRoute, _super);
	    function PostListRoute() {
	        _super.apply(this, arguments);
	    }
	    PostListRoute.fetchData = function (model) {
	        return {
	            posts: model.recentPosts(10)
	        };
	    };
	    PostListRoute.prototype.render = function () {
	        return post_list_view.PostListF({
	            posts: this.props.posts
	        });
	    };
	    return PostListRoute;
	})(react.Component);
	var TaggedPostsRoute = (function (_super) {
	    __extends(TaggedPostsRoute, _super);
	    function TaggedPostsRoute() {
	        _super.apply(this, arguments);
	    }
	    TaggedPostsRoute.fetchData = function (model, params) {
	        return {
	            title: "Posts tagged " + params.tag,
	            posts: model.taggedPosts(params.tag)
	        };
	    };
	    TaggedPostsRoute.prototype.render = function () {
	        return post_list_view.PostListF({
	            posts: this.props.posts
	        });
	    };
	    return TaggedPostsRoute;
	})(react.Component);
	var RouteF = react.createFactory(react_router.Route);
	var DefaultRouteF = react.createFactory(react_router.DefaultRoute);
	exports.rootRoute = RouteF({ name: 'home', path: '/', handler: BlogRoute }, 
	// note: The trailing slash is needed for statically generated routes
	// where the file structure of the static content is
	// '/route/path/index.html'.
	// When following a link to '/route/path' the browser will convert that
	// to '/route/path/' (note trailing slash)
	RouteF({ name: 'post', path: '/posts/:postId/?', handler: PostRoute }), RouteF({ name: 'tagged', path: '/posts/tagged/:tag/?', handler: TaggedPostsRoute }), DefaultRouteF({ handler: PostListRoute }));


/***/ },
/* 7 */,
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  'use strict';

	  if (self.fetch) {
	    return
	  }

	  function Headers(headers) {
	    this.map = {}

	    var self = this
	    if (headers instanceof Headers) {
	      headers.forEach(function(name, values) {
	        values.forEach(function(value) {
	          self.append(name, value)
	        })
	      })

	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        self.append(name, headers[name])
	      })
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = name.toLowerCase()
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[name.toLowerCase()]
	  }

	  Headers.prototype.get = function(name) {
	    var values = this.map[name.toLowerCase()]
	    return values ? values[0] : null
	  }

	  Headers.prototype.getAll = function(name) {
	    return this.map[name.toLowerCase()] || []
	  }

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(name.toLowerCase())
	  }

	  Headers.prototype.set = function(name, value) {
	    this.map[name.toLowerCase()] = [value]
	  }

	  // Instead of iterable for now.
	  Headers.prototype.forEach = function(callback) {
	    var self = this
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      callback(name, self.map[name])
	    })
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }

	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self
	  }

	  function Body() {
	    this.bodyUsed = false

	    if (support.blob) {
	      this._initBody = function(body) {
	        this._bodyInit = body
	        if (typeof body === 'string') {
	          this._bodyText = body
	        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	          this._bodyBlob = body
	        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	          this._bodyFormData = body
	        } else if (!body) {
	          this._bodyText = ''
	        } else {
	          throw new Error('unsupported BodyInit type')
	        }
	      }

	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }

	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }

	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this._initBody = function(body) {
	        this._bodyInit = body
	        if (typeof body === 'string') {
	          this._bodyText = body
	        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	          this._bodyFormData = body
	        } else if (!body) {
	          this._bodyText = ''
	        } else {
	          throw new Error('unsupported BodyInit type')
	        }
	      }

	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(url, options) {
	    options = options || {}
	    this.url = url

	    this.credentials = options.credentials || 'omit'
	    this.headers = new Headers(options.headers)
	    this.method = normalizeMethod(options.method || 'GET')
	    this.mode = options.mode || null
	    this.referrer = null

	    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(options.body)
	  }

	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }

	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }

	  Request.prototype.fetch = function() {
	    var self = this

	    return new Promise(function(resolve, reject) {
	      var xhr = new XMLHttpRequest()
	      if (self.credentials === 'cors') {
	        xhr.withCredentials = true;
	      }

	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }

	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }

	        return;
	      }

	      xhr.onload = function() {
	        var status = (xhr.status === 1223) ? 204 : xhr.status
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'))
	          return
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options))
	      }

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }

	      xhr.open(self.method, self.url, true)
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }

	      self.headers.forEach(function(name, values) {
	        values.forEach(function(value) {
	          xhr.setRequestHeader(name, value)
	        })
	      })

	      xhr.send(typeof self._bodyInit === 'undefined' ? null : self._bodyInit)
	    })
	  }

	  Body.call(Request.prototype)

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }

	    this._initBody(bodyInit)
	    this.type = 'default'
	    this.url = null
	    this.status = options.status
	    this.statusText = options.statusText
	    this.headers = options.headers
	    this.url = options.url || ''
	  }

	  Body.call(Response.prototype)

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function (url, options) {
	    return new Request(url, options).fetch()
	  }
	  self.fetch.polyfill = true
	})();


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.DefaultRoute = __webpack_require__(37);
	exports.Link = __webpack_require__(38);
	exports.NotFoundRoute = __webpack_require__(39);
	exports.Redirect = __webpack_require__(40);
	exports.Route = __webpack_require__(41);
	exports.RouteHandler = __webpack_require__(42);

	exports.HashLocation = __webpack_require__(43);
	exports.HistoryLocation = __webpack_require__(44);
	exports.RefreshLocation = __webpack_require__(45);
	exports.StaticLocation = __webpack_require__(46);
	exports.TestLocation = __webpack_require__(47);

	exports.ImitateBrowserBehavior = __webpack_require__(48);
	exports.ScrollToTopBehavior = __webpack_require__(49);

	exports.History = __webpack_require__(50);
	exports.Navigation = __webpack_require__(51);
	exports.State = __webpack_require__(52);

	exports.createRoute = __webpack_require__(53).createRoute;
	exports.createDefaultRoute = __webpack_require__(53).createDefaultRoute;
	exports.createNotFoundRoute = __webpack_require__(53).createNotFoundRoute;
	exports.createRedirect = __webpack_require__(53).createRedirect;
	exports.createRoutesFromReactChildren = __webpack_require__(54);
	exports.create = __webpack_require__(55);
	exports.run = __webpack_require__(56);

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var marked = __webpack_require__(126);
	var react = __webpack_require__(2);
	var react_tools = __webpack_require__(127);
	function convertMarkdownToReactJs(content) {
	    var jsx = marked(content.toString(), {});
	    jsx = '<div>' + jsx + '</div>';
	    var js = 'return ' + react_tools.transform(jsx);
	    return js;
	}
	exports.convertMarkdownToReactJs = convertMarkdownToReactJs;
	function requiredComponentNames(contentSource) {
	    var componentRegex = /React.createElement\(([A-z][A-Za-z]+)/g;
	    var match = componentRegex.exec(contentSource);
	    var componentNames = [];
	    while (match != null) {
	        var componentClass = match[1];
	        componentNames.push(componentClass);
	        match = componentRegex.exec(contentSource);
	    }
	    return componentNames;
	}
	// takes the JS source for an expression which returns a React Element
	// and evaluates it to create a React component with a render() function
	// which returns the result
	function reactComponentFromSource(renderSource, loader) {
	    var componentNames = requiredComponentNames(renderSource);
	    var components = [];
	    // load components required by the post
	    componentNames.forEach(function (name) {
	        components.push(loader.load(name));
	    });
	    // create a semi-sandbox for running the post-generating
	    // code
	    var args = ['React'].concat(componentNames);
	    var renderFunc = Function.apply({}, args.concat(renderSource));
	    var postComponent = react.createClass({
	        render: function () {
	            return renderFunc.apply({}, [react].concat(components));
	        }
	    });
	    return postComponent;
	}
	exports.reactComponentFromSource = reactComponentFromSource;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="typings/tsd.d.ts" />
	var path = __webpack_require__(60);
	var js_yaml = __webpack_require__(61);
	function extractSnippet(content) {
	    var idealLength = 400;
	    var snippet = '';
	    var paragraphs = content.split(/\n\s*\n/);
	    var paragraphIndex = 0;
	    while (snippet.length < idealLength && paragraphIndex < paragraphs.length) {
	        if (snippet.length == 0) {
	            snippet += '\n\n';
	        }
	        snippet += paragraphs[paragraphIndex];
	        ++paragraphIndex;
	    }
	    return snippet;
	}
	exports.extractSnippet = extractSnippet;
	function postUrl(config, post) {
	    return config.rootUrl + "/posts/" + post.slug;
	}
	exports.postUrl = postUrl;
	function parsePostContent(filename, markdown) {
	    var yamlMatcher = /^\s*---\n([^]*)---\n/;
	    var yamlMatch = markdown.match(yamlMatcher);
	    if (!yamlMatch) {
	        throw new Error('Post is missing YAML metadata section');
	    }
	    var metadataDoc = js_yaml.safeLoad(yamlMatch[1]);
	    if (!metadataDoc.title) {
	        throw new Error('Missing metadata field: title');
	    }
	    if (!metadataDoc.date) {
	        throw new Error('Missing metadata field: date');
	    }
	    metadataDoc.tags = metadataDoc.tags || '';
	    return {
	        metadata: {
	            slug: path.basename(filename, '.md'),
	            title: metadataDoc.title,
	            date: metadataDoc.date,
	            tags: metadataDoc.tags.split(',').map(function (tag) {
	                return tag.trim();
	            })
	        },
	        body: markdown.slice(yamlMatch[0].length)
	    };
	}
	exports.parsePostContent = parsePostContent;
	function generateTagMap(posts) {
	    var tagMap = {};
	    posts.forEach(function (post) {
	        post.metadata.tags.forEach(function (tag) {
	            if (!tagMap[tag]) {
	                tagMap[tag] = [];
	            }
	            tagMap[tag].push(post);
	        });
	    });
	    return tagMap;
	}
	exports.generateTagMap = generateTagMap;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__filename) {var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var react = __webpack_require__(2);
	var style = __webpack_require__(128);
	var TEXT_COLOR = '#eee';
	var SOCIAL_LOGO_HEIGHT = 22;
	var theme = style.create({
	    topBanner: {
	        backgroundColor: '#444',
	        color: TEXT_COLOR,
	        display: 'flex',
	        flexDirection: 'row',
	        alignContent: 'center',
	        borderBottom: '1px solid #ddd',
	        padding: 5,
	        paddingTop: 10,
	        paddingBottom: 10,
	        ' a': {
	            textDecoration: 'none',
	            color: TEXT_COLOR
	        }
	    },
	    name: {
	        fontSize: 18,
	        lineHeight: SOCIAL_LOGO_HEIGHT + 'px'
	    },
	    sectionSeparator: {
	        display: 'inline-block',
	        borderLeft: '1px solid #bbb',
	        marginLeft: 10,
	        marginRight: 10
	    },
	    socialLinkImage: {
	        height: SOCIAL_LOGO_HEIGHT,
	        marginLeft: 5,
	        marginRight: 5,
	        opacity: 0.7,
	        zIndex: 1,
	        // FIXME: The GitHub logo looks awful during the hover transition
	        // because anti-aliasing is lost
	        transition: 'opacity .3s ease-in',
	        ':hover': {
	            opacity: 1.0
	        }
	    }
	}, __filename);
	function twitterUrl(id) {
	    return "https://twitter.com/" + id;
	}
	function githubUrl(id) {
	    return "https://github.com/" + id;
	}
	function mailLink(email) {
	    return "mailto:" + email;
	}
	/** Header displayed at the top of the blog with author
	  * details.
	  */
	var Header = (function (_super) {
	    __extends(Header, _super);
	    function Header() {
	        _super.apply(this, arguments);
	    }
	    Header.prototype.imageUrl = function (name) {
	        return this.props.rootUrl + "/theme/" + name + ".png";
	    };
	    Header.prototype.renderSocialLink = function (id, url, image) {
	        var imgSrc = this.props.rootUrl + "/theme/images/" + image + ".png";
	        return react.DOM.a({
	            href: url,
	            key: id
	        }, react.DOM.img(style.mixin(theme.socialLinkImage, { src: imgSrc })));
	    };
	    Header.prototype.render = function () {
	        var socialLinks = [];
	        if (this.props.socialLinks.twitter) {
	            socialLinks.push(this.renderSocialLink('twitter', twitterUrl(this.props.socialLinks.twitter), 'twitter-white'));
	        }
	        if (this.props.socialLinks.github) {
	            socialLinks.push(this.renderSocialLink('github', githubUrl(this.props.socialLinks.github), 'github-white-120x120'));
	        }
	        if (this.props.socialLinks.email) {
	            socialLinks.push(this.renderSocialLink('email', mailLink(this.props.socialLinks.email), 'email-48x38'));
	        }
	        return react.DOM.div(style.mixin(theme.topBanner), react.DOM.span(style.mixin(theme.name), react.DOM.a({ href: this.props.rootUrl + '/' }, this.props.name)), react.DOM.span(style.mixin(theme.sectionSeparator)), socialLinks);
	    };
	    return Header;
	})(react.Component);
	exports.Header = Header;
	exports.HeaderF = react.createFactory(Header);

	/* WEBPACK VAR INJECTION */}.call(exports, "views/header.js"))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var react = __webpack_require__(2);
	var style = __webpack_require__(128);
	var typography = __webpack_require__(57);
	var shared_theme = __webpack_require__(58);
	var theme = style.create({
	    post: {
	        mixins: [shared_theme.content],
	        fontFamily: 'Ubuntu',
	        tagList: {
	            marginTop: 10,
	            marginBottom: 5,
	            tag: {
	                display: 'inline-block',
	                textDecoration: 'none',
	                borderRadius: 3,
	                border: '1px solid #ccc',
	                color: '#aaa',
	                transition: 'background-color .2s ease-in',
	                padding: 5,
	                paddingTop: 2,
	                paddingBottom: 2,
	                cursor: 'pointer',
	                ':hover': {
	                    backgroundColor: '#eee'
	                }
	            }
	        },
	        title: {
	            mixins: [typography.theme.fonts.title],
	            display: 'block',
	            marginBottom: 10,
	            textDecoration: 'none'
	        },
	        date: {
	            mixins: [typography.theme.fonts.date]
	        },
	        content: {
	            mixins: [typography.theme.fonts.articleBody],
	            marginTop: 30,
	            marginBottom: 30
	        }
	    },
	    commentBox: {
	        marginTop: 30
	    }
	});
	var DisqusCommentList = (function (_super) {
	    __extends(DisqusCommentList, _super);
	    function DisqusCommentList() {
	        _super.apply(this, arguments);
	    }
	    DisqusCommentList.prototype.render = function () {
	        var scriptSrc = 'https://' + this.props.shortName + '.disqus.com/embed.js';
	        return react.DOM.div(style.mixin(theme.commentBox), react.DOM.div({ id: 'disqus_thread' }), react.DOM.script({
	            src: scriptSrc,
	            async: true,
	            type: 'text/javascript'
	        }));
	    };
	    return DisqusCommentList;
	})(react.Component);
	var DisqusCommentListF = react.createFactory(DisqusCommentList);
	var Post = (function (_super) {
	    __extends(Post, _super);
	    function Post() {
	        _super.apply(this, arguments);
	    }
	    Post.prototype.render = function () {
	        return react.DOM.div(style.mixin(theme.post), react.DOM.a(style.mixin(theme.post.title, {
	            href: this.props.url
	        }), this.props.title), react.DOM.div(style.mixin(theme.post.date), this.props.date.toDateString()), this.renderTagList(), react.DOM.div(style.mixin(theme.post.content), this.props.children), DisqusCommentListF({ shortName: 'robertknight' }));
	    };
	    Post.prototype.renderTagList = function () {
	        return react.DOM.div(style.mixin(theme.post.tagList), this.props.tags.map(function (tagEntry) {
	            return react.DOM.a(style.mixin(theme.post.tagList.tag, {
	                href: tagEntry.indexUrl,
	                key: "tag-" + tagEntry.tag,
	            }), tagEntry.tag);
	        }));
	    };
	    return Post;
	})(react.Component);
	exports.Post = Post;
	exports.PostF = react.createFactory(Post);


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var react = __webpack_require__(2);
	var react_router = __webpack_require__(9);
	var style = __webpack_require__(128);
	var typography = __webpack_require__(57);
	var shared_theme = __webpack_require__(58);
	var theme = style.create({
	    postList: {
	        mixins: [shared_theme.content],
	        entry: {
	            title: {
	                mixins: [typography.theme.fonts.title],
	                display: 'block',
	                textDecoration: 'none',
	                marginBottom: 5
	            },
	            date: {
	                mixins: [typography.theme.fonts.date]
	            },
	            snippet: {
	                mixins: [typography.theme.fonts.articleBody]
	            }
	        },
	        entrySeparator: {
	            borderBottom: '1px solid #ccc',
	            paddingBottom: 30,
	            marginBottom: 30
	        },
	        readMoreLink: {
	            display: 'inline-block',
	            textDecoration: 'none',
	            borderRadius: 10,
	            border: '1px solid #ccc',
	            padding: 5,
	            paddingLeft: 15,
	            paddingRight: 15,
	            transition: 'background-color .2s ease-in',
	            ':hover': {
	                backgroundColor: '#eee',
	            }
	        }
	    }
	});
	var LinkF = react.createFactory(react_router.Link);
	var PostList = (function (_super) {
	    __extends(PostList, _super);
	    function PostList() {
	        _super.apply(this, arguments);
	    }
	    PostList.prototype.render = function () {
	        var _this = this;
	        var posts = this.props.posts.map(function (post, index) {
	            var postStyles = [theme.postList.entry];
	            if (index < _this.props.posts.length - 1) {
	                postStyles.push(theme.postList.entrySeparator);
	            }
	            return react.DOM.div(style.mixin(postStyles, {
	                key: post.title
	            }), LinkF(style.mixin(theme.postList.entry.title, {
	                to: post.url
	            }), post.title), react.DOM.div(style.mixin(theme.postList.entry.date), post.date.toDateString()), react.DOM.div(style.mixin(theme.postList.entry.snippet), post.snippet), LinkF(style.mixin(theme.postList.readMoreLink, {
	                to: post.url
	            }), 'Continue reading →'));
	        });
	        return react.DOM.div(style.mixin(theme.postList), posts);
	    };
	    return PostList;
	})(react.Component);
	exports.PostList = PostList;
	exports.PostListF = react.createFactory(PostList);


/***/ },
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var PropTypes = __webpack_require__(129);
	var RouteHandler = __webpack_require__(42);
	var Route = __webpack_require__(41);

	/**
	 * A <DefaultRoute> component is a special kind of <Route> that
	 * renders when its parent matches but none of its siblings do.
	 * Only one such route may be used at any given level in the
	 * route hierarchy.
	 */

	var DefaultRoute = (function (_Route) {
	  function DefaultRoute() {
	    _classCallCheck(this, DefaultRoute);

	    if (_Route != null) {
	      _Route.apply(this, arguments);
	    }
	  }

	  _inherits(DefaultRoute, _Route);

	  return DefaultRoute;
	})(Route);

	// TODO: Include these in the above class definition
	// once we can use ES7 property initializers.
	// https://github.com/babel/babel/issues/619

	DefaultRoute.propTypes = {
	  name: PropTypes.string,
	  path: PropTypes.falsy,
	  children: PropTypes.falsy,
	  handler: PropTypes.func.isRequired
	};

	DefaultRoute.defaultProps = {
	  handler: RouteHandler
	};

	module.exports = DefaultRoute;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = __webpack_require__(2);
	var assign = __webpack_require__(33);
	var PropTypes = __webpack_require__(129);

	function isLeftClickEvent(event) {
	  return event.button === 0;
	}

	function isModifiedEvent(event) {
	  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
	}

	/**
	 * <Link> components are used to create an <a> element that links to a route.
	 * When that route is active, the link gets an "active" class name (or the
	 * value of its `activeClassName` prop).
	 *
	 * For example, assuming you have the following route:
	 *
	 *   <Route name="showPost" path="/posts/:postID" handler={Post}/>
	 *
	 * You could use the following component to link to that route:
	 *
	 *   <Link to="showPost" params={{ postID: "123" }} />
	 *
	 * In addition to params, links may pass along query string parameters
	 * using the `query` prop.
	 *
	 *   <Link to="showPost" params={{ postID: "123" }} query={{ show:true }}/>
	 */

	var Link = (function (_React$Component) {
	  function Link() {
	    _classCallCheck(this, Link);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Link, _React$Component);

	  _createClass(Link, {
	    handleClick: {
	      value: function handleClick(event) {
	        var allowTransition = true;
	        var clickResult;

	        if (this.props.onClick) clickResult = this.props.onClick(event);

	        if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
	          return;
	        }if (clickResult === false || event.defaultPrevented === true) allowTransition = false;

	        event.preventDefault();

	        if (allowTransition) this.context.router.transitionTo(this.props.to, this.props.params, this.props.query);
	      }
	    },
	    getHref: {

	      /**
	       * Returns the value of the "href" attribute to use on the DOM element.
	       */

	      value: function getHref() {
	        return this.context.router.makeHref(this.props.to, this.props.params, this.props.query);
	      }
	    },
	    getClassName: {

	      /**
	       * Returns the value of the "class" attribute to use on the DOM element, which contains
	       * the value of the activeClassName property when this <Link> is active.
	       */

	      value: function getClassName() {
	        var className = this.props.className;

	        if (this.getActiveState()) className += " " + this.props.activeClassName;

	        return className;
	      }
	    },
	    getActiveState: {
	      value: function getActiveState() {
	        return this.context.router.isActive(this.props.to, this.props.params, this.props.query);
	      }
	    },
	    render: {
	      value: function render() {
	        var props = assign({}, this.props, {
	          href: this.getHref(),
	          className: this.getClassName(),
	          onClick: this.handleClick.bind(this)
	        });

	        if (props.activeStyle && this.getActiveState()) props.style = props.activeStyle;

	        return React.DOM.a(props, this.props.children);
	      }
	    }
	  });

	  return Link;
	})(React.Component);

	// TODO: Include these in the above class definition
	// once we can use ES7 property initializers.
	// https://github.com/babel/babel/issues/619

	Link.contextTypes = {
	  router: PropTypes.router.isRequired
	};

	Link.propTypes = {
	  activeClassName: PropTypes.string.isRequired,
	  to: PropTypes.oneOfType([PropTypes.string, PropTypes.route]).isRequired,
	  params: PropTypes.object,
	  query: PropTypes.object,
	  activeStyle: PropTypes.object,
	  onClick: PropTypes.func
	};

	Link.defaultProps = {
	  activeClassName: "active",
	  className: ""
	};

	module.exports = Link;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var PropTypes = __webpack_require__(129);
	var RouteHandler = __webpack_require__(42);
	var Route = __webpack_require__(41);

	/**
	 * A <NotFoundRoute> is a special kind of <Route> that
	 * renders when the beginning of its parent's path matches
	 * but none of its siblings do, including any <DefaultRoute>.
	 * Only one such route may be used at any given level in the
	 * route hierarchy.
	 */

	var NotFoundRoute = (function (_Route) {
	  function NotFoundRoute() {
	    _classCallCheck(this, NotFoundRoute);

	    if (_Route != null) {
	      _Route.apply(this, arguments);
	    }
	  }

	  _inherits(NotFoundRoute, _Route);

	  return NotFoundRoute;
	})(Route);

	// TODO: Include these in the above class definition
	// once we can use ES7 property initializers.
	// https://github.com/babel/babel/issues/619

	NotFoundRoute.propTypes = {
	  name: PropTypes.string,
	  path: PropTypes.falsy,
	  children: PropTypes.falsy,
	  handler: PropTypes.func.isRequired
	};

	NotFoundRoute.defaultProps = {
	  handler: RouteHandler
	};

	module.exports = NotFoundRoute;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var PropTypes = __webpack_require__(129);
	var Route = __webpack_require__(41);

	/**
	 * A <Redirect> component is a special kind of <Route> that always
	 * redirects to another route when it matches.
	 */

	var Redirect = (function (_Route) {
	  function Redirect() {
	    _classCallCheck(this, Redirect);

	    if (_Route != null) {
	      _Route.apply(this, arguments);
	    }
	  }

	  _inherits(Redirect, _Route);

	  return Redirect;
	})(Route);

	// TODO: Include these in the above class definition
	// once we can use ES7 property initializers.
	// https://github.com/babel/babel/issues/619

	Redirect.propTypes = {
	  path: PropTypes.string,
	  from: PropTypes.string, // Alias for path.
	  to: PropTypes.string,
	  handler: PropTypes.falsy
	};

	// Redirects should not have a default handler
	Redirect.defaultProps = {};

	module.exports = Redirect;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = __webpack_require__(2);
	var invariant = __webpack_require__(63);
	var PropTypes = __webpack_require__(129);
	var RouteHandler = __webpack_require__(42);

	/**
	 * <Route> components specify components that are rendered to the page when the
	 * URL matches a given pattern.
	 *
	 * Routes are arranged in a nested tree structure. When a new URL is requested,
	 * the tree is searched depth-first to find a route whose path matches the URL.
	 * When one is found, all routes in the tree that lead to it are considered
	 * "active" and their components are rendered into the DOM, nested in the same
	 * order as they are in the tree.
	 *
	 * The preferred way to configure a router is using JSX. The XML-like syntax is
	 * a great way to visualize how routes are laid out in an application.
	 *
	 *   var routes = [
	 *     <Route handler={App}>
	 *       <Route name="login" handler={Login}/>
	 *       <Route name="logout" handler={Logout}/>
	 *       <Route name="about" handler={About}/>
	 *     </Route>
	 *   ];
	 *   
	 *   Router.run(routes, function (Handler) {
	 *     React.render(<Handler/>, document.body);
	 *   });
	 *
	 * Handlers for Route components that contain children can render their active
	 * child route using a <RouteHandler> element.
	 *
	 *   var App = React.createClass({
	 *     render: function () {
	 *       return (
	 *         <div class="application">
	 *           <RouteHandler/>
	 *         </div>
	 *       );
	 *     }
	 *   });
	 *
	 * If no handler is provided for the route, it will render a matched child route.
	 */

	var Route = (function (_React$Component) {
	  function Route() {
	    _classCallCheck(this, Route);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Route, _React$Component);

	  _createClass(Route, {
	    render: {
	      value: function render() {
	        invariant(false, "%s elements are for router configuration only and should not be rendered", this.constructor.name);
	      }
	    }
	  });

	  return Route;
	})(React.Component);

	// TODO: Include these in the above class definition
	// once we can use ES7 property initializers.
	// https://github.com/babel/babel/issues/619

	Route.propTypes = {
	  name: PropTypes.string,
	  path: PropTypes.string,
	  handler: PropTypes.func,
	  ignoreScrollBehavior: PropTypes.bool
	};

	Route.defaultProps = {
	  handler: RouteHandler
	};

	module.exports = Route;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = __webpack_require__(2);
	var ContextWrapper = __webpack_require__(130);
	var assign = __webpack_require__(33);
	var PropTypes = __webpack_require__(129);

	var REF_NAME = "__routeHandler__";

	/**
	 * A <RouteHandler> component renders the active child route handler
	 * when routes are nested.
	 */

	var RouteHandler = (function (_React$Component) {
	  function RouteHandler() {
	    _classCallCheck(this, RouteHandler);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(RouteHandler, _React$Component);

	  _createClass(RouteHandler, {
	    getChildContext: {
	      value: function getChildContext() {
	        return {
	          routeDepth: this.context.routeDepth + 1
	        };
	      }
	    },
	    componentDidMount: {
	      value: function componentDidMount() {
	        this._updateRouteComponent(this.refs[REF_NAME]);
	      }
	    },
	    componentDidUpdate: {
	      value: function componentDidUpdate() {
	        this._updateRouteComponent(this.refs[REF_NAME]);
	      }
	    },
	    componentWillUnmount: {
	      value: function componentWillUnmount() {
	        this._updateRouteComponent(null);
	      }
	    },
	    _updateRouteComponent: {
	      value: function _updateRouteComponent(component) {
	        this.context.router.setRouteComponentAtDepth(this.getRouteDepth(), component);
	      }
	    },
	    getRouteDepth: {
	      value: function getRouteDepth() {
	        return this.context.routeDepth;
	      }
	    },
	    createChildRouteHandler: {
	      value: function createChildRouteHandler(props) {
	        var route = this.context.router.getRouteAtDepth(this.getRouteDepth());
	        return route ? React.createElement(route.handler, assign({}, props || this.props, { ref: REF_NAME })) : null;
	      }
	    },
	    render: {
	      value: function render() {
	        var handler = this.createChildRouteHandler();
	        // <script/> for things like <CSSTransitionGroup/> that don't like null
	        return handler ? React.createElement(
	          ContextWrapper,
	          null,
	          handler
	        ) : React.createElement("script", null);
	      }
	    }
	  });

	  return RouteHandler;
	})(React.Component);

	// TODO: Include these in the above class definition
	// once we can use ES7 property initializers.
	// https://github.com/babel/babel/issues/619

	RouteHandler.contextTypes = {
	  routeDepth: PropTypes.number.isRequired,
	  router: PropTypes.router.isRequired
	};

	RouteHandler.childContextTypes = {
	  routeDepth: PropTypes.number.isRequired
	};

	module.exports = RouteHandler;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var LocationActions = __webpack_require__(131);
	var History = __webpack_require__(50);

	var _listeners = [];
	var _isListening = false;
	var _actionType;

	function notifyChange(type) {
	  if (type === LocationActions.PUSH) History.length += 1;

	  var change = {
	    path: HashLocation.getCurrentPath(),
	    type: type
	  };

	  _listeners.forEach(function (listener) {
	    listener.call(HashLocation, change);
	  });
	}

	function ensureSlash() {
	  var path = HashLocation.getCurrentPath();

	  if (path.charAt(0) === "/") {
	    return true;
	  }HashLocation.replace("/" + path);

	  return false;
	}

	function onHashChange() {
	  if (ensureSlash()) {
	    // If we don't have an _actionType then all we know is the hash
	    // changed. It was probably caused by the user clicking the Back
	    // button, but may have also been the Forward button or manual
	    // manipulation. So just guess 'pop'.
	    var curActionType = _actionType;
	    _actionType = null;
	    notifyChange(curActionType || LocationActions.POP);
	  }
	}

	/**
	 * A Location that uses `window.location.hash`.
	 */
	var HashLocation = {

	  addChangeListener: function addChangeListener(listener) {
	    _listeners.push(listener);

	    // Do this BEFORE listening for hashchange.
	    ensureSlash();

	    if (!_isListening) {
	      if (window.addEventListener) {
	        window.addEventListener("hashchange", onHashChange, false);
	      } else {
	        window.attachEvent("onhashchange", onHashChange);
	      }

	      _isListening = true;
	    }
	  },

	  removeChangeListener: function removeChangeListener(listener) {
	    _listeners = _listeners.filter(function (l) {
	      return l !== listener;
	    });

	    if (_listeners.length === 0) {
	      if (window.removeEventListener) {
	        window.removeEventListener("hashchange", onHashChange, false);
	      } else {
	        window.removeEvent("onhashchange", onHashChange);
	      }

	      _isListening = false;
	    }
	  },

	  push: function push(path) {
	    _actionType = LocationActions.PUSH;
	    window.location.hash = path;
	  },

	  replace: function replace(path) {
	    _actionType = LocationActions.REPLACE;
	    window.location.replace(window.location.pathname + window.location.search + "#" + path);
	  },

	  pop: function pop() {
	    _actionType = LocationActions.POP;
	    History.back();
	  },

	  getCurrentPath: function getCurrentPath() {
	    return decodeURI(
	    // We can't use window.location.hash here because it's not
	    // consistent across browsers - Firefox will pre-decode it!
	    window.location.href.split("#")[1] || "");
	  },

	  toString: function toString() {
	    return "<HashLocation>";
	  }

	};

	module.exports = HashLocation;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var LocationActions = __webpack_require__(131);
	var History = __webpack_require__(50);

	var _listeners = [];
	var _isListening = false;

	function notifyChange(type) {
	  var change = {
	    path: HistoryLocation.getCurrentPath(),
	    type: type
	  };

	  _listeners.forEach(function (listener) {
	    listener.call(HistoryLocation, change);
	  });
	}

	function onPopState(event) {
	  if (event.state === undefined) {
	    return;
	  } // Ignore extraneous popstate events in WebKit.

	  notifyChange(LocationActions.POP);
	}

	/**
	 * A Location that uses HTML5 history.
	 */
	var HistoryLocation = {

	  addChangeListener: function addChangeListener(listener) {
	    _listeners.push(listener);

	    if (!_isListening) {
	      if (window.addEventListener) {
	        window.addEventListener("popstate", onPopState, false);
	      } else {
	        window.attachEvent("onpopstate", onPopState);
	      }

	      _isListening = true;
	    }
	  },

	  removeChangeListener: function removeChangeListener(listener) {
	    _listeners = _listeners.filter(function (l) {
	      return l !== listener;
	    });

	    if (_listeners.length === 0) {
	      if (window.addEventListener) {
	        window.removeEventListener("popstate", onPopState, false);
	      } else {
	        window.removeEvent("onpopstate", onPopState);
	      }

	      _isListening = false;
	    }
	  },

	  push: function push(path) {
	    window.history.pushState({ path: path }, "", path);
	    History.length += 1;
	    notifyChange(LocationActions.PUSH);
	  },

	  replace: function replace(path) {
	    window.history.replaceState({ path: path }, "", path);
	    notifyChange(LocationActions.REPLACE);
	  },

	  pop: History.back,

	  getCurrentPath: function getCurrentPath() {
	    return decodeURI(window.location.pathname + window.location.search);
	  },

	  toString: function toString() {
	    return "<HistoryLocation>";
	  }

	};

	module.exports = HistoryLocation;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var HistoryLocation = __webpack_require__(44);
	var History = __webpack_require__(50);

	/**
	 * A Location that uses full page refreshes. This is used as
	 * the fallback for HistoryLocation in browsers that do not
	 * support the HTML5 history API.
	 */
	var RefreshLocation = {

	  push: function push(path) {
	    window.location = path;
	  },

	  replace: function replace(path) {
	    window.location.replace(path);
	  },

	  pop: History.back,

	  getCurrentPath: HistoryLocation.getCurrentPath,

	  toString: function toString() {
	    return "<RefreshLocation>";
	  }

	};

	module.exports = RefreshLocation;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var invariant = __webpack_require__(63);

	function throwCannotModify() {
	  invariant(false, "You cannot modify a static location");
	}

	/**
	 * A location that only ever contains a single path. Useful in
	 * stateless environments like servers where there is no path history,
	 * only the path that was used in the request.
	 */

	var StaticLocation = (function () {
	  function StaticLocation(path) {
	    _classCallCheck(this, StaticLocation);

	    this.path = path;
	  }

	  _createClass(StaticLocation, {
	    getCurrentPath: {
	      value: function getCurrentPath() {
	        return this.path;
	      }
	    },
	    toString: {
	      value: function toString() {
	        return "<StaticLocation path=\"" + this.path + "\">";
	      }
	    }
	  });

	  return StaticLocation;
	})();

	// TODO: Include these in the above class definition
	// once we can use ES7 property initializers.
	// https://github.com/babel/babel/issues/619

	StaticLocation.prototype.push = throwCannotModify;
	StaticLocation.prototype.replace = throwCannotModify;
	StaticLocation.prototype.pop = throwCannotModify;

	module.exports = StaticLocation;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var invariant = __webpack_require__(63);
	var LocationActions = __webpack_require__(131);
	var History = __webpack_require__(50);

	/**
	 * A location that is convenient for testing and does not require a DOM.
	 */

	var TestLocation = (function () {
	  function TestLocation(history) {
	    _classCallCheck(this, TestLocation);

	    this.history = history || [];
	    this.listeners = [];
	    this._updateHistoryLength();
	  }

	  _createClass(TestLocation, {
	    needsDOM: {
	      get: function () {
	        return false;
	      }
	    },
	    _updateHistoryLength: {
	      value: function _updateHistoryLength() {
	        History.length = this.history.length;
	      }
	    },
	    _notifyChange: {
	      value: function _notifyChange(type) {
	        var change = {
	          path: this.getCurrentPath(),
	          type: type
	        };

	        for (var i = 0, len = this.listeners.length; i < len; ++i) this.listeners[i].call(this, change);
	      }
	    },
	    addChangeListener: {
	      value: function addChangeListener(listener) {
	        this.listeners.push(listener);
	      }
	    },
	    removeChangeListener: {
	      value: function removeChangeListener(listener) {
	        this.listeners = this.listeners.filter(function (l) {
	          return l !== listener;
	        });
	      }
	    },
	    push: {
	      value: function push(path) {
	        this.history.push(path);
	        this._updateHistoryLength();
	        this._notifyChange(LocationActions.PUSH);
	      }
	    },
	    replace: {
	      value: function replace(path) {
	        invariant(this.history.length, "You cannot replace the current path with no history");

	        this.history[this.history.length - 1] = path;

	        this._notifyChange(LocationActions.REPLACE);
	      }
	    },
	    pop: {
	      value: function pop() {
	        this.history.pop();
	        this._updateHistoryLength();
	        this._notifyChange(LocationActions.POP);
	      }
	    },
	    getCurrentPath: {
	      value: function getCurrentPath() {
	        return this.history[this.history.length - 1];
	      }
	    },
	    toString: {
	      value: function toString() {
	        return "<TestLocation>";
	      }
	    }
	  });

	  return TestLocation;
	})();

	module.exports = TestLocation;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var LocationActions = __webpack_require__(131);

	/**
	 * A scroll behavior that attempts to imitate the default behavior
	 * of modern browsers.
	 */
	var ImitateBrowserBehavior = {

	  updateScrollPosition: function updateScrollPosition(position, actionType) {
	    switch (actionType) {
	      case LocationActions.PUSH:
	      case LocationActions.REPLACE:
	        window.scrollTo(0, 0);
	        break;
	      case LocationActions.POP:
	        if (position) {
	          window.scrollTo(position.x, position.y);
	        } else {
	          window.scrollTo(0, 0);
	        }
	        break;
	    }
	  }

	};

	module.exports = ImitateBrowserBehavior;

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * A scroll behavior that always scrolls to the top of the page
	 * after a transition.
	 */
	var ScrollToTopBehavior = {

	  updateScrollPosition: function updateScrollPosition() {
	    window.scrollTo(0, 0);
	  }

	};

	module.exports = ScrollToTopBehavior;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var invariant = __webpack_require__(63);
	var canUseDOM = __webpack_require__(36).canUseDOM;

	var History = {

	  /**
	   * The current number of entries in the history.
	   *
	   * Note: This property is read-only.
	   */
	  length: 1,

	  /**
	   * Sends the browser back one entry in the history.
	   */
	  back: function back() {
	    invariant(canUseDOM, "Cannot use History.back without a DOM");

	    // Do this first so that History.length will
	    // be accurate in location change listeners.
	    History.length -= 1;

	    window.history.back();
	  }

	};

	module.exports = History;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var warning = __webpack_require__(65);
	var PropTypes = __webpack_require__(129);

	function deprecatedMethod(routerMethodName, fn) {
	  return function () {
	    warning(false, "Router.Navigation is deprecated. Please use this.context.router." + routerMethodName + "() instead");

	    return fn.apply(this, arguments);
	  };
	}

	/**
	 * A mixin for components that modify the URL.
	 *
	 * Example:
	 *
	 *   var MyLink = React.createClass({
	 *     mixins: [ Router.Navigation ],
	 *     handleClick(event) {
	 *       event.preventDefault();
	 *       this.transitionTo('aRoute', { the: 'params' }, { the: 'query' });
	 *     },
	 *     render() {
	 *       return (
	 *         <a onClick={this.handleClick}>Click me!</a>
	 *       );
	 *     }
	 *   });
	 */
	var Navigation = {

	  contextTypes: {
	    router: PropTypes.router.isRequired
	  },

	  /**
	   * Returns an absolute URL path created from the given route
	   * name, URL parameters, and query values.
	   */
	  makePath: deprecatedMethod("makePath", function (to, params, query) {
	    return this.context.router.makePath(to, params, query);
	  }),

	  /**
	   * Returns a string that may safely be used as the href of a
	   * link to the route with the given name.
	   */
	  makeHref: deprecatedMethod("makeHref", function (to, params, query) {
	    return this.context.router.makeHref(to, params, query);
	  }),

	  /**
	   * Transitions to the URL specified in the arguments by pushing
	   * a new URL onto the history stack.
	   */
	  transitionTo: deprecatedMethod("transitionTo", function (to, params, query) {
	    this.context.router.transitionTo(to, params, query);
	  }),

	  /**
	   * Transitions to the URL specified in the arguments by replacing
	   * the current URL in the history stack.
	   */
	  replaceWith: deprecatedMethod("replaceWith", function (to, params, query) {
	    this.context.router.replaceWith(to, params, query);
	  }),

	  /**
	   * Transitions to the previous URL.
	   */
	  goBack: deprecatedMethod("goBack", function () {
	    return this.context.router.goBack();
	  })

	};

	module.exports = Navigation;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var warning = __webpack_require__(65);
	var PropTypes = __webpack_require__(129);

	function deprecatedMethod(routerMethodName, fn) {
	  return function () {
	    warning(false, "Router.State is deprecated. Please use this.context.router." + routerMethodName + "() instead");

	    return fn.apply(this, arguments);
	  };
	}

	/**
	 * A mixin for components that need to know the path, routes, URL
	 * params and query that are currently active.
	 *
	 * Example:
	 *
	 *   var AboutLink = React.createClass({
	 *     mixins: [ Router.State ],
	 *     render() {
	 *       var className = this.props.className;
	 *   
	 *       if (this.isActive('about'))
	 *         className += ' is-active';
	 *   
	 *       return React.DOM.a({ className: className }, this.props.children);
	 *     }
	 *   });
	 */
	var State = {

	  contextTypes: {
	    router: PropTypes.router.isRequired
	  },

	  /**
	   * Returns the current URL path.
	   */
	  getPath: deprecatedMethod("getCurrentPath", function () {
	    return this.context.router.getCurrentPath();
	  }),

	  /**
	   * Returns the current URL path without the query string.
	   */
	  getPathname: deprecatedMethod("getCurrentPathname", function () {
	    return this.context.router.getCurrentPathname();
	  }),

	  /**
	   * Returns an object of the URL params that are currently active.
	   */
	  getParams: deprecatedMethod("getCurrentParams", function () {
	    return this.context.router.getCurrentParams();
	  }),

	  /**
	   * Returns an object of the query params that are currently active.
	   */
	  getQuery: deprecatedMethod("getCurrentQuery", function () {
	    return this.context.router.getCurrentQuery();
	  }),

	  /**
	   * Returns an array of the routes that are currently active.
	   */
	  getRoutes: deprecatedMethod("getCurrentRoutes", function () {
	    return this.context.router.getCurrentRoutes();
	  }),

	  /**
	   * A helper method to determine if a given route, params, and query
	   * are active.
	   */
	  isActive: deprecatedMethod("isActive", function (to, params, query) {
	    return this.context.router.isActive(to, params, query);
	  })

	};

	module.exports = State;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var assign = __webpack_require__(33);
	var invariant = __webpack_require__(63);
	var warning = __webpack_require__(65);
	var PathUtils = __webpack_require__(132);

	var _currentRoute;

	var Route = (function () {
	  function Route(name, path, ignoreScrollBehavior, isDefault, isNotFound, onEnter, onLeave, handler) {
	    _classCallCheck(this, Route);

	    this.name = name;
	    this.path = path;
	    this.paramNames = PathUtils.extractParamNames(this.path);
	    this.ignoreScrollBehavior = !!ignoreScrollBehavior;
	    this.isDefault = !!isDefault;
	    this.isNotFound = !!isNotFound;
	    this.onEnter = onEnter;
	    this.onLeave = onLeave;
	    this.handler = handler;
	  }

	  _createClass(Route, {
	    appendChild: {

	      /**
	       * Appends the given route to this route's child routes.
	       */

	      value: function appendChild(route) {
	        invariant(route instanceof Route, "route.appendChild must use a valid Route");

	        if (!this.childRoutes) this.childRoutes = [];

	        this.childRoutes.push(route);
	      }
	    },
	    toString: {
	      value: function toString() {
	        var string = "<Route";

	        if (this.name) string += " name=\"" + this.name + "\"";

	        string += " path=\"" + this.path + "\">";

	        return string;
	      }
	    }
	  }, {
	    createRoute: {

	      /**
	       * Creates and returns a new route. Options may be a URL pathname string
	       * with placeholders for named params or an object with any of the following
	       * properties:
	       *
	       * - name                     The name of the route. This is used to lookup a
	       *                            route relative to its parent route and should be
	       *                            unique among all child routes of the same parent
	       * - path                     A URL pathname string with optional placeholders
	       *                            that specify the names of params to extract from
	       *                            the URL when the path matches. Defaults to `/${name}`
	       *                            when there is a name given, or the path of the parent
	       *                            route, or /
	       * - ignoreScrollBehavior     True to make this route (and all descendants) ignore
	       *                            the scroll behavior of the router
	       * - isDefault                True to make this route the default route among all
	       *                            its siblings
	       * - isNotFound               True to make this route the "not found" route among
	       *                            all its siblings
	       * - onEnter                  A transition hook that will be called when the
	       *                            router is going to enter this route
	       * - onLeave                  A transition hook that will be called when the
	       *                            router is going to leave this route
	       * - handler                  A React component that will be rendered when
	       *                            this route is active
	       * - parentRoute              The parent route to use for this route. This option
	       *                            is automatically supplied when creating routes inside
	       *                            the callback to another invocation of createRoute. You
	       *                            only ever need to use this when declaring routes
	       *                            independently of one another to manually piece together
	       *                            the route hierarchy
	       *
	       * The callback may be used to structure your route hierarchy. Any call to
	       * createRoute, createDefaultRoute, createNotFoundRoute, or createRedirect
	       * inside the callback automatically uses this route as its parent.
	       */

	      value: function createRoute(options, callback) {
	        options = options || {};

	        if (typeof options === "string") options = { path: options };

	        var parentRoute = _currentRoute;

	        if (parentRoute) {
	          warning(options.parentRoute == null || options.parentRoute === parentRoute, "You should not use parentRoute with createRoute inside another route's child callback; it is ignored");
	        } else {
	          parentRoute = options.parentRoute;
	        }

	        var name = options.name;
	        var path = options.path || name;

	        if (path && !(options.isDefault || options.isNotFound)) {
	          if (PathUtils.isAbsolute(path)) {
	            if (parentRoute) {
	              invariant(path === parentRoute.path || parentRoute.paramNames.length === 0, "You cannot nest path \"%s\" inside \"%s\"; the parent requires URL parameters", path, parentRoute.path);
	            }
	          } else if (parentRoute) {
	            // Relative paths extend their parent.
	            path = PathUtils.join(parentRoute.path, path);
	          } else {
	            path = "/" + path;
	          }
	        } else {
	          path = parentRoute ? parentRoute.path : "/";
	        }

	        if (options.isNotFound && !/\*$/.test(path)) path += "*"; // Auto-append * to the path of not found routes.

	        var route = new Route(name, path, options.ignoreScrollBehavior, options.isDefault, options.isNotFound, options.onEnter, options.onLeave, options.handler);

	        if (parentRoute) {
	          if (route.isDefault) {
	            invariant(parentRoute.defaultRoute == null, "%s may not have more than one default route", parentRoute);

	            parentRoute.defaultRoute = route;
	          } else if (route.isNotFound) {
	            invariant(parentRoute.notFoundRoute == null, "%s may not have more than one not found route", parentRoute);

	            parentRoute.notFoundRoute = route;
	          }

	          parentRoute.appendChild(route);
	        }

	        // Any routes created in the callback
	        // use this route as their parent.
	        if (typeof callback === "function") {
	          var currentRoute = _currentRoute;
	          _currentRoute = route;
	          callback.call(route, route);
	          _currentRoute = currentRoute;
	        }

	        return route;
	      }
	    },
	    createDefaultRoute: {

	      /**
	       * Creates and returns a route that is rendered when its parent matches
	       * the current URL.
	       */

	      value: function createDefaultRoute(options) {
	        return Route.createRoute(assign({}, options, { isDefault: true }));
	      }
	    },
	    createNotFoundRoute: {

	      /**
	       * Creates and returns a route that is rendered when its parent matches
	       * the current URL but none of its siblings do.
	       */

	      value: function createNotFoundRoute(options) {
	        return Route.createRoute(assign({}, options, { isNotFound: true }));
	      }
	    },
	    createRedirect: {

	      /**
	       * Creates and returns a route that automatically redirects the transition
	       * to another route. In addition to the normal options to createRoute, this
	       * function accepts the following options:
	       *
	       * - from         An alias for the `path` option. Defaults to *
	       * - to           The path/route/route name to redirect to
	       * - params       The params to use in the redirect URL. Defaults
	       *                to using the current params
	       * - query        The query to use in the redirect URL. Defaults
	       *                to using the current query
	       */

	      value: function createRedirect(options) {
	        return Route.createRoute(assign({}, options, {
	          path: options.path || options.from || "*",
	          onEnter: function onEnter(transition, params, query) {
	            transition.redirect(options.to, options.params || params, options.query || query);
	          }
	        }));
	      }
	    }
	  });

	  return Route;
	})();

	module.exports = Route;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/* jshint -W084 */
	var React = __webpack_require__(2);
	var assign = __webpack_require__(33);
	var warning = __webpack_require__(65);
	var DefaultRoute = __webpack_require__(37);
	var NotFoundRoute = __webpack_require__(39);
	var Redirect = __webpack_require__(40);
	var Route = __webpack_require__(53);

	function checkPropTypes(componentName, propTypes, props) {
	  componentName = componentName || "UnknownComponent";

	  for (var propName in propTypes) {
	    if (propTypes.hasOwnProperty(propName)) {
	      var error = propTypes[propName](props, propName, componentName);

	      if (error instanceof Error) warning(false, error.message);
	    }
	  }
	}

	function createRouteOptions(props) {
	  var options = assign({}, props);
	  var handler = options.handler;

	  if (handler) {
	    options.onEnter = handler.willTransitionTo;
	    options.onLeave = handler.willTransitionFrom;
	  }

	  return options;
	}

	function createRouteFromReactElement(element) {
	  if (!React.isValidElement(element)) {
	    return;
	  }var type = element.type;
	  var props = assign({}, type.defaultProps, element.props);

	  if (type.propTypes) checkPropTypes(type.displayName, type.propTypes, props);

	  if (type === DefaultRoute) {
	    return Route.createDefaultRoute(createRouteOptions(props));
	  }if (type === NotFoundRoute) {
	    return Route.createNotFoundRoute(createRouteOptions(props));
	  }if (type === Redirect) {
	    return Route.createRedirect(createRouteOptions(props));
	  }return Route.createRoute(createRouteOptions(props), function () {
	    if (props.children) createRoutesFromReactChildren(props.children);
	  });
	}

	/**
	 * Creates and returns an array of routes created from the given
	 * ReactChildren, all of which should be one of <Route>, <DefaultRoute>,
	 * <NotFoundRoute>, or <Redirect>, e.g.:
	 *
	 *   var { createRoutesFromReactChildren, Route, Redirect } = require('react-router');
	 *
	 *   var routes = createRoutesFromReactChildren(
	 *     <Route path="/" handler={App}>
	 *       <Route name="user" path="/user/:userId" handler={User}>
	 *         <Route name="task" path="tasks/:taskId" handler={Task}/>
	 *         <Redirect from="todos/:taskId" to="task"/>
	 *       </Route>
	 *     </Route>
	 *   );
	 */
	function createRoutesFromReactChildren(children) {
	  var routes = [];

	  React.Children.forEach(children, function (child) {
	    if (child = createRouteFromReactElement(child)) routes.push(child);
	  });

	  return routes;
	}

	module.exports = createRoutesFromReactChildren;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";

	/* jshint -W058 */
	var React = __webpack_require__(2);
	var warning = __webpack_require__(65);
	var invariant = __webpack_require__(63);
	var canUseDOM = __webpack_require__(36).canUseDOM;
	var LocationActions = __webpack_require__(131);
	var ImitateBrowserBehavior = __webpack_require__(48);
	var HashLocation = __webpack_require__(43);
	var HistoryLocation = __webpack_require__(44);
	var RefreshLocation = __webpack_require__(45);
	var StaticLocation = __webpack_require__(46);
	var ScrollHistory = __webpack_require__(133);
	var createRoutesFromReactChildren = __webpack_require__(54);
	var isReactChildren = __webpack_require__(134);
	var Transition = __webpack_require__(135);
	var PropTypes = __webpack_require__(129);
	var Redirect = __webpack_require__(136);
	var History = __webpack_require__(50);
	var Cancellation = __webpack_require__(137);
	var Match = __webpack_require__(138);
	var Route = __webpack_require__(53);
	var supportsHistory = __webpack_require__(139);
	var PathUtils = __webpack_require__(132);

	/**
	 * The default location for new routers.
	 */
	var DEFAULT_LOCATION = canUseDOM ? HashLocation : "/";

	/**
	 * The default scroll behavior for new routers.
	 */
	var DEFAULT_SCROLL_BEHAVIOR = canUseDOM ? ImitateBrowserBehavior : null;

	function hasProperties(object, properties) {
	  for (var propertyName in properties) if (properties.hasOwnProperty(propertyName) && object[propertyName] !== properties[propertyName]) {
	    return false;
	  }return true;
	}

	function hasMatch(routes, route, prevParams, nextParams, prevQuery, nextQuery) {
	  return routes.some(function (r) {
	    if (r !== route) return false;

	    var paramNames = route.paramNames;
	    var paramName;

	    // Ensure that all params the route cares about did not change.
	    for (var i = 0, len = paramNames.length; i < len; ++i) {
	      paramName = paramNames[i];

	      if (nextParams[paramName] !== prevParams[paramName]) return false;
	    }

	    // Ensure the query hasn't changed.
	    return hasProperties(prevQuery, nextQuery) && hasProperties(nextQuery, prevQuery);
	  });
	}

	function addRoutesToNamedRoutes(routes, namedRoutes) {
	  var route;
	  for (var i = 0, len = routes.length; i < len; ++i) {
	    route = routes[i];

	    if (route.name) {
	      invariant(namedRoutes[route.name] == null, "You may not have more than one route named \"%s\"", route.name);

	      namedRoutes[route.name] = route;
	    }

	    if (route.childRoutes) addRoutesToNamedRoutes(route.childRoutes, namedRoutes);
	  }
	}

	function routeIsActive(activeRoutes, routeName) {
	  return activeRoutes.some(function (route) {
	    return route.name === routeName;
	  });
	}

	function paramsAreActive(activeParams, params) {
	  for (var property in params) if (String(activeParams[property]) !== String(params[property])) {
	    return false;
	  }return true;
	}

	function queryIsActive(activeQuery, query) {
	  for (var property in query) if (String(activeQuery[property]) !== String(query[property])) {
	    return false;
	  }return true;
	}

	/**
	 * Creates and returns a new router using the given options. A router
	 * is a ReactComponent class that knows how to react to changes in the
	 * URL and keep the contents of the page in sync.
	 *
	 * Options may be any of the following:
	 *
	 * - routes           (required) The route config
	 * - location         The location to use. Defaults to HashLocation when
	 *                    the DOM is available, "/" otherwise
	 * - scrollBehavior   The scroll behavior to use. Defaults to ImitateBrowserBehavior
	 *                    when the DOM is available, null otherwise
	 * - onError          A function that is used to handle errors
	 * - onAbort          A function that is used to handle aborted transitions
	 *
	 * When rendering in a server-side environment, the location should simply
	 * be the URL path that was used in the request, including the query string.
	 */
	function createRouter(options) {
	  options = options || {};

	  if (isReactChildren(options)) options = { routes: options };

	  var mountedComponents = [];
	  var location = options.location || DEFAULT_LOCATION;
	  var scrollBehavior = options.scrollBehavior || DEFAULT_SCROLL_BEHAVIOR;
	  var state = {};
	  var nextState = {};
	  var pendingTransition = null;
	  var dispatchHandler = null;

	  if (typeof location === "string") location = new StaticLocation(location);

	  if (location instanceof StaticLocation) {
	    warning(!canUseDOM || process.env.NODE_ENV === "test", "You should not use a static location in a DOM environment because " + "the router will not be kept in sync with the current URL");
	  } else {
	    invariant(canUseDOM || location.needsDOM === false, "You cannot use %s without a DOM", location);
	  }

	  // Automatically fall back to full page refreshes in
	  // browsers that don't support the HTML history API.
	  if (location === HistoryLocation && !supportsHistory()) location = RefreshLocation;

	  var Router = React.createClass({

	    displayName: "Router",

	    statics: {

	      isRunning: false,

	      cancelPendingTransition: function cancelPendingTransition() {
	        if (pendingTransition) {
	          pendingTransition.cancel();
	          pendingTransition = null;
	        }
	      },

	      clearAllRoutes: function clearAllRoutes() {
	        Router.cancelPendingTransition();
	        Router.namedRoutes = {};
	        Router.routes = [];
	      },

	      /**
	       * Adds routes to this router from the given children object (see ReactChildren).
	       */
	      addRoutes: function addRoutes(routes) {
	        if (isReactChildren(routes)) routes = createRoutesFromReactChildren(routes);

	        addRoutesToNamedRoutes(routes, Router.namedRoutes);

	        Router.routes.push.apply(Router.routes, routes);
	      },

	      /**
	       * Replaces routes of this router from the given children object (see ReactChildren).
	       */
	      replaceRoutes: function replaceRoutes(routes) {
	        Router.clearAllRoutes();
	        Router.addRoutes(routes);
	        Router.refresh();
	      },

	      /**
	       * Performs a match of the given path against this router and returns an object
	       * with the { routes, params, pathname, query } that match. Returns null if no
	       * match can be made.
	       */
	      match: function match(path) {
	        return Match.findMatch(Router.routes, path);
	      },

	      /**
	       * Returns an absolute URL path created from the given route
	       * name, URL parameters, and query.
	       */
	      makePath: function makePath(to, params, query) {
	        var path;
	        if (PathUtils.isAbsolute(to)) {
	          path = to;
	        } else {
	          var route = to instanceof Route ? to : Router.namedRoutes[to];

	          invariant(route instanceof Route, "Cannot find a route named \"%s\"", to);

	          path = route.path;
	        }

	        return PathUtils.withQuery(PathUtils.injectParams(path, params), query);
	      },

	      /**
	       * Returns a string that may safely be used as the href of a link
	       * to the route with the given name, URL parameters, and query.
	       */
	      makeHref: function makeHref(to, params, query) {
	        var path = Router.makePath(to, params, query);
	        return location === HashLocation ? "#" + path : path;
	      },

	      /**
	       * Transitions to the URL specified in the arguments by pushing
	       * a new URL onto the history stack.
	       */
	      transitionTo: function transitionTo(to, params, query) {
	        var path = Router.makePath(to, params, query);

	        if (pendingTransition) {
	          // Replace so pending location does not stay in history.
	          location.replace(path);
	        } else {
	          location.push(path);
	        }
	      },

	      /**
	       * Transitions to the URL specified in the arguments by replacing
	       * the current URL in the history stack.
	       */
	      replaceWith: function replaceWith(to, params, query) {
	        location.replace(Router.makePath(to, params, query));
	      },

	      /**
	       * Transitions to the previous URL if one is available. Returns true if the
	       * router was able to go back, false otherwise.
	       *
	       * Note: The router only tracks history entries in your application, not the
	       * current browser session, so you can safely call this function without guarding
	       * against sending the user back to some other site. However, when using
	       * RefreshLocation (which is the fallback for HistoryLocation in browsers that
	       * don't support HTML5 history) this method will *always* send the client back
	       * because we cannot reliably track history length.
	       */
	      goBack: function goBack() {
	        if (History.length > 1 || location === RefreshLocation) {
	          location.pop();
	          return true;
	        }

	        warning(false, "goBack() was ignored because there is no router history");

	        return false;
	      },

	      handleAbort: options.onAbort || function (abortReason) {
	        if (location instanceof StaticLocation) throw new Error("Unhandled aborted transition! Reason: " + abortReason);

	        if (abortReason instanceof Cancellation) {
	          return;
	        } else if (abortReason instanceof Redirect) {
	          location.replace(Router.makePath(abortReason.to, abortReason.params, abortReason.query));
	        } else {
	          location.pop();
	        }
	      },

	      handleError: options.onError || function (error) {
	        // Throw so we don't silently swallow async errors.
	        throw error; // This error probably originated in a transition hook.
	      },

	      handleLocationChange: function handleLocationChange(change) {
	        Router.dispatch(change.path, change.type);
	      },

	      /**
	       * Performs a transition to the given path and calls callback(error, abortReason)
	       * when the transition is finished. If both arguments are null the router's state
	       * was updated. Otherwise the transition did not complete.
	       *
	       * In a transition, a router first determines which routes are involved by beginning
	       * with the current route, up the route tree to the first parent route that is shared
	       * with the destination route, and back down the tree to the destination route. The
	       * willTransitionFrom hook is invoked on all route handlers we're transitioning away
	       * from, in reverse nesting order. Likewise, the willTransitionTo hook is invoked on
	       * all route handlers we're transitioning to.
	       *
	       * Both willTransitionFrom and willTransitionTo hooks may either abort or redirect the
	       * transition. To resolve asynchronously, they may use the callback argument. If no
	       * hooks wait, the transition is fully synchronous.
	       */
	      dispatch: function dispatch(path, action) {
	        Router.cancelPendingTransition();

	        var prevPath = state.path;
	        var isRefreshing = action == null;

	        if (prevPath === path && !isRefreshing) {
	          return;
	        } // Nothing to do!

	        // Record the scroll position as early as possible to
	        // get it before browsers try update it automatically.
	        if (prevPath && action === LocationActions.PUSH) Router.recordScrollPosition(prevPath);

	        var match = Router.match(path);

	        warning(match != null, "No route matches path \"%s\". Make sure you have <Route path=\"%s\"> somewhere in your routes", path, path);

	        if (match == null) match = {};

	        var prevRoutes = state.routes || [];
	        var prevParams = state.params || {};
	        var prevQuery = state.query || {};

	        var nextRoutes = match.routes || [];
	        var nextParams = match.params || {};
	        var nextQuery = match.query || {};

	        var fromRoutes, toRoutes;
	        if (prevRoutes.length) {
	          fromRoutes = prevRoutes.filter(function (route) {
	            return !hasMatch(nextRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
	          });

	          toRoutes = nextRoutes.filter(function (route) {
	            return !hasMatch(prevRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
	          });
	        } else {
	          fromRoutes = [];
	          toRoutes = nextRoutes;
	        }

	        var transition = new Transition(path, Router.replaceWith.bind(Router, path));
	        pendingTransition = transition;

	        var fromComponents = mountedComponents.slice(prevRoutes.length - fromRoutes.length);

	        Transition.from(transition, fromRoutes, fromComponents, function (error) {
	          if (error || transition.abortReason) return dispatchHandler.call(Router, error, transition); // No need to continue.

	          Transition.to(transition, toRoutes, nextParams, nextQuery, function (error) {
	            dispatchHandler.call(Router, error, transition, {
	              path: path,
	              action: action,
	              pathname: match.pathname,
	              routes: nextRoutes,
	              params: nextParams,
	              query: nextQuery
	            });
	          });
	        });
	      },

	      /**
	       * Starts this router and calls callback(router, state) when the route changes.
	       *
	       * If the router's location is static (i.e. a URL path in a server environment)
	       * the callback is called only once. Otherwise, the location should be one of the
	       * Router.*Location objects (e.g. Router.HashLocation or Router.HistoryLocation).
	       */
	      run: function run(callback) {
	        invariant(!Router.isRunning, "Router is already running");

	        dispatchHandler = function (error, transition, newState) {
	          if (error) Router.handleError(error);

	          if (pendingTransition !== transition) return;

	          pendingTransition = null;

	          if (transition.abortReason) {
	            Router.handleAbort(transition.abortReason);
	          } else {
	            callback.call(Router, Router, nextState = newState);
	          }
	        };

	        if (!(location instanceof StaticLocation)) {
	          if (location.addChangeListener) location.addChangeListener(Router.handleLocationChange);

	          Router.isRunning = true;
	        }

	        // Bootstrap using the current path.
	        Router.refresh();
	      },

	      refresh: function refresh() {
	        Router.dispatch(location.getCurrentPath(), null);
	      },

	      stop: function stop() {
	        Router.cancelPendingTransition();

	        if (location.removeChangeListener) location.removeChangeListener(Router.handleLocationChange);

	        Router.isRunning = false;
	      },

	      getLocation: function getLocation() {
	        return location;
	      },

	      getScrollBehavior: function getScrollBehavior() {
	        return scrollBehavior;
	      },

	      getRouteAtDepth: function getRouteAtDepth(routeDepth) {
	        var routes = state.routes;
	        return routes && routes[routeDepth];
	      },

	      setRouteComponentAtDepth: function setRouteComponentAtDepth(routeDepth, component) {
	        mountedComponents[routeDepth] = component;
	      },

	      /**
	       * Returns the current URL path + query string.
	       */
	      getCurrentPath: function getCurrentPath() {
	        return state.path;
	      },

	      /**
	       * Returns the current URL path without the query string.
	       */
	      getCurrentPathname: function getCurrentPathname() {
	        return state.pathname;
	      },

	      /**
	       * Returns an object of the currently active URL parameters.
	       */
	      getCurrentParams: function getCurrentParams() {
	        return state.params;
	      },

	      /**
	       * Returns an object of the currently active query parameters.
	       */
	      getCurrentQuery: function getCurrentQuery() {
	        return state.query;
	      },

	      /**
	       * Returns an array of the currently active routes.
	       */
	      getCurrentRoutes: function getCurrentRoutes() {
	        return state.routes;
	      },

	      /**
	       * Returns true if the given route, params, and query are active.
	       */
	      isActive: function isActive(to, params, query) {
	        if (PathUtils.isAbsolute(to)) {
	          return to === state.path;
	        }return routeIsActive(state.routes, to) && paramsAreActive(state.params, params) && (query == null || queryIsActive(state.query, query));
	      }

	    },

	    mixins: [ScrollHistory],

	    propTypes: {
	      children: PropTypes.falsy
	    },

	    childContextTypes: {
	      routeDepth: PropTypes.number.isRequired,
	      router: PropTypes.router.isRequired
	    },

	    getChildContext: function getChildContext() {
	      return {
	        routeDepth: 1,
	        router: Router
	      };
	    },

	    getInitialState: function getInitialState() {
	      return state = nextState;
	    },

	    componentWillReceiveProps: function componentWillReceiveProps() {
	      this.setState(state = nextState);
	    },

	    componentWillUnmount: function componentWillUnmount() {
	      Router.stop();
	    },

	    render: function render() {
	      var route = Router.getRouteAtDepth(0);
	      return route ? React.createElement(route.handler, this.props) : null;
	    }

	  });

	  Router.clearAllRoutes();

	  if (options.routes) Router.addRoutes(options.routes);

	  return Router;
	}

	module.exports = createRouter;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(59)))

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var createRouter = __webpack_require__(55);

	/**
	 * A high-level convenience method that creates, configures, and
	 * runs a router in one shot. The method signature is:
	 *
	 *   Router.run(routes[, location ], callback);
	 *
	 * Using `window.location.hash` to manage the URL, you could do:
	 *
	 *   Router.run(routes, function (Handler) {
	 *     React.render(<Handler/>, document.body);
	 *   });
	 * 
	 * Using HTML5 history and a custom "cursor" prop:
	 * 
	 *   Router.run(routes, Router.HistoryLocation, function (Handler) {
	 *     React.render(<Handler cursor={cursor}/>, document.body);
	 *   });
	 *
	 * Returns the newly created router.
	 *
	 * Note: If you need to specify further options for your router such
	 * as error/abort handling or custom scroll behavior, use Router.create
	 * instead.
	 *
	 *   var router = Router.create(options);
	 *   router.run(function (Handler) {
	 *     // ...
	 *   });
	 */
	function runRouter(routes, location, callback) {
	  if (typeof location === "function") {
	    callback = location;
	    location = null;
	  }

	  var router = createRouter({
	    routes: routes,
	    location: location
	  });

	  router.run(callback);

	  return router;
	}

	module.exports = runRouter;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var style = __webpack_require__(128);
	exports.theme = style.create({
	    fonts: {
	        title: {
	            color: 'rgba(0,0,0,0.87)',
	            fontWeight: 700,
	            fontSize: 32
	        },
	        date: {
	            color: '#666',
	            fontSize: 14
	        },
	        articleBody: {
	            lineHeight: 1.8,
	            color: 'rgba(0,0,0,0.76)'
	        }
	    }
	});


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var style = __webpack_require__(128);
	module.exports = style.create({
	    content: {
	        maxWidth: 600,
	        paddingLeft: 10,
	        paddingRight: 10,
	        paddingTop: 60,
	        marginLeft: 'auto',
	        marginRight: 'auto'
	    }
	});


/***/ },
/* 59 */,
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(59)))

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var yaml = __webpack_require__(140);


	module.exports = yaml;


/***/ },
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */

	;(function() {

	/**
	 * Block-Level Grammar
	 */

	var block = {
	  newline: /^\n+/,
	  code: /^( {4}[^\n]+\n*)+/,
	  fences: noop,
	  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
	  nptable: noop,
	  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
	  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
	  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
	  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
	  table: noop,
	  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
	  text: /^[^\n]+/
	};

	block.bullet = /(?:[*+-]|\d+\.)/;
	block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	block.item = replace(block.item, 'gm')
	  (/bull/g, block.bullet)
	  ();

	block.list = replace(block.list)
	  (/bull/g, block.bullet)
	  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
	  ('def', '\\n+(?=' + block.def.source + ')')
	  ();

	block.blockquote = replace(block.blockquote)
	  ('def', block.def)
	  ();

	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

	block.html = replace(block.html)
	  ('comment', /<!--[\s\S]*?-->/)
	  ('closed', /<(tag)[\s\S]+?<\/\1>/)
	  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
	  (/tag/g, block._tag)
	  ();

	block.paragraph = replace(block.paragraph)
	  ('hr', block.hr)
	  ('heading', block.heading)
	  ('lheading', block.lheading)
	  ('blockquote', block.blockquote)
	  ('tag', '<' + block._tag)
	  ('def', block.def)
	  ();

	/**
	 * Normal Block Grammar
	 */

	block.normal = merge({}, block);

	/**
	 * GFM Block Grammar
	 */

	block.gfm = merge({}, block.normal, {
	  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
	  paragraph: /^/
	});

	block.gfm.paragraph = replace(block.paragraph)
	  ('(?!', '(?!'
	    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
	    + block.list.source.replace('\\1', '\\3') + '|')
	  ();

	/**
	 * GFM + Tables Block Grammar
	 */

	block.tables = merge({}, block.gfm, {
	  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
	  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	});

	/**
	 * Block Lexer
	 */

	function Lexer(options) {
	  this.tokens = [];
	  this.tokens.links = {};
	  this.options = options || marked.defaults;
	  this.rules = block.normal;

	  if (this.options.gfm) {
	    if (this.options.tables) {
	      this.rules = block.tables;
	    } else {
	      this.rules = block.gfm;
	    }
	  }
	}

	/**
	 * Expose Block Rules
	 */

	Lexer.rules = block;

	/**
	 * Static Lex Method
	 */

	Lexer.lex = function(src, options) {
	  var lexer = new Lexer(options);
	  return lexer.lex(src);
	};

	/**
	 * Preprocessing
	 */

	Lexer.prototype.lex = function(src) {
	  src = src
	    .replace(/\r\n|\r/g, '\n')
	    .replace(/\t/g, '    ')
	    .replace(/\u00a0/g, ' ')
	    .replace(/\u2424/g, '\n');

	  return this.token(src, true);
	};

	/**
	 * Lexing
	 */

	Lexer.prototype.token = function(src, top, bq) {
	  var src = src.replace(/^ +$/gm, '')
	    , next
	    , loose
	    , cap
	    , bull
	    , b
	    , item
	    , space
	    , i
	    , l;

	  while (src) {
	    // newline
	    if (cap = this.rules.newline.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[0].length > 1) {
	        this.tokens.push({
	          type: 'space'
	        });
	      }
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      cap = cap[0].replace(/^ {4}/gm, '');
	      this.tokens.push({
	        type: 'code',
	        text: !this.options.pedantic
	          ? cap.replace(/\n+$/, '')
	          : cap
	      });
	      continue;
	    }

	    // fences (gfm)
	    if (cap = this.rules.fences.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'code',
	        lang: cap[2],
	        text: cap[3]
	      });
	      continue;
	    }

	    // heading
	    if (cap = this.rules.heading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[1].length,
	        text: cap[2]
	      });
	      continue;
	    }

	    // table no leading pipe (gfm)
	    if (top && (cap = this.rules.nptable.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i].split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // lheading
	    if (cap = this.rules.lheading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[2] === '=' ? 1 : 2,
	        text: cap[1]
	      });
	      continue;
	    }

	    // hr
	    if (cap = this.rules.hr.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'hr'
	      });
	      continue;
	    }

	    // blockquote
	    if (cap = this.rules.blockquote.exec(src)) {
	      src = src.substring(cap[0].length);

	      this.tokens.push({
	        type: 'blockquote_start'
	      });

	      cap = cap[0].replace(/^ *> ?/gm, '');

	      // Pass `top` to keep the current
	      // "toplevel" state. This is exactly
	      // how markdown.pl works.
	      this.token(cap, top, true);

	      this.tokens.push({
	        type: 'blockquote_end'
	      });

	      continue;
	    }

	    // list
	    if (cap = this.rules.list.exec(src)) {
	      src = src.substring(cap[0].length);
	      bull = cap[2];

	      this.tokens.push({
	        type: 'list_start',
	        ordered: bull.length > 1
	      });

	      // Get each top-level item.
	      cap = cap[0].match(this.rules.item);

	      next = false;
	      l = cap.length;
	      i = 0;

	      for (; i < l; i++) {
	        item = cap[i];

	        // Remove the list item's bullet
	        // so it is seen as the next token.
	        space = item.length;
	        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

	        // Outdent whatever the
	        // list item contains. Hacky.
	        if (~item.indexOf('\n ')) {
	          space -= item.length;
	          item = !this.options.pedantic
	            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
	            : item.replace(/^ {1,4}/gm, '');
	        }

	        // Determine whether the next list item belongs here.
	        // Backpedal if it does not belong in this list.
	        if (this.options.smartLists && i !== l - 1) {
	          b = block.bullet.exec(cap[i + 1])[0];
	          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
	            src = cap.slice(i + 1).join('\n') + src;
	            i = l - 1;
	          }
	        }

	        // Determine whether item is loose or not.
	        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
	        // for discount behavior.
	        loose = next || /\n\n(?!\s*$)/.test(item);
	        if (i !== l - 1) {
	          next = item.charAt(item.length - 1) === '\n';
	          if (!loose) loose = next;
	        }

	        this.tokens.push({
	          type: loose
	            ? 'loose_item_start'
	            : 'list_item_start'
	        });

	        // Recurse.
	        this.token(item, false, bq);

	        this.tokens.push({
	          type: 'list_item_end'
	        });
	      }

	      this.tokens.push({
	        type: 'list_end'
	      });

	      continue;
	    }

	    // html
	    if (cap = this.rules.html.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: this.options.sanitize
	          ? 'paragraph'
	          : 'html',
	        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
	        text: cap[0]
	      });
	      continue;
	    }

	    // def
	    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.links[cap[1].toLowerCase()] = {
	        href: cap[2],
	        title: cap[3]
	      };
	      continue;
	    }

	    // table (gfm)
	    if (top && (cap = this.rules.table.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i]
	          .replace(/^ *\| *| *\| *$/g, '')
	          .split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // top-level paragraph
	    if (top && (cap = this.rules.paragraph.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'paragraph',
	        text: cap[1].charAt(cap[1].length - 1) === '\n'
	          ? cap[1].slice(0, -1)
	          : cap[1]
	      });
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      // Top-level should never reach here.
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'text',
	        text: cap[0]
	      });
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return this.tokens;
	};

	/**
	 * Inline-Level Grammar
	 */

	var inline = {
	  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
	  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
	  url: noop,
	  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
	  link: /^!?\[(inside)\]\(href\)/,
	  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
	  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
	  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
	  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
	  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
	  br: /^ {2,}\n(?!\s*$)/,
	  del: noop,
	  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
	};

	inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
	inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

	inline.link = replace(inline.link)
	  ('inside', inline._inside)
	  ('href', inline._href)
	  ();

	inline.reflink = replace(inline.reflink)
	  ('inside', inline._inside)
	  ();

	/**
	 * Normal Inline Grammar
	 */

	inline.normal = merge({}, inline);

	/**
	 * Pedantic Inline Grammar
	 */

	inline.pedantic = merge({}, inline.normal, {
	  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
	  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	});

	/**
	 * GFM Inline Grammar
	 */

	inline.gfm = merge({}, inline.normal, {
	  escape: replace(inline.escape)('])', '~|])')(),
	  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
	  del: /^~~(?=\S)([\s\S]*?\S)~~/,
	  text: replace(inline.text)
	    (']|', '~]|')
	    ('|', '|https?://|')
	    ()
	});

	/**
	 * GFM + Line Breaks Inline Grammar
	 */

	inline.breaks = merge({}, inline.gfm, {
	  br: replace(inline.br)('{2,}', '*')(),
	  text: replace(inline.gfm.text)('{2,}', '*')()
	});

	/**
	 * Inline Lexer & Compiler
	 */

	function InlineLexer(links, options) {
	  this.options = options || marked.defaults;
	  this.links = links;
	  this.rules = inline.normal;
	  this.renderer = this.options.renderer || new Renderer;
	  this.renderer.options = this.options;

	  if (!this.links) {
	    throw new
	      Error('Tokens array requires a `links` property.');
	  }

	  if (this.options.gfm) {
	    if (this.options.breaks) {
	      this.rules = inline.breaks;
	    } else {
	      this.rules = inline.gfm;
	    }
	  } else if (this.options.pedantic) {
	    this.rules = inline.pedantic;
	  }
	}

	/**
	 * Expose Inline Rules
	 */

	InlineLexer.rules = inline;

	/**
	 * Static Lexing/Compiling Method
	 */

	InlineLexer.output = function(src, links, options) {
	  var inline = new InlineLexer(links, options);
	  return inline.output(src);
	};

	/**
	 * Lexing/Compiling
	 */

	InlineLexer.prototype.output = function(src) {
	  var out = ''
	    , link
	    , text
	    , href
	    , cap;

	  while (src) {
	    // escape
	    if (cap = this.rules.escape.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += cap[1];
	      continue;
	    }

	    // autolink
	    if (cap = this.rules.autolink.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[2] === '@') {
	        text = cap[1].charAt(6) === ':'
	          ? this.mangle(cap[1].substring(7))
	          : this.mangle(cap[1]);
	        href = this.mangle('mailto:') + text;
	      } else {
	        text = escape(cap[1]);
	        href = text;
	      }
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // url (gfm)
	    if (!this.inLink && (cap = this.rules.url.exec(src))) {
	      src = src.substring(cap[0].length);
	      text = escape(cap[1]);
	      href = text;
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // tag
	    if (cap = this.rules.tag.exec(src)) {
	      if (!this.inLink && /^<a /i.test(cap[0])) {
	        this.inLink = true;
	      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
	        this.inLink = false;
	      }
	      src = src.substring(cap[0].length);
	      out += this.options.sanitize
	        ? escape(cap[0])
	        : cap[0];
	      continue;
	    }

	    // link
	    if (cap = this.rules.link.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.inLink = true;
	      out += this.outputLink(cap, {
	        href: cap[2],
	        title: cap[3]
	      });
	      this.inLink = false;
	      continue;
	    }

	    // reflink, nolink
	    if ((cap = this.rules.reflink.exec(src))
	        || (cap = this.rules.nolink.exec(src))) {
	      src = src.substring(cap[0].length);
	      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	      link = this.links[link.toLowerCase()];
	      if (!link || !link.href) {
	        out += cap[0].charAt(0);
	        src = cap[0].substring(1) + src;
	        continue;
	      }
	      this.inLink = true;
	      out += this.outputLink(cap, link);
	      this.inLink = false;
	      continue;
	    }

	    // strong
	    if (cap = this.rules.strong.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.strong(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // em
	    if (cap = this.rules.em.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.em(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.codespan(escape(cap[2], true));
	      continue;
	    }

	    // br
	    if (cap = this.rules.br.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.br();
	      continue;
	    }

	    // del (gfm)
	    if (cap = this.rules.del.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.del(this.output(cap[1]));
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += escape(this.smartypants(cap[0]));
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return out;
	};

	/**
	 * Compile Link
	 */

	InlineLexer.prototype.outputLink = function(cap, link) {
	  var href = escape(link.href)
	    , title = link.title ? escape(link.title) : null;

	  return cap[0].charAt(0) !== '!'
	    ? this.renderer.link(href, title, this.output(cap[1]))
	    : this.renderer.image(href, title, escape(cap[1]));
	};

	/**
	 * Smartypants Transformations
	 */

	InlineLexer.prototype.smartypants = function(text) {
	  if (!this.options.smartypants) return text;
	  return text
	    // em-dashes
	    .replace(/--/g, '\u2014')
	    // opening singles
	    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
	    // closing singles & apostrophes
	    .replace(/'/g, '\u2019')
	    // opening doubles
	    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
	    // closing doubles
	    .replace(/"/g, '\u201d')
	    // ellipses
	    .replace(/\.{3}/g, '\u2026');
	};

	/**
	 * Mangle Links
	 */

	InlineLexer.prototype.mangle = function(text) {
	  var out = ''
	    , l = text.length
	    , i = 0
	    , ch;

	  for (; i < l; i++) {
	    ch = text.charCodeAt(i);
	    if (Math.random() > 0.5) {
	      ch = 'x' + ch.toString(16);
	    }
	    out += '&#' + ch + ';';
	  }

	  return out;
	};

	/**
	 * Renderer
	 */

	function Renderer(options) {
	  this.options = options || {};
	}

	Renderer.prototype.code = function(code, lang, escaped) {
	  if (this.options.highlight) {
	    var out = this.options.highlight(code, lang);
	    if (out != null && out !== code) {
	      escaped = true;
	      code = out;
	    }
	  }

	  if (!lang) {
	    return '<pre><code>'
	      + (escaped ? code : escape(code, true))
	      + '\n</code></pre>';
	  }

	  return '<pre><code class="'
	    + this.options.langPrefix
	    + escape(lang, true)
	    + '">'
	    + (escaped ? code : escape(code, true))
	    + '\n</code></pre>\n';
	};

	Renderer.prototype.blockquote = function(quote) {
	  return '<blockquote>\n' + quote + '</blockquote>\n';
	};

	Renderer.prototype.html = function(html) {
	  return html;
	};

	Renderer.prototype.heading = function(text, level, raw) {
	  return '<h'
	    + level
	    + ' id="'
	    + this.options.headerPrefix
	    + raw.toLowerCase().replace(/[^\w]+/g, '-')
	    + '">'
	    + text
	    + '</h'
	    + level
	    + '>\n';
	};

	Renderer.prototype.hr = function() {
	  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
	};

	Renderer.prototype.list = function(body, ordered) {
	  var type = ordered ? 'ol' : 'ul';
	  return '<' + type + '>\n' + body + '</' + type + '>\n';
	};

	Renderer.prototype.listitem = function(text) {
	  return '<li>' + text + '</li>\n';
	};

	Renderer.prototype.paragraph = function(text) {
	  return '<p>' + text + '</p>\n';
	};

	Renderer.prototype.table = function(header, body) {
	  return '<table>\n'
	    + '<thead>\n'
	    + header
	    + '</thead>\n'
	    + '<tbody>\n'
	    + body
	    + '</tbody>\n'
	    + '</table>\n';
	};

	Renderer.prototype.tablerow = function(content) {
	  return '<tr>\n' + content + '</tr>\n';
	};

	Renderer.prototype.tablecell = function(content, flags) {
	  var type = flags.header ? 'th' : 'td';
	  var tag = flags.align
	    ? '<' + type + ' style="text-align:' + flags.align + '">'
	    : '<' + type + '>';
	  return tag + content + '</' + type + '>\n';
	};

	// span level renderer
	Renderer.prototype.strong = function(text) {
	  return '<strong>' + text + '</strong>';
	};

	Renderer.prototype.em = function(text) {
	  return '<em>' + text + '</em>';
	};

	Renderer.prototype.codespan = function(text) {
	  return '<code>' + text + '</code>';
	};

	Renderer.prototype.br = function() {
	  return this.options.xhtml ? '<br/>' : '<br>';
	};

	Renderer.prototype.del = function(text) {
	  return '<del>' + text + '</del>';
	};

	Renderer.prototype.link = function(href, title, text) {
	  if (this.options.sanitize) {
	    try {
	      var prot = decodeURIComponent(unescape(href))
	        .replace(/[^\w:]/g, '')
	        .toLowerCase();
	    } catch (e) {
	      return '';
	    }
	    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
	      return '';
	    }
	  }
	  var out = '<a href="' + href + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += '>' + text + '</a>';
	  return out;
	};

	Renderer.prototype.image = function(href, title, text) {
	  var out = '<img src="' + href + '" alt="' + text + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += this.options.xhtml ? '/>' : '>';
	  return out;
	};

	/**
	 * Parsing & Compiling
	 */

	function Parser(options) {
	  this.tokens = [];
	  this.token = null;
	  this.options = options || marked.defaults;
	  this.options.renderer = this.options.renderer || new Renderer;
	  this.renderer = this.options.renderer;
	  this.renderer.options = this.options;
	}

	/**
	 * Static Parse Method
	 */

	Parser.parse = function(src, options, renderer) {
	  var parser = new Parser(options, renderer);
	  return parser.parse(src);
	};

	/**
	 * Parse Loop
	 */

	Parser.prototype.parse = function(src) {
	  this.inline = new InlineLexer(src.links, this.options, this.renderer);
	  this.tokens = src.reverse();

	  var out = '';
	  while (this.next()) {
	    out += this.tok();
	  }

	  return out;
	};

	/**
	 * Next Token
	 */

	Parser.prototype.next = function() {
	  return this.token = this.tokens.pop();
	};

	/**
	 * Preview Next Token
	 */

	Parser.prototype.peek = function() {
	  return this.tokens[this.tokens.length - 1] || 0;
	};

	/**
	 * Parse Text Tokens
	 */

	Parser.prototype.parseText = function() {
	  var body = this.token.text;

	  while (this.peek().type === 'text') {
	    body += '\n' + this.next().text;
	  }

	  return this.inline.output(body);
	};

	/**
	 * Parse Current Token
	 */

	Parser.prototype.tok = function() {
	  switch (this.token.type) {
	    case 'space': {
	      return '';
	    }
	    case 'hr': {
	      return this.renderer.hr();
	    }
	    case 'heading': {
	      return this.renderer.heading(
	        this.inline.output(this.token.text),
	        this.token.depth,
	        this.token.text);
	    }
	    case 'code': {
	      return this.renderer.code(this.token.text,
	        this.token.lang,
	        this.token.escaped);
	    }
	    case 'table': {
	      var header = ''
	        , body = ''
	        , i
	        , row
	        , cell
	        , flags
	        , j;

	      // header
	      cell = '';
	      for (i = 0; i < this.token.header.length; i++) {
	        flags = { header: true, align: this.token.align[i] };
	        cell += this.renderer.tablecell(
	          this.inline.output(this.token.header[i]),
	          { header: true, align: this.token.align[i] }
	        );
	      }
	      header += this.renderer.tablerow(cell);

	      for (i = 0; i < this.token.cells.length; i++) {
	        row = this.token.cells[i];

	        cell = '';
	        for (j = 0; j < row.length; j++) {
	          cell += this.renderer.tablecell(
	            this.inline.output(row[j]),
	            { header: false, align: this.token.align[j] }
	          );
	        }

	        body += this.renderer.tablerow(cell);
	      }
	      return this.renderer.table(header, body);
	    }
	    case 'blockquote_start': {
	      var body = '';

	      while (this.next().type !== 'blockquote_end') {
	        body += this.tok();
	      }

	      return this.renderer.blockquote(body);
	    }
	    case 'list_start': {
	      var body = ''
	        , ordered = this.token.ordered;

	      while (this.next().type !== 'list_end') {
	        body += this.tok();
	      }

	      return this.renderer.list(body, ordered);
	    }
	    case 'list_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.token.type === 'text'
	          ? this.parseText()
	          : this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'loose_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'html': {
	      var html = !this.token.pre && !this.options.pedantic
	        ? this.inline.output(this.token.text)
	        : this.token.text;
	      return this.renderer.html(html);
	    }
	    case 'paragraph': {
	      return this.renderer.paragraph(this.inline.output(this.token.text));
	    }
	    case 'text': {
	      return this.renderer.paragraph(this.parseText());
	    }
	  }
	};

	/**
	 * Helpers
	 */

	function escape(html, encode) {
	  return html
	    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;')
	    .replace(/'/g, '&#39;');
	}

	function unescape(html) {
	  return html.replace(/&([#\w]+);/g, function(_, n) {
	    n = n.toLowerCase();
	    if (n === 'colon') return ':';
	    if (n.charAt(0) === '#') {
	      return n.charAt(1) === 'x'
	        ? String.fromCharCode(parseInt(n.substring(2), 16))
	        : String.fromCharCode(+n.substring(1));
	    }
	    return '';
	  });
	}

	function replace(regex, opt) {
	  regex = regex.source;
	  opt = opt || '';
	  return function self(name, val) {
	    if (!name) return new RegExp(regex, opt);
	    val = val.source || val;
	    val = val.replace(/(^|[^\[])\^/g, '$1');
	    regex = regex.replace(name, val);
	    return self;
	  };
	}

	function noop() {}
	noop.exec = noop;

	function merge(obj) {
	  var i = 1
	    , target
	    , key;

	  for (; i < arguments.length; i++) {
	    target = arguments[i];
	    for (key in target) {
	      if (Object.prototype.hasOwnProperty.call(target, key)) {
	        obj[key] = target[key];
	      }
	    }
	  }

	  return obj;
	}


	/**
	 * Marked
	 */

	function marked(src, opt, callback) {
	  if (callback || typeof opt === 'function') {
	    if (!callback) {
	      callback = opt;
	      opt = null;
	    }

	    opt = merge({}, marked.defaults, opt || {});

	    var highlight = opt.highlight
	      , tokens
	      , pending
	      , i = 0;

	    try {
	      tokens = Lexer.lex(src, opt)
	    } catch (e) {
	      return callback(e);
	    }

	    pending = tokens.length;

	    var done = function(err) {
	      if (err) {
	        opt.highlight = highlight;
	        return callback(err);
	      }

	      var out;

	      try {
	        out = Parser.parse(tokens, opt);
	      } catch (e) {
	        err = e;
	      }

	      opt.highlight = highlight;

	      return err
	        ? callback(err)
	        : callback(null, out);
	    };

	    if (!highlight || highlight.length < 3) {
	      return done();
	    }

	    delete opt.highlight;

	    if (!pending) return done();

	    for (; i < tokens.length; i++) {
	      (function(token) {
	        if (token.type !== 'code') {
	          return --pending || done();
	        }
	        return highlight(token.text, token.lang, function(err, code) {
	          if (err) return done(err);
	          if (code == null || code === token.text) {
	            return --pending || done();
	          }
	          token.text = code;
	          token.escaped = true;
	          --pending || done();
	        });
	      })(tokens[i]);
	    }

	    return;
	  }
	  try {
	    if (opt) opt = merge({}, marked.defaults, opt);
	    return Parser.parse(Lexer.lex(src, opt), opt);
	  } catch (e) {
	    e.message += '\nPlease report this to https://github.com/chjj/marked.';
	    if ((opt || marked.defaults).silent) {
	      return '<p>An error occured:</p><pre>'
	        + escape(e.message + '', true)
	        + '</pre>';
	    }
	    throw e;
	  }
	}

	/**
	 * Options
	 */

	marked.options =
	marked.setOptions = function(opt) {
	  merge(marked.defaults, opt);
	  return marked;
	};

	marked.defaults = {
	  gfm: true,
	  tables: true,
	  breaks: false,
	  pedantic: false,
	  sanitize: false,
	  smartLists: false,
	  silent: false,
	  highlight: null,
	  langPrefix: 'lang-',
	  smartypants: false,
	  headerPrefix: '',
	  renderer: new Renderer,
	  xhtml: false
	};

	/**
	 * Expose
	 */

	marked.Parser = Parser;
	marked.parser = Parser.parse;

	marked.Renderer = Renderer;

	marked.Lexer = Lexer;
	marked.lexer = Lexer.lex;

	marked.InlineLexer = InlineLexer;
	marked.inlineLexer = InlineLexer.output;

	marked.parse = marked;

	if (true) {
	  module.exports = marked;
	} else if (typeof define === 'function' && define.amd) {
	  define(function() { return marked; });
	} else {
	  this.marked = marked;
	}

	}).call(function() {
	  return this || (typeof window !== 'undefined' ? window : global);
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';
	/*eslint-disable no-undef*/
	var visitors = __webpack_require__(184);
	var transform = __webpack_require__(218).transform;
	var typesSyntax = __webpack_require__(190);
	var inlineSourceMap = __webpack_require__(185);

	module.exports = {
	  transform: function(input, options) {
	    options = processOptions(options);
	    var output = innerTransform(input, options);
	    var result = output.code;
	    if (options.sourceMap) {
	      var map = inlineSourceMap(
	        output.sourceMap,
	        input,
	        options.filename
	      );
	      result += '\n' + map;
	    }
	    return result;
	  },
	  transformWithDetails: function(input, options) {
	    options = processOptions(options);
	    var output = innerTransform(input, options);
	    var result = {};
	    result.code = output.code;
	    if (options.sourceMap) {
	      result.sourceMap = output.sourceMap.toJSON();
	    }
	    if (options.filename) {
	      result.sourceMap.sources = [options.filename];
	    }
	    return result;
	  }
	};

	/**
	 * Only copy the values that we need. We'll do some preprocessing to account for
	 * converting command line flags to options that jstransform can actually use.
	 */
	function processOptions(opts) {
	  opts = opts || {};
	  var options = {};

	  options.harmony = opts.harmony;
	  options.stripTypes = opts.stripTypes;
	  options.sourceMap = opts.sourceMap;
	  options.filename = opts.sourceFilename;

	  if (opts.es6module) {
	    options.sourceType = 'module';
	  }
	  if (opts.nonStrictEs6module) {
	    options.sourceType = 'nonStrictModule';
	  }

	  // Instead of doing any fancy validation, only look for 'es3'. If we have
	  // that, then use it. Otherwise use 'es5'.
	  options.es3 = opts.target === 'es3';
	  options.es5 = !options.es3;

	  return options;
	}

	function innerTransform(input, options) {
	  var visitorSets = ['react'];
	  if (options.harmony) {
	    visitorSets.push('harmony');
	  }

	  if (options.es3) {
	    visitorSets.push('es3');
	  }

	  if (options.stripTypes) {
	    // Stripping types needs to happen before the other transforms
	    // unfortunately, due to bad interactions. For example,
	    // es6-rest-param-visitors conflict with stripping rest param type
	    // annotation
	    input = transform(typesSyntax.visitorList, input, options).code;
	  }

	  var visitorList = visitors.getVisitorsBySet(visitorSets);
	  return transform(visitorList, input, options);
	}


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	/*
	   style.ts provides a minimalistic way to define CSS
	   classes using JavaScript structures.

	   For the rationale for using JS as a CSS generator, see
	   https://speakerdeck.com/vjeux/react-css-in-js .

	   In addition to the benefits discussed there,
	   defining them in TypeScript allows compile-time
	   checking of style references in components.

	   Unlike the implementation described in that presentation,
	   this implementation does not use inline styles but
	   instead generates CSS classes in a very simple way.
	   
	   The resulting CSS is consequently easy to read/tweak/post-process
	   and work with in browser development tools.
	*/
	var assign = __webpack_require__(186);
	// see http://facebook.github.io/react/tips/style-props-value-px.html
	var NON_PX_PROPERTIES = [
	    'columnCount',
	    'fillOpacity',
	    'flex',
	    'flexGrow',
	    'flexShrink',
	    'fontWeight',
	    'lineClamp',
	    'lineHeight',
	    'opacity',
	    'order',
	    'orphans',
	    'widows',
	    'zIndex',
	    'zoom'
	];
	/** A style registry holds a collection of named
	  * styles created by calls to create()
	  */
	var Registry = (function () {
	    function Registry() {
	        this.styleMap = {};
	    }
	    Registry.prototype.add = function (style) {
	        this.styleMap[style.key] = style;
	    };
	    Registry.prototype.styles = function () {
	        return this.styleMap;
	    };
	    /** Returns CSS markup for all of the styles
	      * in the registry
	      */
	    Registry.prototype.generateCSS = function () {
	        var _this = this;
	        return Object.keys(this.styleMap).map(function (key) {
	            return compile(_this.styleMap[key]);
	        }).join('\n\n');
	    };
	    return Registry;
	})();
	exports.Registry = Registry;
	/** A global registry of all styles defined via style.create()
	  */
	exports.registry = new Registry();
	function isSpecialProp(key) {
	    return key === 'key' || key === 'parent' || key === 'mixins';
	}
	function addKeys(tree, prefix) {
	    Object.keys(tree).forEach(function (k) {
	        var prop = tree[k];
	        if (typeof prop === 'object' && prop !== tree && prop.key === undefined && prop.parent === undefined) {
	            addKeys(prop, '');
	            prop.key = prefix + hyphenate(k);
	            prop.parent = tree;
	        }
	    });
	}
	/** Given an object tree that defines styles
	  * and their properties, returns a tree of Style
	  * objects that can later be passed to compile()
	  * to generate CSS or className() to get the class
	  * names for a style.
	  *
	  * eg:
	  *   var styles = style.create({
	  *     classA: {
	  *       backgroundColor: 'white',
	  *       width: 100
	  *     }
	  *   }, 'my-app');
	  *   style.compile(styles);
	  *
	  * Generates:
	  *
	  *  .my-app-class-a {
	  *    background-color: 'white';
	  *    width: 100px;
	  *  }
	  *
	  * All styles defined via create() are added to the global
	  * registry, which allows generation of the CSS for all
	  * styles defined by modules loaded via a particular entry
	  * point.
	  *
	  * @param namespace An optional namespace which is
	  *                  added as a prefix in front of all generated
	  *                  class names. If the namespace is a filename or path
	  *                  then the basename will be extracted and hyphenated,
	  *                  eg. '/myapp/myComponent.js' -> 'my-component'.
	  *
	  *                  A convention is to pass __filename as the namespace
	  *                  argument, to make it easy to find where a generated
	  *                  class was defined.
	  */
	function create(tree, namespace, localRegistry) {
	    if (localRegistry === void 0) { localRegistry = exports.registry; }
	    if (typeof namespace === 'string') {
	        // if the namespace if a filename or path, extract the basename
	        // and hyphenate it
	        if (namespace.indexOf('.') !== -1 || namespace.indexOf('/') !== -1) {
	            var basenameRegEx = /([^/\.]+)\.[^\.]+$/;
	            var basenameMatch = namespace.match(basenameRegEx);
	            if (basenameMatch) {
	                var basename = basenameMatch[1];
	                namespace = hyphenate(basename.replace('_', '-'));
	            }
	        }
	    }
	    else {
	        namespace = '';
	    }
	    if (namespace.length > 0 && namespace[namespace.length - 1] !== '-') {
	        namespace += '-';
	    }
	    addKeys(tree, namespace);
	    Object.keys(tree).forEach(function (k) {
	        var style = tree[k];
	        if (style.key) {
	            localRegistry.add(style);
	        }
	    });
	    return tree;
	}
	exports.create = create;
	function className(style) {
	    var name = style.key ? style.key : '';
	    if (style.parent) {
	        var parentClass = className(style.parent);
	        if (parentClass) {
	            if (name[0].match(/[a-z]/)) {
	                name = parentClass + '-' + name;
	            }
	            else {
	                name = parentClass + name;
	            }
	        }
	    }
	    return name;
	}
	/** Given a list of objects from a style tree generated
	  * by style.create(), returns a space-separated list
	  * of class-names for those styles in the CSS generated
	  * by compile()
	  */
	function classes() {
	    var objects = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        objects[_i - 0] = arguments[_i];
	    }
	    var classNames = '';
	    objects.forEach(function (object) {
	        if (!object) {
	            return;
	        }
	        var compiled = object;
	        if (classNames.length > 0) {
	            classNames += ' ';
	        }
	        classNames += className(compiled);
	    });
	    return classNames;
	}
	exports.classes = classes;
	function hyphenate(name) {
	    // adapted from React's hyphenate.js
	    var uppercasePattern = /([A-Z])/g;
	    return name.replace(uppercasePattern, '-$1').toLowerCase();
	}
	function cssPropValue(propName, value) {
	    if (typeof value == 'number' && NON_PX_PROPERTIES.indexOf(propName) === -1) {
	        return value + 'px';
	    }
	    else {
	        return value.toString();
	    }
	}
	function cssClass(name, exprs) {
	    var css = '.' + name + ' {\n';
	    exprs.forEach(function (expr, index) {
	        css += '  ' + expr + ';\n';
	    });
	    css += '}';
	    return css;
	}
	/** Given a style tree generated by create(),
	  * returns the CSS for the classes defined
	  * in that tree.
	  */
	function compile(tree) {
	    var classes = [];
	    var cssProps = [];
	    Object.keys(tree).forEach(function (k) {
	        if (isSpecialProp(k)) {
	            return;
	        }
	        var prop = tree[k];
	        if (typeof prop == 'object') {
	            classes.push(compile(prop));
	        }
	        else {
	            cssProps.push(hyphenate(k) + ': ' + cssPropValue(k, prop));
	        }
	    });
	    var style = tree;
	    var css = '';
	    if (style.key && cssProps.length > 0) {
	        css = cssClass(className(style), cssProps);
	    }
	    return [css].concat(classes).join('\n\n');
	}
	exports.compile = compile;
	/** Returns true if @p obj is a style tree returned by style.create()
	  * or an element of one.
	  */
	function isStyle(obj) {
	    return 'key' in obj;
	}
	exports.isStyle = isStyle;
	function flattenMixins(styles) {
	    if (styles instanceof Array) {
	        var styleList = [];
	        styles.forEach(function (style) {
	            if (!style) {
	                return;
	            }
	            if (style.mixins) {
	                style.mixins.forEach(function (style) {
	                    styleList.push(style);
	                });
	            }
	            styleList.push(style);
	        });
	        return styleList;
	    }
	    else if (styles instanceof Object) {
	        var style = styles;
	        if (style.mixins) {
	            return flattenMixins([styles]);
	        }
	        else {
	            return styles;
	        }
	    }
	    else {
	        return null;
	    }
	}
	function combine(styles) {
	    var inlineStyles;
	    // where CSS classes have conflicting properties,
	    // use inline styles
	    var usedProps = {};
	    styles.forEach(function (style) {
	        if (!style) {
	            return;
	        }
	        var isInline = !('key' in style);
	        for (var prop in style) {
	            // ignore properties added by style.create()
	            // and nested styles
	            if (isSpecialProp(prop)) {
	                continue;
	            }
	            var value = style[prop];
	            if (typeof value === 'number' || typeof value === 'string') {
	                if (usedProps[prop] || isInline) {
	                    inlineStyles = inlineStyles || {};
	                    inlineStyles[prop] = value;
	                }
	                usedProps[prop] = true;
	            }
	        }
	    });
	    return {
	        style: inlineStyles,
	        className: classes.apply(null, styles)
	    };
	}
	/** mixin() is a utility function for use with React which takes the
	  * props object for a component and adds the necessary additional
	  * 'className' and/or 'style' props to apply styling from
	  * a style returned by create(). 'styles' can be a single
	  * style or an array of styles.
	  */
	function mixin(styles, props) {
	    props = props || {};
	    styles = flattenMixins(styles);
	    if (styles instanceof Array) {
	        var styleProps = combine(styles);
	        if (styleProps.className) {
	            props.className = styleProps.className;
	        }
	        if (styleProps.style) {
	            props.style = styleProps.style;
	        }
	    }
	    else if (styles instanceof Object) {
	        var style = styles;
	        if (style.key) {
	            props.className = classes(style);
	        }
	        else {
	            props.style = style;
	        }
	    }
	    return props;
	}
	exports.mixin = mixin;
	/** Merges a set of inline style objects together into
	  * a single style.
	  *
	  * This can be used to create mixins.
	  */
	function merge() {
	    var styles = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        styles[_i - 0] = arguments[_i];
	    }
	    var merged = {};
	    styles.forEach(function (style) {
	        assign(merged, style);
	    });
	    delete merged.key;
	    delete merged.parent;
	    return merged;
	}
	exports.merge = merge;


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var assign = __webpack_require__(33);
	var ReactPropTypes = __webpack_require__(2).PropTypes;
	var Route = __webpack_require__(53);

	var PropTypes = assign({}, ReactPropTypes, {

	  /**
	   * Indicates that a prop should be falsy.
	   */
	  falsy: function falsy(props, propName, componentName) {
	    if (props[propName]) {
	      return new Error("<" + componentName + "> may not have a \"" + propName + "\" prop");
	    }
	  },

	  /**
	   * Indicates that a prop should be a Route object.
	   */
	  route: ReactPropTypes.instanceOf(Route),

	  /**
	   * Indicates that a prop should be a Router object.
	   */
	  //router: ReactPropTypes.instanceOf(Router) // TODO
	  router: ReactPropTypes.func

	});

	module.exports = PropTypes;

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	/**
	 * This component is necessary to get around a context warning
	 * present in React 0.13.0. It sovles this by providing a separation
	 * between the "owner" and "parent" contexts.
	 */

	var React = __webpack_require__(2);

	var ContextWrapper = (function (_React$Component) {
	  function ContextWrapper() {
	    _classCallCheck(this, ContextWrapper);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(ContextWrapper, _React$Component);

	  _createClass(ContextWrapper, {
	    render: {
	      value: function render() {
	        return this.props.children;
	      }
	    }
	  });

	  return ContextWrapper;
	})(React.Component);

	module.exports = ContextWrapper;

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Actions that modify the URL.
	 */
	var LocationActions = {

	  /**
	   * Indicates a new location is being pushed to the history stack.
	   */
	  PUSH: "push",

	  /**
	   * Indicates the current location should be replaced.
	   */
	  REPLACE: "replace",

	  /**
	   * Indicates the most recent entry should be removed from the history stack.
	   */
	  POP: "pop"

	};

	module.exports = LocationActions;

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var invariant = __webpack_require__(63);
	var objectAssign = __webpack_require__(189);
	var qs = __webpack_require__(188);

	var paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
	var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;
	var paramInjectTrailingSlashMatcher = /\/\/\?|\/\?\/|\/\?/g;
	var queryMatcher = /\?(.*)$/;

	var _compiledPatterns = {};

	function compilePattern(pattern) {
	  if (!(pattern in _compiledPatterns)) {
	    var paramNames = [];
	    var source = pattern.replace(paramCompileMatcher, function (match, paramName) {
	      if (paramName) {
	        paramNames.push(paramName);
	        return "([^/?#]+)";
	      } else if (match === "*") {
	        paramNames.push("splat");
	        return "(.*?)";
	      } else {
	        return "\\" + match;
	      }
	    });

	    _compiledPatterns[pattern] = {
	      matcher: new RegExp("^" + source + "$", "i"),
	      paramNames: paramNames
	    };
	  }

	  return _compiledPatterns[pattern];
	}

	var PathUtils = {

	  /**
	   * Returns true if the given path is absolute.
	   */
	  isAbsolute: function isAbsolute(path) {
	    return path.charAt(0) === "/";
	  },

	  /**
	   * Joins two URL paths together.
	   */
	  join: function join(a, b) {
	    return a.replace(/\/*$/, "/") + b;
	  },

	  /**
	   * Returns an array of the names of all parameters in the given pattern.
	   */
	  extractParamNames: function extractParamNames(pattern) {
	    return compilePattern(pattern).paramNames;
	  },

	  /**
	   * Extracts the portions of the given URL path that match the given pattern
	   * and returns an object of param name => value pairs. Returns null if the
	   * pattern does not match the given path.
	   */
	  extractParams: function extractParams(pattern, path) {
	    var _compilePattern = compilePattern(pattern);

	    var matcher = _compilePattern.matcher;
	    var paramNames = _compilePattern.paramNames;

	    var match = path.match(matcher);

	    if (!match) {
	      return null;
	    }var params = {};

	    paramNames.forEach(function (paramName, index) {
	      params[paramName] = match[index + 1];
	    });

	    return params;
	  },

	  /**
	   * Returns a version of the given route path with params interpolated. Throws
	   * if there is a dynamic segment of the route path for which there is no param.
	   */
	  injectParams: function injectParams(pattern, params) {
	    params = params || {};

	    var splatIndex = 0;

	    return pattern.replace(paramInjectMatcher, function (match, paramName) {
	      paramName = paramName || "splat";

	      // If param is optional don't check for existence
	      if (paramName.slice(-1) === "?") {
	        paramName = paramName.slice(0, -1);

	        if (params[paramName] == null) return "";
	      } else {
	        invariant(params[paramName] != null, "Missing \"%s\" parameter for path \"%s\"", paramName, pattern);
	      }

	      var segment;
	      if (paramName === "splat" && Array.isArray(params[paramName])) {
	        segment = params[paramName][splatIndex++];

	        invariant(segment != null, "Missing splat # %s for path \"%s\"", splatIndex, pattern);
	      } else {
	        segment = params[paramName];
	      }

	      return segment;
	    }).replace(paramInjectTrailingSlashMatcher, "/");
	  },

	  /**
	   * Returns an object that is the result of parsing any query string contained
	   * in the given path, null if the path contains no query string.
	   */
	  extractQuery: function extractQuery(path) {
	    var match = path.match(queryMatcher);
	    return match && qs.parse(match[1]);
	  },

	  /**
	   * Returns a version of the given path without the query string.
	   */
	  withoutQuery: function withoutQuery(path) {
	    return path.replace(queryMatcher, "");
	  },

	  /**
	   * Returns a version of the given path with the parameters in the given
	   * query merged into the query string.
	   */
	  withQuery: function withQuery(path, query) {
	    var existingQuery = PathUtils.extractQuery(path);

	    if (existingQuery) query = query ? objectAssign(existingQuery, query) : existingQuery;

	    var queryString = qs.stringify(query, { arrayFormat: "brackets" });

	    if (queryString) {
	      return PathUtils.withoutQuery(path) + "?" + queryString;
	    }return PathUtils.withoutQuery(path);
	  }

	};

	module.exports = PathUtils;

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var invariant = __webpack_require__(63);
	var canUseDOM = __webpack_require__(36).canUseDOM;
	var getWindowScrollPosition = __webpack_require__(187);

	function shouldUpdateScroll(state, prevState) {
	  if (!prevState) {
	    return true;
	  } // Don't update scroll position when only the query has changed.
	  if (state.pathname === prevState.pathname) {
	    return false;
	  }var routes = state.routes;
	  var prevRoutes = prevState.routes;

	  var sharedAncestorRoutes = routes.filter(function (route) {
	    return prevRoutes.indexOf(route) !== -1;
	  });

	  return !sharedAncestorRoutes.some(function (route) {
	    return route.ignoreScrollBehavior;
	  });
	}

	/**
	 * Provides the router with the ability to manage window scroll position
	 * according to its scroll behavior.
	 */
	var ScrollHistory = {

	  statics: {

	    /**
	     * Records curent scroll position as the last known position for the given URL path.
	     */
	    recordScrollPosition: function recordScrollPosition(path) {
	      if (!this.scrollHistory) this.scrollHistory = {};

	      this.scrollHistory[path] = getWindowScrollPosition();
	    },

	    /**
	     * Returns the last known scroll position for the given URL path.
	     */
	    getScrollPosition: function getScrollPosition(path) {
	      if (!this.scrollHistory) this.scrollHistory = {};

	      return this.scrollHistory[path] || null;
	    }

	  },

	  componentWillMount: function componentWillMount() {
	    invariant(this.constructor.getScrollBehavior() == null || canUseDOM, "Cannot use scroll behavior without a DOM");
	  },

	  componentDidMount: function componentDidMount() {
	    this._updateScroll();
	  },

	  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
	    this._updateScroll(prevState);
	  },

	  _updateScroll: function _updateScroll(prevState) {
	    if (!shouldUpdateScroll(this.state, prevState)) {
	      return;
	    }var scrollBehavior = this.constructor.getScrollBehavior();

	    if (scrollBehavior) scrollBehavior.updateScrollPosition(this.constructor.getScrollPosition(this.state.path), this.state.action);
	  }

	};

	module.exports = ScrollHistory;

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(2);

	function isValidChild(object) {
	  return object == null || React.isValidElement(object);
	}

	function isReactChildren(object) {
	  return isValidChild(object) || Array.isArray(object) && object.every(isValidChild);
	}

	module.exports = isReactChildren;

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/* jshint -W058 */

	var Cancellation = __webpack_require__(137);
	var Redirect = __webpack_require__(136);

	/**
	 * Encapsulates a transition to a given path.
	 *
	 * The willTransitionTo and willTransitionFrom handlers receive
	 * an instance of this class as their first argument.
	 */
	function Transition(path, retry) {
	  this.path = path;
	  this.abortReason = null;
	  // TODO: Change this to router.retryTransition(transition)
	  this.retry = retry.bind(this);
	}

	Transition.prototype.abort = function (reason) {
	  if (this.abortReason == null) this.abortReason = reason || "ABORT";
	};

	Transition.prototype.redirect = function (to, params, query) {
	  this.abort(new Redirect(to, params, query));
	};

	Transition.prototype.cancel = function () {
	  this.abort(new Cancellation());
	};

	Transition.from = function (transition, routes, components, callback) {
	  routes.reduce(function (callback, route, index) {
	    return function (error) {
	      if (error || transition.abortReason) {
	        callback(error);
	      } else if (route.onLeave) {
	        try {
	          route.onLeave(transition, components[index], callback);

	          // If there is no callback in the argument list, call it automatically.
	          if (route.onLeave.length < 3) callback();
	        } catch (e) {
	          callback(e);
	        }
	      } else {
	        callback();
	      }
	    };
	  }, callback)();
	};

	Transition.to = function (transition, routes, params, query, callback) {
	  routes.reduceRight(function (callback, route) {
	    return function (error) {
	      if (error || transition.abortReason) {
	        callback(error);
	      } else if (route.onEnter) {
	        try {
	          route.onEnter(transition, params, query, callback);

	          // If there is no callback in the argument list, call it automatically.
	          if (route.onEnter.length < 4) callback();
	        } catch (e) {
	          callback(e);
	        }
	      } else {
	        callback();
	      }
	    };
	  }, callback)();
	};

	module.exports = Transition;

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Encapsulates a redirect to the given route.
	 */
	function Redirect(to, params, query) {
	  this.to = to;
	  this.params = params;
	  this.query = query;
	}

	module.exports = Redirect;

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Represents a cancellation caused by navigating away
	 * before the previous transition has fully resolved.
	 */
	function Cancellation() {}

	module.exports = Cancellation;

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	/* jshint -W084 */
	var PathUtils = __webpack_require__(132);

	function deepSearch(route, pathname, query) {
	  // Check the subtree first to find the most deeply-nested match.
	  var childRoutes = route.childRoutes;
	  if (childRoutes) {
	    var match, childRoute;
	    for (var i = 0, len = childRoutes.length; i < len; ++i) {
	      childRoute = childRoutes[i];

	      if (childRoute.isDefault || childRoute.isNotFound) continue; // Check these in order later.

	      if (match = deepSearch(childRoute, pathname, query)) {
	        // A route in the subtree matched! Add this route and we're done.
	        match.routes.unshift(route);
	        return match;
	      }
	    }
	  }

	  // No child routes matched; try the default route.
	  var defaultRoute = route.defaultRoute;
	  if (defaultRoute && (params = PathUtils.extractParams(defaultRoute.path, pathname))) {
	    return new Match(pathname, params, query, [route, defaultRoute]);
	  } // Does the "not found" route match?
	  var notFoundRoute = route.notFoundRoute;
	  if (notFoundRoute && (params = PathUtils.extractParams(notFoundRoute.path, pathname))) {
	    return new Match(pathname, params, query, [route, notFoundRoute]);
	  } // Last attempt: check this route.
	  var params = PathUtils.extractParams(route.path, pathname);
	  if (params) {
	    return new Match(pathname, params, query, [route]);
	  }return null;
	}

	var Match = (function () {
	  function Match(pathname, params, query, routes) {
	    _classCallCheck(this, Match);

	    this.pathname = pathname;
	    this.params = params;
	    this.query = query;
	    this.routes = routes;
	  }

	  _createClass(Match, null, {
	    findMatch: {

	      /**
	       * Attempts to match depth-first a route in the given route's
	       * subtree against the given path and returns the match if it
	       * succeeds, null if no match can be made.
	       */

	      value: function findMatch(routes, path) {
	        var pathname = PathUtils.withoutQuery(path);
	        var query = PathUtils.extractQuery(path);
	        var match = null;

	        for (var i = 0, len = routes.length; match == null && i < len; ++i) match = deepSearch(routes[i], pathname, query);

	        return match;
	      }
	    }
	  });

	  return Match;
	})();

	module.exports = Match;

/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	function supportsHistory() {
	  /*! taken from modernizr
	   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
	   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
	   * changed to avoid false negatives for Windows Phones: https://github.com/rackt/react-router/issues/586
	   */
	  var ua = navigator.userAgent;
	  if ((ua.indexOf("Android 2.") !== -1 || ua.indexOf("Android 4.0") !== -1) && ua.indexOf("Mobile Safari") !== -1 && ua.indexOf("Chrome") === -1 && ua.indexOf("Windows Phone") === -1) {
	    return false;
	  }
	  return window.history && "pushState" in window.history;
	}

	module.exports = supportsHistory;

/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var loader = __webpack_require__(191);
	var dumper = __webpack_require__(192);


	function deprecated(name) {
	  return function () {
	    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
	  };
	}


	module.exports.Type                = __webpack_require__(193);
	module.exports.Schema              = __webpack_require__(194);
	module.exports.FAILSAFE_SCHEMA     = __webpack_require__(195);
	module.exports.JSON_SCHEMA         = __webpack_require__(196);
	module.exports.CORE_SCHEMA         = __webpack_require__(197);
	module.exports.DEFAULT_SAFE_SCHEMA = __webpack_require__(198);
	module.exports.DEFAULT_FULL_SCHEMA = __webpack_require__(199);
	module.exports.load                = loader.load;
	module.exports.loadAll             = loader.loadAll;
	module.exports.safeLoad            = loader.safeLoad;
	module.exports.safeLoadAll         = loader.safeLoadAll;
	module.exports.dump                = dumper.dump;
	module.exports.safeDump            = dumper.safeDump;
	module.exports.YAMLException       = __webpack_require__(200);

	// Deprecared schema names from JS-YAML 2.0.x
	module.exports.MINIMAL_SCHEMA = __webpack_require__(195);
	module.exports.SAFE_SCHEMA    = __webpack_require__(198);
	module.exports.DEFAULT_SCHEMA = __webpack_require__(199);

	// Deprecated functions from JS-YAML 1.x.x
	module.exports.scan           = deprecated('scan');
	module.exports.parse          = deprecated('parse');
	module.exports.compose        = deprecated('compose');
	module.exports.addConstructor = deprecated('addConstructor');


/***/ },
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	/*global exports:true*/

	'use strict';

	var es6ArrowFunctions =
	  __webpack_require__(219);
	var es6Classes = __webpack_require__(220);
	var es6Destructuring =
	  __webpack_require__(221);
	var es6ObjectConciseMethod =
	  __webpack_require__(222);
	var es6ObjectShortNotation =
	  __webpack_require__(223);
	var es6RestParameters = __webpack_require__(224);
	var es6Templates = __webpack_require__(225);
	var es6CallSpread =
	  __webpack_require__(226);
	var es7SpreadProperty =
	  __webpack_require__(227);
	var react = __webpack_require__(228);
	var reactDisplayName = __webpack_require__(229);
	var reservedWords = __webpack_require__(230);

	/**
	 * Map from transformName => orderedListOfVisitors.
	 */
	var transformVisitors = {
	  'es6-arrow-functions': es6ArrowFunctions.visitorList,
	  'es6-classes': es6Classes.visitorList,
	  'es6-destructuring': es6Destructuring.visitorList,
	  'es6-object-concise-method': es6ObjectConciseMethod.visitorList,
	  'es6-object-short-notation': es6ObjectShortNotation.visitorList,
	  'es6-rest-params': es6RestParameters.visitorList,
	  'es6-templates': es6Templates.visitorList,
	  'es6-call-spread': es6CallSpread.visitorList,
	  'es7-spread-property': es7SpreadProperty.visitorList,
	  'react': react.visitorList.concat(reactDisplayName.visitorList),
	  'reserved-words': reservedWords.visitorList
	};

	var transformSets = {
	  'harmony': [
	    'es6-arrow-functions',
	    'es6-object-concise-method',
	    'es6-object-short-notation',
	    'es6-classes',
	    'es6-rest-params',
	    'es6-templates',
	    'es6-destructuring',
	    'es6-call-spread',
	    'es7-spread-property'
	  ],
	  'es3': [
	    'reserved-words'
	  ],
	  'react': [
	    'react'
	  ]
	};

	/**
	 * Specifies the order in which each transform should run.
	 */
	var transformRunOrder = [
	  'reserved-words',
	  'es6-arrow-functions',
	  'es6-object-concise-method',
	  'es6-object-short-notation',
	  'es6-classes',
	  'es6-rest-params',
	  'es6-templates',
	  'es6-destructuring',
	  'es6-call-spread',
	  'es7-spread-property',
	  'react'
	];

	/**
	 * Given a list of transform names, return the ordered list of visitors to be
	 * passed to the transform() function.
	 *
	 * @param {array?} excludes
	 * @return {array}
	 */
	function getAllVisitors(excludes) {
	  var ret = [];
	  for (var i = 0, il = transformRunOrder.length; i < il; i++) {
	    if (!excludes || excludes.indexOf(transformRunOrder[i]) === -1) {
	      ret = ret.concat(transformVisitors[transformRunOrder[i]]);
	    }
	  }
	  return ret;
	}

	/**
	 * Given a list of visitor set names, return the ordered list of visitors to be
	 * passed to jstransform.
	 *
	 * @param {array}
	 * @return {array}
	 */
	function getVisitorsBySet(sets) {
	  var visitorsToInclude = sets.reduce(function(visitors, set) {
	    if (!transformSets.hasOwnProperty(set)) {
	      throw new Error('Unknown visitor set: ' + set);
	    }
	    transformSets[set].forEach(function(visitor) {
	      visitors[visitor] = true;
	    });
	    return visitors;
	  }, {});

	  var visitorList = [];
	  for (var i = 0; i < transformRunOrder.length; i++) {
	    if (visitorsToInclude.hasOwnProperty(transformRunOrder[i])) {
	      visitorList = visitorList.concat(transformVisitors[transformRunOrder[i]]);
	    }
	  }

	  return visitorList;
	}

	exports.getVisitorsBySet = getVisitorsBySet;
	exports.getAllVisitors = getAllVisitors;
	exports.transformVisitors = transformVisitors;


/***/ },
/* 185 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';
	/*eslint-disable no-undef*/
	var Buffer = __webpack_require__(231).Buffer;

	function inlineSourceMap(sourceMap, sourceCode, sourceFilename) {
	  // This can be used with a sourcemap that has already has toJSON called on it.
	  // Check first.
	  var json = sourceMap;
	  if (typeof sourceMap.toJSON === 'function') {
	    json = sourceMap.toJSON();
	  }
	  json.sources = [sourceFilename];
	  json.sourcesContent = [sourceCode];
	  var base64 = Buffer(JSON.stringify(json)).toString('base64');
	  return '//# sourceMappingURL=data:application/json;base64,' + base64;
	}

	module.exports = inlineSourceMap;


/***/ },
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Object.assign
	 */
	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign
	function assign(target) {
	    var sources = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        sources[_i - 1] = arguments[_i];
	    }
	    if (target == null) {
	        throw new TypeError('Object.assign target cannot be null or undefined');
	    }
	    var to = Object(target);
	    var hasOwnProperty = Object.prototype.hasOwnProperty;
	    sources.forEach(function (nextSource) {
	        if (nextSource == null) {
	            return;
	        }
	        var from = Object(nextSource);
	        for (var key in from) {
	            if (hasOwnProperty.call(from, key)) {
	                to[key] = from[key];
	            }
	        }
	    });
	    return to;
	}
	;
	module.exports = assign;


/***/ },
/* 187 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var invariant = __webpack_require__(63);
	var canUseDOM = __webpack_require__(36).canUseDOM;

	/**
	 * Returns the current scroll position of the window as { x, y }.
	 */
	function getWindowScrollPosition() {
	  invariant(canUseDOM, "Cannot get current scroll position without a DOM");

	  return {
	    x: window.pageXOffset || document.documentElement.scrollLeft,
	    y: window.pageYOffset || document.documentElement.scrollTop
	  };
	}

	module.exports = getWindowScrollPosition;

/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(257);


/***/ },
/* 189 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	var esprima = __webpack_require__(262);
	var utils = __webpack_require__(232);

	var Syntax = esprima.Syntax;

	function _isFunctionNode(node) {
	  return node.type === Syntax.FunctionDeclaration
	         || node.type === Syntax.FunctionExpression
	         || node.type === Syntax.ArrowFunctionExpression;
	}

	function visitClassProperty(traverse, node, path, state) {
	  utils.catchup(node.range[0], state);
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitClassProperty.test = function(node, path, state) {
	  return node.type === Syntax.ClassProperty;
	};

	function visitTypeAlias(traverse, node, path, state) {
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitTypeAlias.test = function(node, path, state) {
	  return node.type === Syntax.TypeAlias;
	};

	function visitTypeCast(traverse, node, path, state) {
	  path.unshift(node);
	  traverse(node.expression, path, state);
	  path.shift();

	  utils.catchup(node.typeAnnotation.range[0], state);
	  utils.catchupWhiteOut(node.typeAnnotation.range[1], state);
	  return false;
	}
	visitTypeCast.test = function(node, path, state) {
	  return node.type === Syntax.TypeCastExpression;
	};

	function visitInterfaceDeclaration(traverse, node, path, state) {
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitInterfaceDeclaration.test = function(node, path, state) {
	  return node.type === Syntax.InterfaceDeclaration;
	};

	function visitDeclare(traverse, node, path, state) {
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitDeclare.test = function(node, path, state) {
	  switch (node.type) {
	    case Syntax.DeclareVariable:
	    case Syntax.DeclareFunction:
	    case Syntax.DeclareClass:
	    case Syntax.DeclareModule:
	      return true;
	  }
	  return false;
	};

	function visitFunctionParametricAnnotation(traverse, node, path, state) {
	  utils.catchup(node.range[0], state);
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitFunctionParametricAnnotation.test = function(node, path, state) {
	  return node.type === Syntax.TypeParameterDeclaration
	         && path[0]
	         && _isFunctionNode(path[0])
	         && node === path[0].typeParameters;
	};

	function visitFunctionReturnAnnotation(traverse, node, path, state) {
	  utils.catchup(node.range[0], state);
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitFunctionReturnAnnotation.test = function(node, path, state) {
	  return path[0] && _isFunctionNode(path[0]) && node === path[0].returnType;
	};

	function visitOptionalFunctionParameterAnnotation(traverse, node, path, state) {
	  utils.catchup(node.range[0] + node.name.length, state);
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitOptionalFunctionParameterAnnotation.test = function(node, path, state) {
	  return node.type === Syntax.Identifier
	         && node.optional
	         && path[0]
	         && _isFunctionNode(path[0]);
	};

	function visitTypeAnnotatedIdentifier(traverse, node, path, state) {
	  utils.catchup(node.typeAnnotation.range[0], state);
	  utils.catchupWhiteOut(node.typeAnnotation.range[1], state);
	  return false;
	}
	visitTypeAnnotatedIdentifier.test = function(node, path, state) {
	  return node.type === Syntax.Identifier && node.typeAnnotation;
	};

	function visitTypeAnnotatedObjectOrArrayPattern(traverse, node, path, state) {
	  utils.catchup(node.typeAnnotation.range[0], state);
	  utils.catchupWhiteOut(node.typeAnnotation.range[1], state);
	  return false;
	}
	visitTypeAnnotatedObjectOrArrayPattern.test = function(node, path, state) {
	  var rightType = node.type === Syntax.ObjectPattern
	                || node.type === Syntax.ArrayPattern;
	  return rightType && node.typeAnnotation;
	};

	/**
	 * Methods cause trouble, since esprima parses them as a key/value pair, where
	 * the location of the value starts at the method body. For example
	 * { bar(x:number,...y:Array<number>):number {} }
	 * is parsed as
	 * { bar: function(x: number, ...y:Array<number>): number {} }
	 * except that the location of the FunctionExpression value is 40-something,
	 * which is the location of the function body. This means that by the time we
	 * visit the params, rest param, and return type organically, we've already
	 * catchup()'d passed them.
	 */
	function visitMethod(traverse, node, path, state) {
	  path.unshift(node);
	  traverse(node.key, path, state);

	  path.unshift(node.value);
	  traverse(node.value.params, path, state);
	  node.value.rest && traverse(node.value.rest, path, state);
	  node.value.returnType && traverse(node.value.returnType, path, state);
	  traverse(node.value.body, path, state);

	  path.shift();

	  path.shift();
	  return false;
	}

	visitMethod.test = function(node, path, state) {
	  return (node.type === "Property" && (node.method || node.kind === "set" || node.kind === "get"))
	      || (node.type === "MethodDefinition");
	};

	function visitImportType(traverse, node, path, state) {
	  utils.catchupWhiteOut(node.range[1], state);
	  return false;
	}
	visitImportType.test = function(node, path, state) {
	  return node.type === 'ImportDeclaration'
	         && node.isType;
	};

	exports.visitorList = [
	  visitClassProperty,
	  visitDeclare,
	  visitImportType,
	  visitInterfaceDeclaration,
	  visitFunctionParametricAnnotation,
	  visitFunctionReturnAnnotation,
	  visitMethod,
	  visitOptionalFunctionParameterAnnotation,
	  visitTypeAlias,
	  visitTypeCast,
	  visitTypeAnnotatedIdentifier,
	  visitTypeAnnotatedObjectOrArrayPattern
	];


/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var common              = __webpack_require__(233);
	var YAMLException       = __webpack_require__(200);
	var Mark                = __webpack_require__(234);
	var DEFAULT_SAFE_SCHEMA = __webpack_require__(198);
	var DEFAULT_FULL_SCHEMA = __webpack_require__(199);


	var _hasOwnProperty = Object.prototype.hasOwnProperty;


	var CONTEXT_FLOW_IN   = 1;
	var CONTEXT_FLOW_OUT  = 2;
	var CONTEXT_BLOCK_IN  = 3;
	var CONTEXT_BLOCK_OUT = 4;


	var CHOMPING_CLIP  = 1;
	var CHOMPING_STRIP = 2;
	var CHOMPING_KEEP  = 3;


	var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uD800-\uDFFF\uFFFE\uFFFF]/;
	var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
	var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
	var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
	var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


	function is_EOL(c) {
	  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
	}

	function is_WHITE_SPACE(c) {
	  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
	}

	function is_WS_OR_EOL(c) {
	  return (c === 0x09/* Tab */) ||
	         (c === 0x20/* Space */) ||
	         (c === 0x0A/* LF */) ||
	         (c === 0x0D/* CR */);
	}

	function is_FLOW_INDICATOR(c) {
	  return 0x2C/* , */ === c ||
	         0x5B/* [ */ === c ||
	         0x5D/* ] */ === c ||
	         0x7B/* { */ === c ||
	         0x7D/* } */ === c;
	}

	function fromHexCode(c) {
	  var lc;

	  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
	    return c - 0x30;
	  }

	  lc = c | 0x20;
	  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
	    return lc - 0x61 + 10;
	  }

	  return -1;
	}

	function escapedHexLen(c) {
	  if (c === 0x78/* x */) { return 2; }
	  if (c === 0x75/* u */) { return 4; }
	  if (c === 0x55/* U */) { return 8; }
	  return 0;
	}

	function fromDecimalCode(c) {
	  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
	    return c - 0x30;
	  }

	  return -1;
	}

	function simpleEscapeSequence(c) {
	 return (c === 0x30/* 0 */) ? '\x00' :
	        (c === 0x61/* a */) ? '\x07' :
	        (c === 0x62/* b */) ? '\x08' :
	        (c === 0x74/* t */) ? '\x09' :
	        (c === 0x09/* Tab */) ? '\x09' :
	        (c === 0x6E/* n */) ? '\x0A' :
	        (c === 0x76/* v */) ? '\x0B' :
	        (c === 0x66/* f */) ? '\x0C' :
	        (c === 0x72/* r */) ? '\x0D' :
	        (c === 0x65/* e */) ? '\x1B' :
	        (c === 0x20/* Space */) ? ' ' :
	        (c === 0x22/* " */) ? '\x22' :
	        (c === 0x2F/* / */) ? '/' :
	        (c === 0x5C/* \ */) ? '\x5C' :
	        (c === 0x4E/* N */) ? '\x85' :
	        (c === 0x5F/* _ */) ? '\xA0' :
	        (c === 0x4C/* L */) ? '\u2028' :
	        (c === 0x50/* P */) ? '\u2029' : '';
	}

	function charFromCodepoint(c) {
	  if (c <= 0xFFFF) {
	    return String.fromCharCode(c);
	  } else {
	    // Encode UTF-16 surrogate pair
	    // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
	    return String.fromCharCode(((c - 0x010000) >> 10) + 0xD800,
	                               ((c - 0x010000) & 0x03FF) + 0xDC00);
	  }
	}

	var simpleEscapeCheck = new Array(256); // integer, for fast access
	var simpleEscapeMap = new Array(256);
	for (var i = 0; i < 256; i++) {
	  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
	  simpleEscapeMap[i] = simpleEscapeSequence(i);
	}


	function State(input, options) {
	  this.input = input;

	  this.filename  = options['filename']  || null;
	  this.schema    = options['schema']    || DEFAULT_FULL_SCHEMA;
	  this.onWarning = options['onWarning'] || null;
	  this.legacy    = options['legacy']    || false;

	  this.implicitTypes = this.schema.compiledImplicit;
	  this.typeMap       = this.schema.compiledTypeMap;

	  this.length     = input.length;
	  this.position   = 0;
	  this.line       = 0;
	  this.lineStart  = 0;
	  this.lineIndent = 0;

	  this.documents = [];

	  /*
	  this.version;
	  this.checkLineBreaks;
	  this.tagMap;
	  this.anchorMap;
	  this.tag;
	  this.anchor;
	  this.kind;
	  this.result;*/

	}


	function generateError(state, message) {
	  return new YAMLException(
	    message,
	    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
	}

	function throwError(state, message) {
	  throw generateError(state, message);
	}

	function throwWarning(state, message) {
	  var error = generateError(state, message);

	  if (state.onWarning) {
	    state.onWarning.call(null, error);
	  } else {
	    throw error;
	  }
	}


	var directiveHandlers = {

	  'YAML': function handleYamlDirective(state, name, args) {

	      var match, major, minor;

	      if (null !== state.version) {
	        throwError(state, 'duplication of %YAML directive');
	      }

	      if (1 !== args.length) {
	        throwError(state, 'YAML directive accepts exactly one argument');
	      }

	      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

	      if (null === match) {
	        throwError(state, 'ill-formed argument of the YAML directive');
	      }

	      major = parseInt(match[1], 10);
	      minor = parseInt(match[2], 10);

	      if (1 !== major) {
	        throwError(state, 'unacceptable YAML version of the document');
	      }

	      state.version = args[0];
	      state.checkLineBreaks = (minor < 2);

	      if (1 !== minor && 2 !== minor) {
	        throwWarning(state, 'unsupported YAML version of the document');
	      }
	    },

	  'TAG': function handleTagDirective(state, name, args) {

	      var handle, prefix;

	      if (2 !== args.length) {
	        throwError(state, 'TAG directive accepts exactly two arguments');
	      }

	      handle = args[0];
	      prefix = args[1];

	      if (!PATTERN_TAG_HANDLE.test(handle)) {
	        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
	      }

	      if (_hasOwnProperty.call(state.tagMap, handle)) {
	        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
	      }

	      if (!PATTERN_TAG_URI.test(prefix)) {
	        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
	      }

	      state.tagMap[handle] = prefix;
	    }
	};


	function captureSegment(state, start, end, checkJson) {
	  var _position, _length, _character, _result;

	  if (start < end) {
	    _result = state.input.slice(start, end);

	    if (checkJson) {
	      for (_position = 0, _length = _result.length;
	           _position < _length;
	           _position += 1) {
	        _character = _result.charCodeAt(_position);
	        if (!(0x09 === _character ||
	              0x20 <= _character && _character <= 0x10FFFF)) {
	          throwError(state, 'expected valid JSON character');
	        }
	      }
	    }

	    state.result += _result;
	  }
	}

	function mergeMappings(state, destination, source) {
	  var sourceKeys, key, index, quantity;

	  if (!common.isObject(source)) {
	    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
	  }

	  sourceKeys = Object.keys(source);

	  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
	    key = sourceKeys[index];

	    if (!_hasOwnProperty.call(destination, key)) {
	      destination[key] = source[key];
	    }
	  }
	}

	function storeMappingPair(state, _result, keyTag, keyNode, valueNode) {
	  var index, quantity;

	  keyNode = String(keyNode);

	  if (null === _result) {
	    _result = {};
	  }

	  if ('tag:yaml.org,2002:merge' === keyTag) {
	    if (Array.isArray(valueNode)) {
	      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
	        mergeMappings(state, _result, valueNode[index]);
	      }
	    } else {
	      mergeMappings(state, _result, valueNode);
	    }
	  } else {
	    _result[keyNode] = valueNode;
	  }

	  return _result;
	}

	function readLineBreak(state) {
	  var ch;

	  ch = state.input.charCodeAt(state.position);

	  if (0x0A/* LF */ === ch) {
	    state.position++;
	  } else if (0x0D/* CR */ === ch) {
	    state.position++;
	    if (0x0A/* LF */ === state.input.charCodeAt(state.position)) {
	      state.position++;
	    }
	  } else {
	    throwError(state, 'a line break is expected');
	  }

	  state.line += 1;
	  state.lineStart = state.position;
	}

	function skipSeparationSpace(state, allowComments, checkIndent) {
	  var lineBreaks = 0,
	      ch = state.input.charCodeAt(state.position);

	  while (0 !== ch) {
	    while (is_WHITE_SPACE(ch)) {
	      ch = state.input.charCodeAt(++state.position);
	    }

	    if (allowComments && 0x23/* # */ === ch) {
	      do {
	        ch = state.input.charCodeAt(++state.position);
	      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && 0 !== ch);
	    }

	    if (is_EOL(ch)) {
	      readLineBreak(state);

	      ch = state.input.charCodeAt(state.position);
	      lineBreaks++;
	      state.lineIndent = 0;

	      while (0x20/* Space */ === ch) {
	        state.lineIndent++;
	        ch = state.input.charCodeAt(++state.position);
	      }
	    } else {
	      break;
	    }
	  }

	  if (-1 !== checkIndent && 0 !== lineBreaks && state.lineIndent < checkIndent) {
	    throwWarning(state, 'deficient indentation');
	  }

	  return lineBreaks;
	}

	function testDocumentSeparator(state) {
	  var _position = state.position,
	      ch;

	  ch = state.input.charCodeAt(_position);

	  // Condition state.position === state.lineStart is tested
	  // in parent on each call, for efficiency. No needs to test here again.
	  if ((0x2D/* - */ === ch || 0x2E/* . */ === ch) &&
	      state.input.charCodeAt(_position + 1) === ch &&
	      state.input.charCodeAt(_position+ 2) === ch) {

	    _position += 3;

	    ch = state.input.charCodeAt(_position);

	    if (ch === 0 || is_WS_OR_EOL(ch)) {
	      return true;
	    }
	  }

	  return false;
	}

	function writeFoldedLines(state, count) {
	  if (1 === count) {
	    state.result += ' ';
	  } else if (count > 1) {
	    state.result += common.repeat('\n', count - 1);
	  }
	}


	function readPlainScalar(state, nodeIndent, withinFlowCollection) {
	  var preceding,
	      following,
	      captureStart,
	      captureEnd,
	      hasPendingContent,
	      _line,
	      _lineStart,
	      _lineIndent,
	      _kind = state.kind,
	      _result = state.result,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (is_WS_OR_EOL(ch)             ||
	      is_FLOW_INDICATOR(ch)        ||
	      0x23/* # */           === ch ||
	      0x26/* & */           === ch ||
	      0x2A/* * */           === ch ||
	      0x21/* ! */           === ch ||
	      0x7C/* | */           === ch ||
	      0x3E/* > */           === ch ||
	      0x27/* ' */           === ch ||
	      0x22/* " */           === ch ||
	      0x25/* % */           === ch ||
	      0x40/* @ */           === ch ||
	      0x60/* ` */           === ch) {
	    return false;
	  }

	  if (0x3F/* ? */ === ch || 0x2D/* - */ === ch) {
	    following = state.input.charCodeAt(state.position + 1);

	    if (is_WS_OR_EOL(following) ||
	        withinFlowCollection && is_FLOW_INDICATOR(following)) {
	      return false;
	    }
	  }

	  state.kind = 'scalar';
	  state.result = '';
	  captureStart = captureEnd = state.position;
	  hasPendingContent = false;

	  while (0 !== ch) {
	    if (0x3A/* : */ === ch) {
	      following = state.input.charCodeAt(state.position+1);

	      if (is_WS_OR_EOL(following) ||
	          withinFlowCollection && is_FLOW_INDICATOR(following)) {
	        break;
	      }

	    } else if (0x23/* # */ === ch) {
	      preceding = state.input.charCodeAt(state.position - 1);

	      if (is_WS_OR_EOL(preceding)) {
	        break;
	      }

	    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
	               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
	      break;

	    } else if (is_EOL(ch)) {
	      _line = state.line;
	      _lineStart = state.lineStart;
	      _lineIndent = state.lineIndent;
	      skipSeparationSpace(state, false, -1);

	      if (state.lineIndent >= nodeIndent) {
	        hasPendingContent = true;
	        ch = state.input.charCodeAt(state.position);
	        continue;
	      } else {
	        state.position = captureEnd;
	        state.line = _line;
	        state.lineStart = _lineStart;
	        state.lineIndent = _lineIndent;
	        break;
	      }
	    }

	    if (hasPendingContent) {
	      captureSegment(state, captureStart, captureEnd, false);
	      writeFoldedLines(state, state.line - _line);
	      captureStart = captureEnd = state.position;
	      hasPendingContent = false;
	    }

	    if (!is_WHITE_SPACE(ch)) {
	      captureEnd = state.position + 1;
	    }

	    ch = state.input.charCodeAt(++state.position);
	  }

	  captureSegment(state, captureStart, captureEnd, false);

	  if (state.result) {
	    return true;
	  } else {
	    state.kind = _kind;
	    state.result = _result;
	    return false;
	  }
	}

	function readSingleQuotedScalar(state, nodeIndent) {
	  var ch,
	      captureStart, captureEnd;

	  ch = state.input.charCodeAt(state.position);

	  if (0x27/* ' */ !== ch) {
	    return false;
	  }

	  state.kind = 'scalar';
	  state.result = '';
	  state.position++;
	  captureStart = captureEnd = state.position;

	  while (0 !== (ch = state.input.charCodeAt(state.position))) {
	    if (0x27/* ' */ === ch) {
	      captureSegment(state, captureStart, state.position, true);
	      ch = state.input.charCodeAt(++state.position);

	      if (0x27/* ' */ === ch) {
	        captureStart = captureEnd = state.position;
	        state.position++;
	      } else {
	        return true;
	      }

	    } else if (is_EOL(ch)) {
	      captureSegment(state, captureStart, captureEnd, true);
	      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
	      captureStart = captureEnd = state.position;

	    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
	      throwError(state, 'unexpected end of the document within a single quoted scalar');

	    } else {
	      state.position++;
	      captureEnd = state.position;
	    }
	  }

	  throwError(state, 'unexpected end of the stream within a single quoted scalar');
	}

	function readDoubleQuotedScalar(state, nodeIndent) {
	  var captureStart,
	      captureEnd,
	      hexLength,
	      hexResult,
	      tmp, tmpEsc,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (0x22/* " */ !== ch) {
	    return false;
	  }

	  state.kind = 'scalar';
	  state.result = '';
	  state.position++;
	  captureStart = captureEnd = state.position;

	  while (0 !== (ch = state.input.charCodeAt(state.position))) {
	    if (0x22/* " */ === ch) {
	      captureSegment(state, captureStart, state.position, true);
	      state.position++;
	      return true;

	    } else if (0x5C/* \ */ === ch) {
	      captureSegment(state, captureStart, state.position, true);
	      ch = state.input.charCodeAt(++state.position);

	      if (is_EOL(ch)) {
	        skipSeparationSpace(state, false, nodeIndent);

	        //TODO: rework to inline fn with no type cast?
	      } else if (ch < 256 && simpleEscapeCheck[ch]) {
	        state.result += simpleEscapeMap[ch];
	        state.position++;

	      } else if ((tmp = escapedHexLen(ch)) > 0) {
	        hexLength = tmp;
	        hexResult = 0;

	        for (; hexLength > 0; hexLength--) {
	          ch = state.input.charCodeAt(++state.position);

	          if ((tmp = fromHexCode(ch)) >= 0) {
	            hexResult = (hexResult << 4) + tmp;

	          } else {
	            throwError(state, 'expected hexadecimal character');
	          }
	        }

	        state.result += charFromCodepoint(hexResult);

	        state.position++;

	      } else {
	        throwError(state, 'unknown escape sequence');
	      }

	      captureStart = captureEnd = state.position;

	    } else if (is_EOL(ch)) {
	      captureSegment(state, captureStart, captureEnd, true);
	      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
	      captureStart = captureEnd = state.position;

	    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
	      throwError(state, 'unexpected end of the document within a double quoted scalar');

	    } else {
	      state.position++;
	      captureEnd = state.position;
	    }
	  }

	  throwError(state, 'unexpected end of the stream within a double quoted scalar');
	}

	function readFlowCollection(state, nodeIndent) {
	  var readNext = true,
	      _line,
	      _tag     = state.tag,
	      _result,
	      _anchor  = state.anchor,
	      following,
	      terminator,
	      isPair,
	      isExplicitPair,
	      isMapping,
	      keyNode,
	      keyTag,
	      valueNode,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch === 0x5B/* [ */) {
	    terminator = 0x5D/* ] */;
	    isMapping = false;
	    _result = [];
	  } else if (ch === 0x7B/* { */) {
	    terminator = 0x7D/* } */;
	    isMapping = true;
	    _result = {};
	  } else {
	    return false;
	  }

	  if (null !== state.anchor) {
	    state.anchorMap[state.anchor] = _result;
	  }

	  ch = state.input.charCodeAt(++state.position);

	  while (0 !== ch) {
	    skipSeparationSpace(state, true, nodeIndent);

	    ch = state.input.charCodeAt(state.position);

	    if (ch === terminator) {
	      state.position++;
	      state.tag = _tag;
	      state.anchor = _anchor;
	      state.kind = isMapping ? 'mapping' : 'sequence';
	      state.result = _result;
	      return true;
	    } else if (!readNext) {
	      throwError(state, 'missed comma between flow collection entries');
	    }

	    keyTag = keyNode = valueNode = null;
	    isPair = isExplicitPair = false;

	    if (0x3F/* ? */ === ch) {
	      following = state.input.charCodeAt(state.position + 1);

	      if (is_WS_OR_EOL(following)) {
	        isPair = isExplicitPair = true;
	        state.position++;
	        skipSeparationSpace(state, true, nodeIndent);
	      }
	    }

	    _line = state.line;
	    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
	    keyTag = state.tag;
	    keyNode = state.result;
	    skipSeparationSpace(state, true, nodeIndent);

	    ch = state.input.charCodeAt(state.position);

	    if ((isExplicitPair || state.line === _line) && 0x3A/* : */ === ch) {
	      isPair = true;
	      ch = state.input.charCodeAt(++state.position);
	      skipSeparationSpace(state, true, nodeIndent);
	      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
	      valueNode = state.result;
	    }

	    if (isMapping) {
	      storeMappingPair(state, _result, keyTag, keyNode, valueNode);
	    } else if (isPair) {
	      _result.push(storeMappingPair(state, null, keyTag, keyNode, valueNode));
	    } else {
	      _result.push(keyNode);
	    }

	    skipSeparationSpace(state, true, nodeIndent);

	    ch = state.input.charCodeAt(state.position);

	    if (0x2C/* , */ === ch) {
	      readNext = true;
	      ch = state.input.charCodeAt(++state.position);
	    } else {
	      readNext = false;
	    }
	  }

	  throwError(state, 'unexpected end of the stream within a flow collection');
	}

	function readBlockScalar(state, nodeIndent) {
	  var captureStart,
	      folding,
	      chomping       = CHOMPING_CLIP,
	      detectedIndent = false,
	      textIndent     = nodeIndent,
	      emptyLines     = 0,
	      atMoreIndented = false,
	      tmp,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch === 0x7C/* | */) {
	    folding = false;
	  } else if (ch === 0x3E/* > */) {
	    folding = true;
	  } else {
	    return false;
	  }

	  state.kind = 'scalar';
	  state.result = '';

	  while (0 !== ch) {
	    ch = state.input.charCodeAt(++state.position);

	    if (0x2B/* + */ === ch || 0x2D/* - */ === ch) {
	      if (CHOMPING_CLIP === chomping) {
	        chomping = (0x2B/* + */ === ch) ? CHOMPING_KEEP : CHOMPING_STRIP;
	      } else {
	        throwError(state, 'repeat of a chomping mode identifier');
	      }

	    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
	      if (tmp === 0) {
	        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
	      } else if (!detectedIndent) {
	        textIndent = nodeIndent + tmp - 1;
	        detectedIndent = true;
	      } else {
	        throwError(state, 'repeat of an indentation width identifier');
	      }

	    } else {
	      break;
	    }
	  }

	  if (is_WHITE_SPACE(ch)) {
	    do { ch = state.input.charCodeAt(++state.position); }
	    while (is_WHITE_SPACE(ch));

	    if (0x23/* # */ === ch) {
	      do { ch = state.input.charCodeAt(++state.position); }
	      while (!is_EOL(ch) && (0 !== ch));
	    }
	  }

	  while (0 !== ch) {
	    readLineBreak(state);
	    state.lineIndent = 0;

	    ch = state.input.charCodeAt(state.position);

	    while ((!detectedIndent || state.lineIndent < textIndent) &&
	           (0x20/* Space */ === ch)) {
	      state.lineIndent++;
	      ch = state.input.charCodeAt(++state.position);
	    }

	    if (!detectedIndent && state.lineIndent > textIndent) {
	      textIndent = state.lineIndent;
	    }

	    if (is_EOL(ch)) {
	      emptyLines++;
	      continue;
	    }

	    // End of the scalar.
	    if (state.lineIndent < textIndent) {

	      // Perform the chomping.
	      if (chomping === CHOMPING_KEEP) {
	        state.result += common.repeat('\n', emptyLines);
	      } else if (chomping === CHOMPING_CLIP) {
	        if (detectedIndent) { // i.e. only if the scalar is not empty.
	          state.result += '\n';
	        }
	      }

	      // Break this `while` cycle and go to the funciton's epilogue.
	      break;
	    }

	    // Folded style: use fancy rules to handle line breaks.
	    if (folding) {

	      // Lines starting with white space characters (more-indented lines) are not folded.
	      if (is_WHITE_SPACE(ch)) {
	        atMoreIndented = true;
	        state.result += common.repeat('\n', emptyLines + 1);

	      // End of more-indented block.
	      } else if (atMoreIndented) {
	        atMoreIndented = false;
	        state.result += common.repeat('\n', emptyLines + 1);

	      // Just one line break - perceive as the same line.
	      } else if (0 === emptyLines) {
	        if (detectedIndent) { // i.e. only if we have already read some scalar content.
	          state.result += ' ';
	        }

	      // Several line breaks - perceive as different lines.
	      } else {
	        state.result += common.repeat('\n', emptyLines);
	      }

	    // Literal style: just add exact number of line breaks between content lines.
	    } else {

	      // If current line isn't the first one - count line break from the last content line.
	      if (detectedIndent) {
	        state.result += common.repeat('\n', emptyLines + 1);

	      // In case of the first content line - count only empty lines.
	      } else {
	        state.result += common.repeat('\n', emptyLines);
	      }
	    }

	    detectedIndent = true;
	    emptyLines = 0;
	    captureStart = state.position;

	    while (!is_EOL(ch) && (0 !== ch))
	    { ch = state.input.charCodeAt(++state.position); }

	    captureSegment(state, captureStart, state.position, false);
	  }

	  return true;
	}

	function readBlockSequence(state, nodeIndent) {
	  var _line,
	      _tag      = state.tag,
	      _anchor   = state.anchor,
	      _result   = [],
	      following,
	      detected  = false,
	      ch;

	  if (null !== state.anchor) {
	    state.anchorMap[state.anchor] = _result;
	  }

	  ch = state.input.charCodeAt(state.position);

	  while (0 !== ch) {

	    if (0x2D/* - */ !== ch) {
	      break;
	    }

	    following = state.input.charCodeAt(state.position + 1);

	    if (!is_WS_OR_EOL(following)) {
	      break;
	    }

	    detected = true;
	    state.position++;

	    if (skipSeparationSpace(state, true, -1)) {
	      if (state.lineIndent <= nodeIndent) {
	        _result.push(null);
	        ch = state.input.charCodeAt(state.position);
	        continue;
	      }
	    }

	    _line = state.line;
	    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
	    _result.push(state.result);
	    skipSeparationSpace(state, true, -1);

	    ch = state.input.charCodeAt(state.position);

	    if ((state.line === _line || state.lineIndent > nodeIndent) && (0 !== ch)) {
	      throwError(state, 'bad indentation of a sequence entry');
	    } else if (state.lineIndent < nodeIndent) {
	      break;
	    }
	  }

	  if (detected) {
	    state.tag = _tag;
	    state.anchor = _anchor;
	    state.kind = 'sequence';
	    state.result = _result;
	    return true;
	  } else {
	    return false;
	  }
	}

	function readBlockMapping(state, nodeIndent, flowIndent) {
	  var following,
	      allowCompact,
	      _line,
	      _tag          = state.tag,
	      _anchor       = state.anchor,
	      _result       = {},
	      keyTag        = null,
	      keyNode       = null,
	      valueNode     = null,
	      atExplicitKey = false,
	      detected      = false,
	      ch;

	  if (null !== state.anchor) {
	    state.anchorMap[state.anchor] = _result;
	  }

	  ch = state.input.charCodeAt(state.position);

	  while (0 !== ch) {
	    following = state.input.charCodeAt(state.position + 1);
	    _line = state.line; // Save the current line.

	    //
	    // Explicit notation case. There are two separate blocks:
	    // first for the key (denoted by "?") and second for the value (denoted by ":")
	    //
	    if ((0x3F/* ? */ === ch || 0x3A/* : */  === ch) && is_WS_OR_EOL(following)) {

	      if (0x3F/* ? */ === ch) {
	        if (atExplicitKey) {
	          storeMappingPair(state, _result, keyTag, keyNode, null);
	          keyTag = keyNode = valueNode = null;
	        }

	        detected = true;
	        atExplicitKey = true;
	        allowCompact = true;

	      } else if (atExplicitKey) {
	        // i.e. 0x3A/* : */ === character after the explicit key.
	        atExplicitKey = false;
	        allowCompact = true;

	      } else {
	        throwError(state, 'incomplete explicit mapping pair; a key node is missed');
	      }

	      state.position += 1;
	      ch = following;

	    //
	    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
	    //
	    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

	      if (state.line === _line) {
	        ch = state.input.charCodeAt(state.position);

	        while (is_WHITE_SPACE(ch)) {
	          ch = state.input.charCodeAt(++state.position);
	        }

	        if (0x3A/* : */ === ch) {
	          ch = state.input.charCodeAt(++state.position);

	          if (!is_WS_OR_EOL(ch)) {
	            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
	          }

	          if (atExplicitKey) {
	            storeMappingPair(state, _result, keyTag, keyNode, null);
	            keyTag = keyNode = valueNode = null;
	          }

	          detected = true;
	          atExplicitKey = false;
	          allowCompact = false;
	          keyTag = state.tag;
	          keyNode = state.result;

	        } else if (detected) {
	          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

	        } else {
	          state.tag = _tag;
	          state.anchor = _anchor;
	          return true; // Keep the result of `composeNode`.
	        }

	      } else if (detected) {
	        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

	      } else {
	        state.tag = _tag;
	        state.anchor = _anchor;
	        return true; // Keep the result of `composeNode`.
	      }

	    } else {
	      break; // Reading is done. Go to the epilogue.
	    }

	    //
	    // Common reading code for both explicit and implicit notations.
	    //
	    if (state.line === _line || state.lineIndent > nodeIndent) {
	      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
	        if (atExplicitKey) {
	          keyNode = state.result;
	        } else {
	          valueNode = state.result;
	        }
	      }

	      if (!atExplicitKey) {
	        storeMappingPair(state, _result, keyTag, keyNode, valueNode);
	        keyTag = keyNode = valueNode = null;
	      }

	      skipSeparationSpace(state, true, -1);
	      ch = state.input.charCodeAt(state.position);
	    }

	    if (state.lineIndent > nodeIndent && (0 !== ch)) {
	      throwError(state, 'bad indentation of a mapping entry');
	    } else if (state.lineIndent < nodeIndent) {
	      break;
	    }
	  }

	  //
	  // Epilogue.
	  //

	  // Special case: last mapping's node contains only the key in explicit notation.
	  if (atExplicitKey) {
	    storeMappingPair(state, _result, keyTag, keyNode, null);
	  }

	  // Expose the resulting mapping.
	  if (detected) {
	    state.tag = _tag;
	    state.anchor = _anchor;
	    state.kind = 'mapping';
	    state.result = _result;
	  }

	  return detected;
	}

	function readTagProperty(state) {
	  var _position,
	      isVerbatim = false,
	      isNamed    = false,
	      tagHandle,
	      tagName,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (0x21/* ! */ !== ch) {
	    return false;
	  }

	  if (null !== state.tag) {
	    throwError(state, 'duplication of a tag property');
	  }

	  ch = state.input.charCodeAt(++state.position);

	  if (0x3C/* < */ === ch) {
	    isVerbatim = true;
	    ch = state.input.charCodeAt(++state.position);

	  } else if (0x21/* ! */ === ch) {
	    isNamed = true;
	    tagHandle = '!!';
	    ch = state.input.charCodeAt(++state.position);

	  } else {
	    tagHandle = '!';
	  }

	  _position = state.position;

	  if (isVerbatim) {
	    do { ch = state.input.charCodeAt(++state.position); }
	    while (0 !== ch && 0x3E/* > */ !== ch);

	    if (state.position < state.length) {
	      tagName = state.input.slice(_position, state.position);
	      ch = state.input.charCodeAt(++state.position);
	    } else {
	      throwError(state, 'unexpected end of the stream within a verbatim tag');
	    }
	  } else {
	    while (0 !== ch && !is_WS_OR_EOL(ch)) {

	      if (0x21/* ! */ === ch) {
	        if (!isNamed) {
	          tagHandle = state.input.slice(_position - 1, state.position + 1);

	          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
	            throwError(state, 'named tag handle cannot contain such characters');
	          }

	          isNamed = true;
	          _position = state.position + 1;
	        } else {
	          throwError(state, 'tag suffix cannot contain exclamation marks');
	        }
	      }

	      ch = state.input.charCodeAt(++state.position);
	    }

	    tagName = state.input.slice(_position, state.position);

	    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
	      throwError(state, 'tag suffix cannot contain flow indicator characters');
	    }
	  }

	  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
	    throwError(state, 'tag name cannot contain such characters: ' + tagName);
	  }

	  if (isVerbatim) {
	    state.tag = tagName;

	  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
	    state.tag = state.tagMap[tagHandle] + tagName;

	  } else if ('!' === tagHandle) {
	    state.tag = '!' + tagName;

	  } else if ('!!' === tagHandle) {
	    state.tag = 'tag:yaml.org,2002:' + tagName;

	  } else {
	    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
	  }

	  return true;
	}

	function readAnchorProperty(state) {
	  var _position,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (0x26/* & */ !== ch) {
	    return false;
	  }

	  if (null !== state.anchor) {
	    throwError(state, 'duplication of an anchor property');
	  }

	  ch = state.input.charCodeAt(++state.position);
	  _position = state.position;

	  while (0 !== ch && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	    ch = state.input.charCodeAt(++state.position);
	  }

	  if (state.position === _position) {
	    throwError(state, 'name of an anchor node must contain at least one character');
	  }

	  state.anchor = state.input.slice(_position, state.position);
	  return true;
	}

	function readAlias(state) {
	  var _position, alias,
	      len = state.length,
	      input = state.input,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (0x2A/* * */ !== ch) {
	    return false;
	  }

	  ch = state.input.charCodeAt(++state.position);
	  _position = state.position;

	  while (0 !== ch && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	    ch = state.input.charCodeAt(++state.position);
	  }

	  if (state.position === _position) {
	    throwError(state, 'name of an alias node must contain at least one character');
	  }

	  alias = state.input.slice(_position, state.position);

	  if (!state.anchorMap.hasOwnProperty(alias)) {
	    throwError(state, 'unidentified alias "' + alias + '"');
	  }

	  state.result = state.anchorMap[alias];
	  skipSeparationSpace(state, true, -1);
	  return true;
	}

	function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
	  var allowBlockStyles,
	      allowBlockScalars,
	      allowBlockCollections,
	      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
	      atNewLine  = false,
	      hasContent = false,
	      typeIndex,
	      typeQuantity,
	      type,
	      flowIndent,
	      blockIndent,
	      _result;

	  state.tag    = null;
	  state.anchor = null;
	  state.kind   = null;
	  state.result = null;

	  allowBlockStyles = allowBlockScalars = allowBlockCollections =
	    CONTEXT_BLOCK_OUT === nodeContext ||
	    CONTEXT_BLOCK_IN  === nodeContext;

	  if (allowToSeek) {
	    if (skipSeparationSpace(state, true, -1)) {
	      atNewLine = true;

	      if (state.lineIndent > parentIndent) {
	        indentStatus = 1;
	      } else if (state.lineIndent === parentIndent) {
	        indentStatus = 0;
	      } else if (state.lineIndent < parentIndent) {
	        indentStatus = -1;
	      }
	    }
	  }

	  if (1 === indentStatus) {
	    while (readTagProperty(state) || readAnchorProperty(state)) {
	      if (skipSeparationSpace(state, true, -1)) {
	        atNewLine = true;
	        allowBlockCollections = allowBlockStyles;

	        if (state.lineIndent > parentIndent) {
	          indentStatus = 1;
	        } else if (state.lineIndent === parentIndent) {
	          indentStatus = 0;
	        } else if (state.lineIndent < parentIndent) {
	          indentStatus = -1;
	        }
	      } else {
	        allowBlockCollections = false;
	      }
	    }
	  }

	  if (allowBlockCollections) {
	    allowBlockCollections = atNewLine || allowCompact;
	  }

	  if (1 === indentStatus || CONTEXT_BLOCK_OUT === nodeContext) {
	    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
	      flowIndent = parentIndent;
	    } else {
	      flowIndent = parentIndent + 1;
	    }

	    blockIndent = state.position - state.lineStart;

	    if (1 === indentStatus) {
	      if (allowBlockCollections &&
	          (readBlockSequence(state, blockIndent) ||
	           readBlockMapping(state, blockIndent, flowIndent)) ||
	          readFlowCollection(state, flowIndent)) {
	        hasContent = true;
	      } else {
	        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
	            readSingleQuotedScalar(state, flowIndent) ||
	            readDoubleQuotedScalar(state, flowIndent)) {
	          hasContent = true;

	        } else if (readAlias(state)) {
	          hasContent = true;

	          if (null !== state.tag || null !== state.anchor) {
	            throwError(state, 'alias node should not have any properties');
	          }

	        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
	          hasContent = true;

	          if (null === state.tag) {
	            state.tag = '?';
	          }
	        }

	        if (null !== state.anchor) {
	          state.anchorMap[state.anchor] = state.result;
	        }
	      }
	    } else if (0 === indentStatus) {
	      // Special case: block sequences are allowed to have same indentation level as the parent.
	      // http://www.yaml.org/spec/1.2/spec.html#id2799784
	      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
	    }
	  }

	  if (null !== state.tag && '!' !== state.tag) {
	    if ('?' === state.tag) {
	      for (typeIndex = 0, typeQuantity = state.implicitTypes.length;
	           typeIndex < typeQuantity;
	           typeIndex += 1) {
	        type = state.implicitTypes[typeIndex];

	        // Implicit resolving is not allowed for non-scalar types, and '?'
	        // non-specific tag is only assigned to plain scalars. So, it isn't
	        // needed to check for 'kind' conformity.

	        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
	          state.result = type.construct(state.result);
	          state.tag = type.tag;
	          if (null !== state.anchor) {
	            state.anchorMap[state.anchor] = state.result;
	          }
	          break;
	        }
	      }
	    } else if (_hasOwnProperty.call(state.typeMap, state.tag)) {
	      type = state.typeMap[state.tag];

	      if (null !== state.result && type.kind !== state.kind) {
	        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
	      }

	      if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
	        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
	      } else {
	        state.result = type.construct(state.result);
	        if (null !== state.anchor) {
	          state.anchorMap[state.anchor] = state.result;
	        }
	      }
	    } else {
	      throwWarning(state, 'unknown tag !<' + state.tag + '>');
	    }
	  }

	  return null !== state.tag || null !== state.anchor || hasContent;
	}

	function readDocument(state) {
	  var documentStart = state.position,
	      _position,
	      directiveName,
	      directiveArgs,
	      hasDirectives = false,
	      ch;

	  state.version = null;
	  state.checkLineBreaks = state.legacy;
	  state.tagMap = {};
	  state.anchorMap = {};

	  while (0 !== (ch = state.input.charCodeAt(state.position))) {
	    skipSeparationSpace(state, true, -1);

	    ch = state.input.charCodeAt(state.position);

	    if (state.lineIndent > 0 || 0x25/* % */ !== ch) {
	      break;
	    }

	    hasDirectives = true;
	    ch = state.input.charCodeAt(++state.position);
	    _position = state.position;

	    while (0 !== ch && !is_WS_OR_EOL(ch)) {
	      ch = state.input.charCodeAt(++state.position);
	    }

	    directiveName = state.input.slice(_position, state.position);
	    directiveArgs = [];

	    if (directiveName.length < 1) {
	      throwError(state, 'directive name must not be less than one character in length');
	    }

	    while (0 !== ch) {
	      while (is_WHITE_SPACE(ch)) {
	        ch = state.input.charCodeAt(++state.position);
	      }

	      if (0x23/* # */ === ch) {
	        do { ch = state.input.charCodeAt(++state.position); }
	        while (0 !== ch && !is_EOL(ch));
	        break;
	      }

	      if (is_EOL(ch)) {
	        break;
	      }

	      _position = state.position;

	      while (0 !== ch && !is_WS_OR_EOL(ch)) {
	        ch = state.input.charCodeAt(++state.position);
	      }

	      directiveArgs.push(state.input.slice(_position, state.position));
	    }

	    if (0 !== ch) {
	      readLineBreak(state);
	    }

	    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
	      directiveHandlers[directiveName](state, directiveName, directiveArgs);
	    } else {
	      throwWarning(state, 'unknown document directive "' + directiveName + '"');
	    }
	  }

	  skipSeparationSpace(state, true, -1);

	  if (0 === state.lineIndent &&
	      0x2D/* - */ === state.input.charCodeAt(state.position) &&
	      0x2D/* - */ === state.input.charCodeAt(state.position + 1) &&
	      0x2D/* - */ === state.input.charCodeAt(state.position + 2)) {
	    state.position += 3;
	    skipSeparationSpace(state, true, -1);

	  } else if (hasDirectives) {
	    throwError(state, 'directives end mark is expected');
	  }

	  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
	  skipSeparationSpace(state, true, -1);

	  if (state.checkLineBreaks &&
	      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
	    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
	  }

	  state.documents.push(state.result);

	  if (state.position === state.lineStart && testDocumentSeparator(state)) {

	    if (0x2E/* . */ === state.input.charCodeAt(state.position)) {
	      state.position += 3;
	      skipSeparationSpace(state, true, -1);
	    }
	    return;
	  }

	  if (state.position < (state.length - 1)) {
	    throwError(state, 'end of the stream or a document separator is expected');
	  } else {
	    return;
	  }
	}


	function loadDocuments(input, options) {
	  input = String(input);
	  options = options || {};

	  if (0 !== input.length &&
	      0x0A/* LF */ !== input.charCodeAt(input.length - 1) &&
	      0x0D/* CR */ !== input.charCodeAt(input.length - 1)) {
	    input += '\n';
	  }

	  var state = new State(input, options);

	  if (PATTERN_NON_PRINTABLE.test(state.input)) {
	    throwError(state, 'the stream contains non-printable characters');
	  }

	  // Use 0 as string terminator. That significantly simplifies bounds check.
	  state.input += '\0';

	  while (0x20/* Space */ === state.input.charCodeAt(state.position)) {
	    state.lineIndent += 1;
	    state.position += 1;
	  }

	  while (state.position < (state.length - 1)) {
	    readDocument(state);
	  }

	  return state.documents;
	}


	function loadAll(input, iterator, options) {
	  var documents = loadDocuments(input, options), index, length;

	  for (index = 0, length = documents.length; index < length; index += 1) {
	    iterator(documents[index]);
	  }
	}


	function load(input, options) {
	  var documents = loadDocuments(input, options), index, length;

	  if (0 === documents.length) {
	    return undefined;
	  } else if (1 === documents.length) {
	    return documents[0];
	  } else {
	    throw new YAMLException('expected a single document in the stream, but found more');
	  }
	}


	function safeLoadAll(input, output, options) {
	  loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}


	function safeLoad(input, options) {
	  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}


	module.exports.loadAll     = loadAll;
	module.exports.load        = load;
	module.exports.safeLoadAll = safeLoadAll;
	module.exports.safeLoad    = safeLoad;


/***/ },
/* 192 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var common              = __webpack_require__(233);
	var YAMLException       = __webpack_require__(200);
	var DEFAULT_FULL_SCHEMA = __webpack_require__(199);
	var DEFAULT_SAFE_SCHEMA = __webpack_require__(198);


	var _toString       = Object.prototype.toString;
	var _hasOwnProperty = Object.prototype.hasOwnProperty;


	var CHAR_TAB                  = 0x09; /* Tab */
	var CHAR_LINE_FEED            = 0x0A; /* LF */
	var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
	var CHAR_SPACE                = 0x20; /* Space */
	var CHAR_EXCLAMATION          = 0x21; /* ! */
	var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
	var CHAR_SHARP                = 0x23; /* # */
	var CHAR_PERCENT              = 0x25; /* % */
	var CHAR_AMPERSAND            = 0x26; /* & */
	var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
	var CHAR_ASTERISK             = 0x2A; /* * */
	var CHAR_COMMA                = 0x2C; /* , */
	var CHAR_MINUS                = 0x2D; /* - */
	var CHAR_COLON                = 0x3A; /* : */
	var CHAR_GREATER_THAN         = 0x3E; /* > */
	var CHAR_QUESTION             = 0x3F; /* ? */
	var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
	var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
	var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
	var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
	var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
	var CHAR_VERTICAL_LINE        = 0x7C; /* | */
	var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */


	var ESCAPE_SEQUENCES = {};

	ESCAPE_SEQUENCES[0x00]   = '\\0';
	ESCAPE_SEQUENCES[0x07]   = '\\a';
	ESCAPE_SEQUENCES[0x08]   = '\\b';
	ESCAPE_SEQUENCES[0x09]   = '\\t';
	ESCAPE_SEQUENCES[0x0A]   = '\\n';
	ESCAPE_SEQUENCES[0x0B]   = '\\v';
	ESCAPE_SEQUENCES[0x0C]   = '\\f';
	ESCAPE_SEQUENCES[0x0D]   = '\\r';
	ESCAPE_SEQUENCES[0x1B]   = '\\e';
	ESCAPE_SEQUENCES[0x22]   = '\\"';
	ESCAPE_SEQUENCES[0x5C]   = '\\\\';
	ESCAPE_SEQUENCES[0x85]   = '\\N';
	ESCAPE_SEQUENCES[0xA0]   = '\\_';
	ESCAPE_SEQUENCES[0x2028] = '\\L';
	ESCAPE_SEQUENCES[0x2029] = '\\P';


	var DEPRECATED_BOOLEANS_SYNTAX = [
	  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
	  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
	];


	function compileStyleMap(schema, map) {
	  var result, keys, index, length, tag, style, type;

	  if (null === map) {
	    return {};
	  }

	  result = {};
	  keys = Object.keys(map);

	  for (index = 0, length = keys.length; index < length; index += 1) {
	    tag = keys[index];
	    style = String(map[tag]);

	    if ('!!' === tag.slice(0, 2)) {
	      tag = 'tag:yaml.org,2002:' + tag.slice(2);
	    }

	    type = schema.compiledTypeMap[tag];

	    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
	      style = type.styleAliases[style];
	    }

	    result[tag] = style;
	  }

	  return result;
	}


	function encodeHex(character) {
	  var string, handle, length;

	  string = character.toString(16).toUpperCase();

	  if (character <= 0xFF) {
	    handle = 'x';
	    length = 2;
	  } else if (character <= 0xFFFF) {
	    handle = 'u';
	    length = 4;
	  } else if (character <= 0xFFFFFFFF) {
	    handle = 'U';
	    length = 8;
	  } else {
	    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
	  }

	  return '\\' + handle + common.repeat('0', length - string.length) + string;
	}


	function State(options) {
	  this.schema      = options['schema'] || DEFAULT_FULL_SCHEMA;
	  this.indent      = Math.max(1, (options['indent'] || 2));
	  this.skipInvalid = options['skipInvalid'] || false;
	  this.flowLevel   = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
	  this.styleMap    = compileStyleMap(this.schema, options['styles'] || null);

	  this.implicitTypes = this.schema.compiledImplicit;
	  this.explicitTypes = this.schema.compiledExplicit;

	  this.tag = null;
	  this.result = '';

	  this.duplicates = [];
	  this.usedDuplicates = null;
	}


	function generateNextLine(state, level) {
	  return '\n' + common.repeat(' ', state.indent * level);
	}

	function testImplicitResolving(state, str) {
	  var index, length, type;

	  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
	    type = state.implicitTypes[index];

	    if (type.resolve(str)) {
	      return true;
	    }
	  }

	  return false;
	}

	function writeScalar(state, object) {
	  var isQuoted, checkpoint, position, length, character, first;

	  state.dump = '';
	  isQuoted = false;
	  checkpoint = 0;
	  first = object.charCodeAt(0) || 0;

	  if (-1 !== DEPRECATED_BOOLEANS_SYNTAX.indexOf(object)) {
	    // Ensure compatibility with YAML 1.0/1.1 loaders.
	    isQuoted = true;
	  } else if (0 === object.length) {
	    // Quote empty string
	    isQuoted = true;
	  } else if (CHAR_SPACE    === first ||
	             CHAR_SPACE    === object.charCodeAt(object.length - 1)) {
	    isQuoted = true;
	  } else if (CHAR_MINUS    === first ||
	             CHAR_QUESTION === first) {
	    // Don't check second symbol for simplicity
	    isQuoted = true;
	  }

	  for (position = 0, length = object.length; position < length; position += 1) {
	    character = object.charCodeAt(position);

	    if (!isQuoted) {
	      if (CHAR_TAB                  === character ||
	          CHAR_LINE_FEED            === character ||
	          CHAR_CARRIAGE_RETURN      === character ||
	          CHAR_COMMA                === character ||
	          CHAR_LEFT_SQUARE_BRACKET  === character ||
	          CHAR_RIGHT_SQUARE_BRACKET === character ||
	          CHAR_LEFT_CURLY_BRACKET   === character ||
	          CHAR_RIGHT_CURLY_BRACKET  === character ||
	          CHAR_SHARP                === character ||
	          CHAR_AMPERSAND            === character ||
	          CHAR_ASTERISK             === character ||
	          CHAR_EXCLAMATION          === character ||
	          CHAR_VERTICAL_LINE        === character ||
	          CHAR_GREATER_THAN         === character ||
	          CHAR_SINGLE_QUOTE         === character ||
	          CHAR_DOUBLE_QUOTE         === character ||
	          CHAR_PERCENT              === character ||
	          CHAR_COMMERCIAL_AT        === character ||
	          CHAR_COLON                === character ||
	          CHAR_GRAVE_ACCENT         === character) {
	        isQuoted = true;
	      }
	    }

	    if (ESCAPE_SEQUENCES[character] ||
	        !((0x00020 <= character && character <= 0x00007E) ||
	          (0x00085 === character)                         ||
	          (0x000A0 <= character && character <= 0x00D7FF) ||
	          (0x0E000 <= character && character <= 0x00FFFD) ||
	          (0x10000 <= character && character <= 0x10FFFF))) {
	      state.dump += object.slice(checkpoint, position);
	      state.dump += ESCAPE_SEQUENCES[character] || encodeHex(character);
	      checkpoint = position + 1;
	      isQuoted = true;
	    }
	  }

	  if (checkpoint < position) {
	    state.dump += object.slice(checkpoint, position);
	  }

	  if (!isQuoted && testImplicitResolving(state, state.dump)) {
	    isQuoted = true;
	  }

	  if (isQuoted) {
	    state.dump = '"' + state.dump + '"';
	  }
	}

	function writeFlowSequence(state, level, object) {
	  var _result = '',
	      _tag    = state.tag,
	      index,
	      length;

	  for (index = 0, length = object.length; index < length; index += 1) {
	    // Write only valid elements.
	    if (writeNode(state, level, object[index], false, false)) {
	      if (0 !== index) {
	        _result += ', ';
	      }
	      _result += state.dump;
	    }
	  }

	  state.tag = _tag;
	  state.dump = '[' + _result + ']';
	}

	function writeBlockSequence(state, level, object, compact) {
	  var _result = '',
	      _tag    = state.tag,
	      index,
	      length;

	  for (index = 0, length = object.length; index < length; index += 1) {
	    // Write only valid elements.
	    if (writeNode(state, level + 1, object[index], true, true)) {
	      if (!compact || 0 !== index) {
	        _result += generateNextLine(state, level);
	      }
	      _result += '- ' + state.dump;
	    }
	  }

	  state.tag = _tag;
	  state.dump = _result || '[]'; // Empty sequence if no valid values.
	}

	function writeFlowMapping(state, level, object) {
	  var _result       = '',
	      _tag          = state.tag,
	      objectKeyList = Object.keys(object),
	      index,
	      length,
	      objectKey,
	      objectValue,
	      pairBuffer;

	  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	    pairBuffer = '';

	    if (0 !== index) {
	      pairBuffer += ', ';
	    }

	    objectKey = objectKeyList[index];
	    objectValue = object[objectKey];

	    if (!writeNode(state, level, objectKey, false, false)) {
	      continue; // Skip this pair because of invalid key;
	    }

	    if (state.dump.length > 1024) {
	      pairBuffer += '? ';
	    }

	    pairBuffer += state.dump + ': ';

	    if (!writeNode(state, level, objectValue, false, false)) {
	      continue; // Skip this pair because of invalid value.
	    }

	    pairBuffer += state.dump;

	    // Both key and value are valid.
	    _result += pairBuffer;
	  }

	  state.tag = _tag;
	  state.dump = '{' + _result + '}';
	}

	function writeBlockMapping(state, level, object, compact) {
	  var _result       = '',
	      _tag          = state.tag,
	      objectKeyList = Object.keys(object),
	      index,
	      length,
	      objectKey,
	      objectValue,
	      explicitPair,
	      pairBuffer;

	  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	    pairBuffer = '';

	    if (!compact || 0 !== index) {
	      pairBuffer += generateNextLine(state, level);
	    }

	    objectKey = objectKeyList[index];
	    objectValue = object[objectKey];

	    if (!writeNode(state, level + 1, objectKey, true, true)) {
	      continue; // Skip this pair because of invalid key.
	    }

	    explicitPair = (null !== state.tag && '?' !== state.tag) ||
	                   (state.dump && state.dump.length > 1024);

	    if (explicitPair) {
	      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
	        pairBuffer += '?';
	      } else {
	        pairBuffer += '? ';
	      }
	    }

	    pairBuffer += state.dump;

	    if (explicitPair) {
	      pairBuffer += generateNextLine(state, level);
	    }

	    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
	      continue; // Skip this pair because of invalid value.
	    }

	    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
	      pairBuffer += ':';
	    } else {
	      pairBuffer += ': ';
	    }

	    pairBuffer += state.dump;

	    // Both key and value are valid.
	    _result += pairBuffer;
	  }

	  state.tag = _tag;
	  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
	}

	function detectType(state, object, explicit) {
	  var _result, typeList, index, length, type, style;

	  typeList = explicit ? state.explicitTypes : state.implicitTypes;

	  for (index = 0, length = typeList.length; index < length; index += 1) {
	    type = typeList[index];

	    if ((type.instanceOf  || type.predicate) &&
	        (!type.instanceOf || (('object' === typeof object) && (object instanceof type.instanceOf))) &&
	        (!type.predicate  || type.predicate(object))) {

	      state.tag = explicit ? type.tag : '?';

	      if (type.represent) {
	        style = state.styleMap[type.tag] || type.defaultStyle;

	        if ('[object Function]' === _toString.call(type.represent)) {
	          _result = type.represent(object, style);
	        } else if (_hasOwnProperty.call(type.represent, style)) {
	          _result = type.represent[style](object, style);
	        } else {
	          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
	        }

	        state.dump = _result;
	      }

	      return true;
	    }
	  }

	  return false;
	}

	// Serializes `object` and writes it to global `result`.
	// Returns true on success, or false on invalid object.
	//
	function writeNode(state, level, object, block, compact) {
	  state.tag = null;
	  state.dump = object;

	  if (!detectType(state, object, false)) {
	    detectType(state, object, true);
	  }

	  var type = _toString.call(state.dump);

	  if (block) {
	    block = (0 > state.flowLevel || state.flowLevel > level);
	  }

	  if ((null !== state.tag && '?' !== state.tag) || (2 !== state.indent && level > 0)) {
	    compact = false;
	  }

	  var objectOrArray = '[object Object]' === type || '[object Array]' === type,
	      duplicateIndex,
	      duplicate;

	  if (objectOrArray) {
	    duplicateIndex = state.duplicates.indexOf(object);
	    duplicate = duplicateIndex !== -1;
	  }

	  if (duplicate && state.usedDuplicates[duplicateIndex]) {
	    state.dump = '*ref_' + duplicateIndex;
	  } else {
	    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
	      state.usedDuplicates[duplicateIndex] = true;
	    }
	    if ('[object Object]' === type) {
	      if (block && (0 !== Object.keys(state.dump).length)) {
	        writeBlockMapping(state, level, state.dump, compact);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + (0 === level ? '\n' : '') + state.dump;
	        }
	      } else {
	        writeFlowMapping(state, level, state.dump);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
	        }
	      }
	    } else if ('[object Array]' === type) {
	      if (block && (0 !== state.dump.length)) {
	        writeBlockSequence(state, level, state.dump, compact);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + (0 === level ? '\n' : '') + state.dump;
	        }
	      } else {
	        writeFlowSequence(state, level, state.dump);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
	        }
	      }
	    } else if ('[object String]' === type) {
	      if ('?' !== state.tag) {
	        writeScalar(state, state.dump);
	      }
	    } else if (state.skipInvalid) {
	      return false;
	    } else {
	      throw new YAMLException('unacceptable kind of an object to dump ' + type);
	    }

	    if (null !== state.tag && '?' !== state.tag) {
	      state.dump = '!<' + state.tag + '> ' + state.dump;
	    }
	  }

	  return true;
	}

	function getDuplicateReferences(object, state) {
	  var objects = [],
	      duplicatesIndexes = [],
	      index,
	      length;

	  inspectNode(object, objects, duplicatesIndexes);

	  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
	    state.duplicates.push(objects[duplicatesIndexes[index]]);
	  }
	  state.usedDuplicates = new Array(length);
	}

	function inspectNode(object, objects, duplicatesIndexes) {
	  var type = _toString.call(object),
	      objectKeyList,
	      index,
	      length;

	  if (null !== object && 'object' === typeof object) {
	    index = objects.indexOf(object);
	    if (-1 !== index) {
	      if (-1 === duplicatesIndexes.indexOf(index)) {
	        duplicatesIndexes.push(index);
	      }
	    } else {
	      objects.push(object);
	    
	      if(Array.isArray(object)) {
	        for (index = 0, length = object.length; index < length; index += 1) {
	          inspectNode(object[index], objects, duplicatesIndexes);
	        }
	      } else {
	        objectKeyList = Object.keys(object);

	        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
	        }
	      }
	    }
	  }
	}

	function dump(input, options) {
	  options = options || {};

	  var state = new State(options);

	  getDuplicateReferences(input, state);

	  if (writeNode(state, 0, input, true, true)) {
	    return state.dump + '\n';
	  } else {
	    return '';
	  }
	}


	function safeDump(input, options) {
	  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}


	module.exports.dump     = dump;
	module.exports.safeDump = safeDump;


/***/ },
/* 193 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var YAMLException = __webpack_require__(200);

	var TYPE_CONSTRUCTOR_OPTIONS = [
	  'kind',
	  'resolve',
	  'construct',
	  'instanceOf',
	  'predicate',
	  'represent',
	  'defaultStyle',
	  'styleAliases'
	];

	var YAML_NODE_KINDS = [
	  'scalar',
	  'sequence',
	  'mapping'
	];

	function compileStyleAliases(map) {
	  var result = {};

	  if (null !== map) {
	    Object.keys(map).forEach(function (style) {
	      map[style].forEach(function (alias) {
	        result[String(alias)] = style;
	      });
	    });
	  }

	  return result;
	}

	function Type(tag, options) {
	  options = options || {};

	  Object.keys(options).forEach(function (name) {
	    if (-1 === TYPE_CONSTRUCTOR_OPTIONS.indexOf(name)) {
	      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
	    }
	  });

	  // TODO: Add tag format check.
	  this.tag          = tag;
	  this.kind         = options['kind']         || null;
	  this.resolve      = options['resolve']      || function () { return true; };
	  this.construct    = options['construct']    || function (data) { return data; };
	  this.instanceOf   = options['instanceOf']   || null;
	  this.predicate    = options['predicate']    || null;
	  this.represent    = options['represent']    || null;
	  this.defaultStyle = options['defaultStyle'] || null;
	  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

	  if (-1 === YAML_NODE_KINDS.indexOf(this.kind)) {
	    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
	  }
	}

	module.exports = Type;


/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var common        = __webpack_require__(233);
	var YAMLException = __webpack_require__(200);
	var Type          = __webpack_require__(193);


	function compileList(schema, name, result) {
	  var exclude = [];

	  schema.include.forEach(function (includedSchema) {
	    result = compileList(includedSchema, name, result);
	  });

	  schema[name].forEach(function (currentType) {
	    result.forEach(function (previousType, previousIndex) {
	      if (previousType.tag === currentType.tag) {
	        exclude.push(previousIndex);
	      }
	    });

	    result.push(currentType);
	  });

	  return result.filter(function (type, index) {
	    return -1 === exclude.indexOf(index);
	  });
	}


	function compileMap(/* lists... */) {
	  var result = {}, index, length;

	  function collectType(type) {
	    result[type.tag] = type;
	  }

	  for (index = 0, length = arguments.length; index < length; index += 1) {
	    arguments[index].forEach(collectType);
	  }

	  return result;
	}


	function Schema(definition) {
	  this.include  = definition.include  || [];
	  this.implicit = definition.implicit || [];
	  this.explicit = definition.explicit || [];

	  this.implicit.forEach(function (type) {
	    if (type.loadKind && 'scalar' !== type.loadKind) {
	      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
	    }
	  });

	  this.compiledImplicit = compileList(this, 'implicit', []);
	  this.compiledExplicit = compileList(this, 'explicit', []);
	  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
	}


	Schema.DEFAULT = null;


	Schema.create = function createSchema() {
	  var schemas, types;

	  switch (arguments.length) {
	  case 1:
	    schemas = Schema.DEFAULT;
	    types = arguments[0];
	    break;

	  case 2:
	    schemas = arguments[0];
	    types = arguments[1];
	    break;

	  default:
	    throw new YAMLException('Wrong number of arguments for Schema.create function');
	  }

	  schemas = common.toArray(schemas);
	  types = common.toArray(types);

	  if (!schemas.every(function (schema) { return schema instanceof Schema; })) {
	    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
	  }

	  if (!types.every(function (type) { return type instanceof Type; })) {
	    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
	  }

	  return new Schema({
	    include: schemas,
	    explicit: types
	  });
	};


	module.exports = Schema;


/***/ },
/* 195 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's Failsafe schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2802346


	'use strict';


	var Schema = __webpack_require__(194);


	module.exports = new Schema({
	  explicit: [
	    __webpack_require__(235),
	    __webpack_require__(236),
	    __webpack_require__(237)
	  ]
	});


/***/ },
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's JSON schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2803231
	//
	// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
	// So, this schema is not such strict as defined in the YAML specification.
	// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.


	'use strict';


	var Schema = __webpack_require__(194);


	module.exports = new Schema({
	  include: [
	    __webpack_require__(195)
	  ],
	  implicit: [
	    __webpack_require__(238),
	    __webpack_require__(239),
	    __webpack_require__(240),
	    __webpack_require__(241)
	  ]
	});


/***/ },
/* 197 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's Core schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2804923
	//
	// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
	// So, Core schema has no distinctions from JSON schema is JS-YAML.


	'use strict';


	var Schema = __webpack_require__(194);


	module.exports = new Schema({
	  include: [
	    __webpack_require__(196)
	  ]
	});


/***/ },
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	// JS-YAML's default schema for `safeLoad` function.
	// It is not described in the YAML specification.
	//
	// This schema is based on standard YAML's Core schema and includes most of
	// extra types described at YAML tag repository. (http://yaml.org/type/)


	'use strict';


	var Schema = __webpack_require__(194);


	module.exports = new Schema({
	  include: [
	    __webpack_require__(197)
	  ],
	  implicit: [
	    __webpack_require__(242),
	    __webpack_require__(243)
	  ],
	  explicit: [
	    __webpack_require__(244),
	    __webpack_require__(245),
	    __webpack_require__(246),
	    __webpack_require__(247)
	  ]
	});


/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	// JS-YAML's default schema for `load` function.
	// It is not described in the YAML specification.
	//
	// This schema is based on JS-YAML's default safe schema and includes
	// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
	//
	// Also this schema is used as default base schema at `Schema.create` function.


	'use strict';


	var Schema = __webpack_require__(194);


	module.exports = Schema.DEFAULT = new Schema({
	  include: [
	    __webpack_require__(198)
	  ],
	  explicit: [
	    __webpack_require__(248),
	    __webpack_require__(249),
	    __webpack_require__(250)
	  ]
	});


/***/ },
/* 200 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	function YAMLException(reason, mark) {
	  this.name    = 'YAMLException';
	  this.reason  = reason;
	  this.mark    = mark;
	  this.message = this.toString(false);
	}


	YAMLException.prototype.toString = function toString(compact) {
	  var result;

	  result = 'JS-YAML: ' + (this.reason || '(unknown reason)');

	  if (!compact && this.mark) {
	    result += ' ' + this.mark.toString();
	  }

	  return result;
	};


	module.exports = YAMLException;


/***/ },
/* 201 */,
/* 202 */,
/* 203 */,
/* 204 */,
/* 205 */,
/* 206 */,
/* 207 */,
/* 208 */,
/* 209 */,
/* 210 */,
/* 211 */,
/* 212 */,
/* 213 */,
/* 214 */,
/* 215 */,
/* 216 */,
/* 217 */,
/* 218 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	/*jslint node: true*/
	"use strict";

	var esprima = __webpack_require__(262);
	var utils = __webpack_require__(232);

	var getBoundaryNode = utils.getBoundaryNode;
	var declareIdentInScope = utils.declareIdentInLocalScope;
	var initScopeMetadata = utils.initScopeMetadata;
	var Syntax = esprima.Syntax;

	/**
	 * @param {object} node
	 * @param {object} parentNode
	 * @return {boolean}
	 */
	function _nodeIsClosureScopeBoundary(node, parentNode) {
	  if (node.type === Syntax.Program) {
	    return true;
	  }

	  var parentIsFunction =
	    parentNode.type === Syntax.FunctionDeclaration
	    || parentNode.type === Syntax.FunctionExpression
	    || parentNode.type === Syntax.ArrowFunctionExpression;

	  var parentIsCurlylessArrowFunc =
	    parentNode.type === Syntax.ArrowFunctionExpression
	    && node === parentNode.body;

	  return parentIsFunction
	         && (node.type === Syntax.BlockStatement || parentIsCurlylessArrowFunc);
	}

	function _nodeIsBlockScopeBoundary(node, parentNode) {
	  if (node.type === Syntax.Program) {
	    return false;
	  }

	  return node.type === Syntax.BlockStatement
	         && parentNode.type === Syntax.CatchClause;
	}

	/**
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function traverse(node, path, state) {
	  /*jshint -W004*/
	  // Create a scope stack entry if this is the first node we've encountered in
	  // its local scope
	  var startIndex = null;
	  var parentNode = path[0];
	  if (!Array.isArray(node) && state.localScope.parentNode !== parentNode) {
	    if (_nodeIsClosureScopeBoundary(node, parentNode)) {
	      var scopeIsStrict = state.scopeIsStrict;
	      if (!scopeIsStrict
	          && (node.type === Syntax.BlockStatement
	              || node.type === Syntax.Program)) {
	          scopeIsStrict =
	            node.body.length > 0
	            && node.body[0].type === Syntax.ExpressionStatement
	            && node.body[0].expression.type === Syntax.Literal
	            && node.body[0].expression.value === 'use strict';
	      }

	      if (node.type === Syntax.Program) {
	        startIndex = state.g.buffer.length;
	        state = utils.updateState(state, {
	          scopeIsStrict: scopeIsStrict
	        });
	      } else {
	        startIndex = state.g.buffer.length + 1;
	        state = utils.updateState(state, {
	          localScope: {
	            parentNode: parentNode,
	            parentScope: state.localScope,
	            identifiers: {},
	            tempVarIndex: 0,
	            tempVars: []
	          },
	          scopeIsStrict: scopeIsStrict
	        });

	        // All functions have an implicit 'arguments' object in scope
	        declareIdentInScope('arguments', initScopeMetadata(node), state);

	        // Include function arg identifiers in the scope boundaries of the
	        // function
	        if (parentNode.params.length > 0) {
	          var param;
	          var metadata = initScopeMetadata(parentNode, path.slice(1), path[0]);
	          for (var i = 0; i < parentNode.params.length; i++) {
	            param = parentNode.params[i];
	            if (param.type === Syntax.Identifier) {
	              declareIdentInScope(param.name, metadata, state);
	            }
	          }
	        }

	        // Include rest arg identifiers in the scope boundaries of their
	        // functions
	        if (parentNode.rest) {
	          var metadata = initScopeMetadata(
	            parentNode,
	            path.slice(1),
	            path[0]
	          );
	          declareIdentInScope(parentNode.rest.name, metadata, state);
	        }

	        // Named FunctionExpressions scope their name within the body block of
	        // themselves only
	        if (parentNode.type === Syntax.FunctionExpression && parentNode.id) {
	          var metaData =
	            initScopeMetadata(parentNode, path.parentNodeslice, parentNode);
	          declareIdentInScope(parentNode.id.name, metaData, state);
	        }
	      }

	      // Traverse and find all local identifiers in this closure first to
	      // account for function/variable declaration hoisting
	      collectClosureIdentsAndTraverse(node, path, state);
	    }

	    if (_nodeIsBlockScopeBoundary(node, parentNode)) {
	      startIndex = state.g.buffer.length;
	      state = utils.updateState(state, {
	        localScope: {
	          parentNode: parentNode,
	          parentScope: state.localScope,
	          identifiers: {},
	          tempVarIndex: 0,
	          tempVars: []
	        }
	      });

	      if (parentNode.type === Syntax.CatchClause) {
	        var metadata = initScopeMetadata(
	          parentNode,
	          path.slice(1),
	          parentNode
	        );
	        declareIdentInScope(parentNode.param.name, metadata, state);
	      }
	      collectBlockIdentsAndTraverse(node, path, state);
	    }
	  }

	  // Only catchup() before and after traversing a child node
	  function traverser(node, path, state) {
	    node.range && utils.catchup(node.range[0], state);
	    traverse(node, path, state);
	    node.range && utils.catchup(node.range[1], state);
	  }

	  utils.analyzeAndTraverse(walker, traverser, node, path, state);

	  // Inject temp variables into the scope.
	  if (startIndex !== null) {
	    utils.injectTempVarDeclarations(state, startIndex);
	  }
	}

	function collectClosureIdentsAndTraverse(node, path, state) {
	  utils.analyzeAndTraverse(
	    visitLocalClosureIdentifiers,
	    collectClosureIdentsAndTraverse,
	    node,
	    path,
	    state
	  );
	}

	function collectBlockIdentsAndTraverse(node, path, state) {
	  utils.analyzeAndTraverse(
	    visitLocalBlockIdentifiers,
	    collectBlockIdentsAndTraverse,
	    node,
	    path,
	    state
	  );
	}

	function visitLocalClosureIdentifiers(node, path, state) {
	  var metaData;
	  switch (node.type) {
	    case Syntax.ArrowFunctionExpression:
	    case Syntax.FunctionExpression:
	      // Function expressions don't get their names (if there is one) added to
	      // the closure scope they're defined in
	      return false;
	    case Syntax.ClassDeclaration:
	    case Syntax.ClassExpression:
	    case Syntax.FunctionDeclaration:
	      if (node.id) {
	        metaData = initScopeMetadata(getBoundaryNode(path), path.slice(), node);
	        declareIdentInScope(node.id.name, metaData, state);
	      }
	      return false;
	    case Syntax.VariableDeclarator:
	      // Variables have function-local scope
	      if (path[0].kind === 'var') {
	        metaData = initScopeMetadata(getBoundaryNode(path), path.slice(), node);
	        declareIdentInScope(node.id.name, metaData, state);
	      }
	      break;
	  }
	}

	function visitLocalBlockIdentifiers(node, path, state) {
	  // TODO: Support 'let' here...maybe...one day...or something...
	  if (node.type === Syntax.CatchClause) {
	    return false;
	  }
	}

	function walker(node, path, state) {
	  var visitors = state.g.visitors;
	  for (var i = 0; i < visitors.length; i++) {
	    if (visitors[i].test(node, path, state)) {
	      return visitors[i](traverse, node, path, state);
	    }
	  }
	}

	var _astCache = {};

	function getAstForSource(source, options) {
	  if (_astCache[source] && !options.disableAstCache) {
	    return _astCache[source];
	  }
	  var ast = esprima.parse(source, {
	    comment: true,
	    loc: true,
	    range: true,
	    sourceType: options.sourceType
	  });
	  if (!options.disableAstCache) {
	    _astCache[source] = ast;
	  }
	  return ast;
	}

	/**
	 * Applies all available transformations to the source
	 * @param {array} visitors
	 * @param {string} source
	 * @param {?object} options
	 * @return {object}
	 */
	function transform(visitors, source, options) {
	  options = options || {};
	  var ast;
	  try {
	    ast = getAstForSource(source, options);
	    } catch (e) {
	    e.message = 'Parse Error: ' + e.message;
	    throw e;
	  }
	  var state = utils.createState(source, ast, options);
	  state.g.visitors = visitors;

	  if (options.sourceMap) {
	    var SourceMapGenerator = __webpack_require__(267).SourceMapGenerator;
	    state.g.sourceMap = new SourceMapGenerator({file: options.filename || 'transformed.js'});
	  }

	  traverse(ast, [], state);
	  utils.catchup(source.length, state);

	  var ret = {code: state.g.buffer, extra: state.g.extra};
	  if (options.sourceMap) {
	    ret.sourceMap = state.g.sourceMap;
	    ret.sourceMapFilename =  options.filename || 'source.js';
	  }
	  return ret;
	}

	exports.transform = transform;
	exports.Syntax = Syntax;


/***/ },
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*global exports:true*/

	/**
	 * Desugars ES6 Arrow functions to ES3 function expressions.
	 * If the function contains `this` expression -- automatically
	 * binds the function to current value of `this`.
	 *
	 * Single parameter, simple expression:
	 *
	 * [1, 2, 3].map(x => x * x);
	 *
	 * [1, 2, 3].map(function(x) { return x * x; });
	 *
	 * Several parameters, complex block:
	 *
	 * this.users.forEach((user, idx) => {
	 *   return this.isActive(idx) && this.send(user);
	 * });
	 *
	 * this.users.forEach(function(user, idx) {
	 *   return this.isActive(idx) && this.send(user);
	 * }.bind(this));
	 *
	 */
	var restParamVisitors = __webpack_require__(224);
	var destructuringVisitors = __webpack_require__(221);

	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);

	/**
	 * @public
	 */
	function visitArrowFunction(traverse, node, path, state) {
	  var notInExpression = (path[0].type === Syntax.ExpressionStatement);

	  // Wrap a function into a grouping operator, if it's not
	  // in the expression position.
	  if (notInExpression) {
	    utils.append('(', state);
	  }

	  utils.append('function', state);
	  renderParams(traverse, node, path, state);

	  // Skip arrow.
	  utils.catchupWhiteSpace(node.body.range[0], state);

	  var renderBody = node.body.type == Syntax.BlockStatement
	    ? renderStatementBody
	    : renderExpressionBody;

	  path.unshift(node);
	  renderBody(traverse, node, path, state);
	  path.shift();

	  // Bind the function only if `this` value is used
	  // inside it or inside any sub-expression.
	  var containsBindingSyntax =
	    utils.containsChildMatching(node.body, function(node) {
	      return node.type === Syntax.ThisExpression
	             || (node.type === Syntax.Identifier
	                 && node.name === "super");
	    });

	  if (containsBindingSyntax) {
	    utils.append('.bind(this)', state);
	  }

	  utils.catchupWhiteSpace(node.range[1], state);

	  // Close wrapper if not in the expression.
	  if (notInExpression) {
	    utils.append(')', state);
	  }

	  return false;
	}

	function renderParams(traverse, node, path, state) {
	  // To preserve inline typechecking directives, we
	  // distinguish between parens-free and paranthesized single param.
	  if (isParensFreeSingleParam(node, state) || !node.params.length) {
	    utils.append('(', state);
	  }
	  if (node.params.length !== 0) {
	    path.unshift(node);
	    traverse(node.params, path, state);
	    path.unshift();
	  }
	  utils.append(')', state);
	}

	function isParensFreeSingleParam(node, state) {
	  return node.params.length === 1 &&
	    state.g.source[state.g.position] !== '(';
	}

	function renderExpressionBody(traverse, node, path, state) {
	  // Wrap simple expression bodies into a block
	  // with explicit return statement.
	  utils.append('{', state);

	  // Special handling of rest param.
	  if (node.rest) {
	    utils.append(
	      restParamVisitors.renderRestParamSetup(node, state),
	      state
	    );
	  }

	  // Special handling of destructured params.
	  destructuringVisitors.renderDestructuredComponents(
	    node,
	    utils.updateState(state, {
	      localScope: {
	        parentNode: state.parentNode,
	        parentScope: state.parentScope,
	        identifiers: state.identifiers,
	        tempVarIndex: 0
	      }
	    })
	  );

	  utils.append('return ', state);
	  renderStatementBody(traverse, node, path, state);
	  utils.append(';}', state);
	}

	function renderStatementBody(traverse, node, path, state) {
	  traverse(node.body, path, state);
	  utils.catchup(node.body.range[1], state);
	}

	visitArrowFunction.test = function(node, path, state) {
	  return node.type === Syntax.ArrowFunctionExpression;
	};

	exports.visitorList = [
	  visitArrowFunction
	];



/***/ },
/* 220 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*jslint node:true*/

	/**
	 * @typechecks
	 */
	'use strict';

	var base62 = __webpack_require__(268);
	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);
	var reservedWordsHelper = __webpack_require__(258);

	var declareIdentInLocalScope = utils.declareIdentInLocalScope;
	var initScopeMetadata = utils.initScopeMetadata;

	var SUPER_PROTO_IDENT_PREFIX = '____SuperProtoOf';

	var _anonClassUUIDCounter = 0;
	var _mungedSymbolMaps = {};

	function resetSymbols() {
	  _anonClassUUIDCounter = 0;
	  _mungedSymbolMaps = {};
	}

	/**
	 * Used to generate a unique class for use with code-gens for anonymous class
	 * expressions.
	 *
	 * @param {object} state
	 * @return {string}
	 */
	function _generateAnonymousClassName(state) {
	  var mungeNamespace = state.mungeNamespace || '';
	  return '____Class' + mungeNamespace + base62.encode(_anonClassUUIDCounter++);
	}

	/**
	 * Given an identifier name, munge it using the current state's mungeNamespace.
	 *
	 * @param {string} identName
	 * @param {object} state
	 * @return {string}
	 */
	function _getMungedName(identName, state) {
	  var mungeNamespace = state.mungeNamespace;
	  var shouldMinify = state.g.opts.minify;

	  if (shouldMinify) {
	    if (!_mungedSymbolMaps[mungeNamespace]) {
	      _mungedSymbolMaps[mungeNamespace] = {
	        symbolMap: {},
	        identUUIDCounter: 0
	      };
	    }

	    var symbolMap = _mungedSymbolMaps[mungeNamespace].symbolMap;
	    if (!symbolMap[identName]) {
	      symbolMap[identName] =
	        base62.encode(_mungedSymbolMaps[mungeNamespace].identUUIDCounter++);
	    }
	    identName = symbolMap[identName];
	  }
	  return '$' + mungeNamespace + identName;
	}

	/**
	 * Extracts super class information from a class node.
	 *
	 * Information includes name of the super class and/or the expression string
	 * (if extending from an expression)
	 *
	 * @param {object} node
	 * @param {object} state
	 * @return {object}
	 */
	function _getSuperClassInfo(node, state) {
	  var ret = {
	    name: null,
	    expression: null
	  };
	  if (node.superClass) {
	    if (node.superClass.type === Syntax.Identifier) {
	      ret.name = node.superClass.name;
	    } else {
	      // Extension from an expression
	      ret.name = _generateAnonymousClassName(state);
	      ret.expression = state.g.source.substring(
	        node.superClass.range[0],
	        node.superClass.range[1]
	      );
	    }
	  }
	  return ret;
	}

	/**
	 * Used with .filter() to find the constructor method in a list of
	 * MethodDefinition nodes.
	 *
	 * @param {object} classElement
	 * @return {boolean}
	 */
	function _isConstructorMethod(classElement) {
	  return classElement.type === Syntax.MethodDefinition &&
	         classElement.key.type === Syntax.Identifier &&
	         classElement.key.name === 'constructor';
	}

	/**
	 * @param {object} node
	 * @param {object} state
	 * @return {boolean}
	 */
	function _shouldMungeIdentifier(node, state) {
	  return (
	    !!state.methodFuncNode &&
	    !utils.getDocblock(state).hasOwnProperty('preventMunge') &&
	    /^_(?!_)/.test(node.name)
	  );
	}

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function visitClassMethod(traverse, node, path, state) {
	  if (!state.g.opts.es5 && (node.kind === 'get' || node.kind === 'set')) {
	    throw new Error(
	      'This transform does not support ' + node.kind + 'ter methods for ES6 ' +
	      'classes. (line: ' + node.loc.start.line + ', col: ' +
	      node.loc.start.column + ')'
	    );
	  }
	  state = utils.updateState(state, {
	    methodNode: node
	  });
	  utils.catchup(node.range[0], state);
	  path.unshift(node);
	  traverse(node.value, path, state);
	  path.shift();
	  return false;
	}
	visitClassMethod.test = function(node, path, state) {
	  return node.type === Syntax.MethodDefinition;
	};

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function visitClassFunctionExpression(traverse, node, path, state) {
	  var methodNode = path[0];
	  var isGetter = methodNode.kind === 'get';
	  var isSetter = methodNode.kind === 'set';

	  state = utils.updateState(state, {
	    methodFuncNode: node
	  });

	  if (methodNode.key.name === 'constructor') {
	    utils.append('function ' + state.className, state);
	  } else {
	    var methodAccessorComputed = false;
	    var methodAccessor;
	    var prototypeOrStatic = methodNode.static ? '' : '.prototype';
	    var objectAccessor = state.className + prototypeOrStatic;

	    if (methodNode.key.type === Syntax.Identifier) {
	      // foo() {}
	      methodAccessor = methodNode.key.name;
	      if (_shouldMungeIdentifier(methodNode.key, state)) {
	        methodAccessor = _getMungedName(methodAccessor, state);
	      }
	      if (isGetter || isSetter) {
	        methodAccessor = JSON.stringify(methodAccessor);
	      } else if (reservedWordsHelper.isReservedWord(methodAccessor)) {
	        methodAccessorComputed = true;
	        methodAccessor = JSON.stringify(methodAccessor);
	      }
	    } else if (methodNode.key.type === Syntax.Literal) {
	      // 'foo bar'() {}  | get 'foo bar'() {} | set 'foo bar'() {}
	      methodAccessor = JSON.stringify(methodNode.key.value);
	      methodAccessorComputed = true;
	    }

	    if (isSetter || isGetter) {
	      utils.append(
	        'Object.defineProperty(' +
	          objectAccessor + ',' +
	          methodAccessor + ',' +
	          '{configurable:true,' +
	          methodNode.kind + ':function',
	        state
	      );
	    } else {
	      if (state.g.opts.es3) {
	        if (methodAccessorComputed) {
	          methodAccessor = '[' + methodAccessor + ']';
	        } else {
	          methodAccessor = '.' + methodAccessor;
	        }
	        utils.append(
	          objectAccessor +
	          methodAccessor + '=function' + (node.generator ? '*' : ''),
	          state
	        );
	      } else {
	        if (!methodAccessorComputed) {
	          methodAccessor = JSON.stringify(methodAccessor);
	        }
	        utils.append(
	          'Object.defineProperty(' +
	            objectAccessor + ',' +
	            methodAccessor + ',' +
	            '{writable:true,configurable:true,' +
	            'value:function' + (node.generator ? '*' : ''),
	          state
	        );
	      }
	    }
	  }
	  utils.move(methodNode.key.range[1], state);
	  utils.append('(', state);

	  var params = node.params;
	  if (params.length > 0) {
	    utils.catchupNewlines(params[0].range[0], state);
	    for (var i = 0; i < params.length; i++) {
	      utils.catchup(node.params[i].range[0], state);
	      path.unshift(node);
	      traverse(params[i], path, state);
	      path.shift();
	    }
	  }

	  var closingParenPosition = utils.getNextSyntacticCharOffset(')', state);
	  utils.catchupWhiteSpace(closingParenPosition, state);

	  var openingBracketPosition = utils.getNextSyntacticCharOffset('{', state);
	  utils.catchup(openingBracketPosition + 1, state);

	  if (!state.scopeIsStrict) {
	    utils.append('"use strict";', state);
	    state = utils.updateState(state, {
	      scopeIsStrict: true
	    });
	  }
	  utils.move(node.body.range[0] + '{'.length, state);

	  path.unshift(node);
	  traverse(node.body, path, state);
	  path.shift();
	  utils.catchup(node.body.range[1], state);

	  if (methodNode.key.name !== 'constructor') {
	    if (isGetter || isSetter || !state.g.opts.es3) {
	      utils.append('})', state);
	    }
	    utils.append(';', state);
	  }
	  return false;
	}
	visitClassFunctionExpression.test = function(node, path, state) {
	  return node.type === Syntax.FunctionExpression
	         && path[0].type === Syntax.MethodDefinition;
	};

	function visitClassMethodParam(traverse, node, path, state) {
	  var paramName = node.name;
	  if (_shouldMungeIdentifier(node, state)) {
	    paramName = _getMungedName(node.name, state);
	  }
	  utils.append(paramName, state);
	  utils.move(node.range[1], state);
	}
	visitClassMethodParam.test = function(node, path, state) {
	  if (!path[0] || !path[1]) {
	    return;
	  }

	  var parentFuncExpr = path[0];
	  var parentClassMethod = path[1];

	  return parentFuncExpr.type === Syntax.FunctionExpression
	         && parentClassMethod.type === Syntax.MethodDefinition
	         && node.type === Syntax.Identifier;
	};

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function _renderClassBody(traverse, node, path, state) {
	  var className = state.className;
	  var superClass = state.superClass;

	  // Set up prototype of constructor on same line as `extends` for line-number
	  // preservation. This relies on function-hoisting if a constructor function is
	  // defined in the class body.
	  if (superClass.name) {
	    // If the super class is an expression, we need to memoize the output of the
	    // expression into the generated class name variable and use that to refer
	    // to the super class going forward. Example:
	    //
	    //   class Foo extends mixin(Bar, Baz) {}
	    //     --transforms to--
	    //   function Foo() {} var ____Class0Blah = mixin(Bar, Baz);
	    if (superClass.expression !== null) {
	      utils.append(
	        'var ' + superClass.name + '=' + superClass.expression + ';',
	        state
	      );
	    }

	    var keyName = superClass.name + '____Key';
	    var keyNameDeclarator = '';
	    if (!utils.identWithinLexicalScope(keyName, state)) {
	      keyNameDeclarator = 'var ';
	      declareIdentInLocalScope(keyName, initScopeMetadata(node), state);
	    }
	    utils.append(
	      'for(' + keyNameDeclarator + keyName + ' in ' + superClass.name + '){' +
	        'if(' + superClass.name + '.hasOwnProperty(' + keyName + ')){' +
	          className + '[' + keyName + ']=' +
	            superClass.name + '[' + keyName + '];' +
	        '}' +
	      '}',
	      state
	    );

	    var superProtoIdentStr = SUPER_PROTO_IDENT_PREFIX + superClass.name;
	    if (!utils.identWithinLexicalScope(superProtoIdentStr, state)) {
	      utils.append(
	        'var ' + superProtoIdentStr + '=' + superClass.name + '===null?' +
	        'null:' + superClass.name + '.prototype;',
	        state
	      );
	      declareIdentInLocalScope(superProtoIdentStr, initScopeMetadata(node), state);
	    }

	    utils.append(
	      className + '.prototype=Object.create(' + superProtoIdentStr + ');',
	      state
	    );
	    utils.append(
	      className + '.prototype.constructor=' + className + ';',
	      state
	    );
	    utils.append(
	      className + '.__superConstructor__=' + superClass.name + ';',
	      state
	    );
	  }

	  // If there's no constructor method specified in the class body, create an
	  // empty constructor function at the top (same line as the class keyword)
	  if (!node.body.body.filter(_isConstructorMethod).pop()) {
	    utils.append('function ' + className + '(){', state);
	    if (!state.scopeIsStrict) {
	      utils.append('"use strict";', state);
	    }
	    if (superClass.name) {
	      utils.append(
	        'if(' + superClass.name + '!==null){' +
	        superClass.name + '.apply(this,arguments);}',
	        state
	      );
	    }
	    utils.append('}', state);
	  }

	  utils.move(node.body.range[0] + '{'.length, state);
	  traverse(node.body, path, state);
	  utils.catchupWhiteSpace(node.range[1], state);
	}

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function visitClassDeclaration(traverse, node, path, state) {
	  var className = node.id.name;
	  var superClass = _getSuperClassInfo(node, state);

	  state = utils.updateState(state, {
	    mungeNamespace: className,
	    className: className,
	    superClass: superClass
	  });

	  _renderClassBody(traverse, node, path, state);

	  return false;
	}
	visitClassDeclaration.test = function(node, path, state) {
	  return node.type === Syntax.ClassDeclaration;
	};

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function visitClassExpression(traverse, node, path, state) {
	  var className = node.id && node.id.name || _generateAnonymousClassName(state);
	  var superClass = _getSuperClassInfo(node, state);

	  utils.append('(function(){', state);

	  state = utils.updateState(state, {
	    mungeNamespace: className,
	    className: className,
	    superClass: superClass
	  });

	  _renderClassBody(traverse, node, path, state);

	  utils.append('return ' + className + ';})()', state);
	  return false;
	}
	visitClassExpression.test = function(node, path, state) {
	  return node.type === Syntax.ClassExpression;
	};

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function visitPrivateIdentifier(traverse, node, path, state) {
	  utils.append(_getMungedName(node.name, state), state);
	  utils.move(node.range[1], state);
	}
	visitPrivateIdentifier.test = function(node, path, state) {
	  if (node.type === Syntax.Identifier && _shouldMungeIdentifier(node, state)) {
	    // Always munge non-computed properties of MemberExpressions
	    // (a la preventing access of properties of unowned objects)
	    if (path[0].type === Syntax.MemberExpression && path[0].object !== node
	        && path[0].computed === false) {
	      return true;
	    }

	    // Always munge identifiers that were declared within the method function
	    // scope
	    if (utils.identWithinLexicalScope(node.name, state, state.methodFuncNode)) {
	      return true;
	    }

	    // Always munge private keys on object literals defined within a method's
	    // scope.
	    if (path[0].type === Syntax.Property
	        && path[1].type === Syntax.ObjectExpression) {
	      return true;
	    }

	    // Always munge function parameters
	    if (path[0].type === Syntax.FunctionExpression
	        || path[0].type === Syntax.FunctionDeclaration
	        || path[0].type === Syntax.ArrowFunctionExpression) {
	      for (var i = 0; i < path[0].params.length; i++) {
	        if (path[0].params[i] === node) {
	          return true;
	        }
	      }
	    }
	  }
	  return false;
	};

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function visitSuperCallExpression(traverse, node, path, state) {
	  var superClassName = state.superClass.name;

	  if (node.callee.type === Syntax.Identifier) {
	    if (_isConstructorMethod(state.methodNode)) {
	      utils.append(superClassName + '.call(', state);
	    } else {
	      var protoProp = SUPER_PROTO_IDENT_PREFIX + superClassName;
	      if (state.methodNode.key.type === Syntax.Identifier) {
	        protoProp += '.' + state.methodNode.key.name;
	      } else if (state.methodNode.key.type === Syntax.Literal) {
	        protoProp += '[' + JSON.stringify(state.methodNode.key.value) + ']';
	      }
	      utils.append(protoProp + ".call(", state);
	    }
	    utils.move(node.callee.range[1], state);
	  } else if (node.callee.type === Syntax.MemberExpression) {
	    utils.append(SUPER_PROTO_IDENT_PREFIX + superClassName, state);
	    utils.move(node.callee.object.range[1], state);

	    if (node.callee.computed) {
	      // ["a" + "b"]
	      utils.catchup(node.callee.property.range[1] + ']'.length, state);
	    } else {
	      // .ab
	      utils.append('.' + node.callee.property.name, state);
	    }

	    utils.append('.call(', state);
	    utils.move(node.callee.range[1], state);
	  }

	  utils.append('this', state);
	  if (node.arguments.length > 0) {
	    utils.append(',', state);
	    utils.catchupWhiteSpace(node.arguments[0].range[0], state);
	    traverse(node.arguments, path, state);
	  }

	  utils.catchupWhiteSpace(node.range[1], state);
	  utils.append(')', state);
	  return false;
	}
	visitSuperCallExpression.test = function(node, path, state) {
	  if (state.superClass && node.type === Syntax.CallExpression) {
	    var callee = node.callee;
	    if (callee.type === Syntax.Identifier && callee.name === 'super'
	        || callee.type == Syntax.MemberExpression
	           && callee.object.name === 'super') {
	      return true;
	    }
	  }
	  return false;
	};

	/**
	 * @param {function} traverse
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function visitSuperMemberExpression(traverse, node, path, state) {
	  var superClassName = state.superClass.name;

	  utils.append(SUPER_PROTO_IDENT_PREFIX + superClassName, state);
	  utils.move(node.object.range[1], state);
	}
	visitSuperMemberExpression.test = function(node, path, state) {
	  return state.superClass
	         && node.type === Syntax.MemberExpression
	         && node.object.type === Syntax.Identifier
	         && node.object.name === 'super';
	};

	exports.resetSymbols = resetSymbols;

	exports.visitorList = [
	  visitClassDeclaration,
	  visitClassExpression,
	  visitClassFunctionExpression,
	  visitClassMethod,
	  visitClassMethodParam,
	  visitPrivateIdentifier,
	  visitSuperCallExpression,
	  visitSuperMemberExpression
	];


/***/ },
/* 221 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2014 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	/*global exports:true*/

	/**
	 * Implements ES6 destructuring assignment and pattern matchng.
	 *
	 * function init({port, ip, coords: [x, y]}) {
	 *   return (x && y) ? {id, port} : {ip};
	 * };
	 *
	 * function init($__0) {
	 *   var
	 *    port = $__0.port,
	 *    ip = $__0.ip,
	 *    $__1 = $__0.coords,
	 *    x = $__1[0],
	 *    y = $__1[1];
	 *   return (x && y) ? {id, port} : {ip};
	 * }
	 *
	 * var x, {ip, port} = init({ip, port});
	 *
	 * var x, $__0 = init({ip, port}), ip = $__0.ip, port = $__0.port;
	 *
	 */
	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);

	var reservedWordsHelper = __webpack_require__(258);
	var restParamVisitors = __webpack_require__(224);
	var restPropertyHelpers = __webpack_require__(259);

	// -------------------------------------------------------
	// 1. Structured variable declarations.
	//
	// var [a, b] = [b, a];
	// var {x, y} = {y, x};
	// -------------------------------------------------------

	function visitStructuredVariable(traverse, node, path, state) {
	  // Allocate new temp for the pattern.
	  utils.append(utils.getTempVar(state.localScope.tempVarIndex) + '=', state);
	  // Skip the pattern and assign the init to the temp.
	  utils.catchupWhiteSpace(node.init.range[0], state);
	  traverse(node.init, path, state);
	  utils.catchup(node.init.range[1], state);
	  // Render the destructured data.
	  utils.append(',' + getDestructuredComponents(node.id, state), state);
	  state.localScope.tempVarIndex++;
	  return false;
	}

	visitStructuredVariable.test = function(node, path, state) {
	  return node.type === Syntax.VariableDeclarator &&
	    isStructuredPattern(node.id);
	};

	function isStructuredPattern(node) {
	  return node.type === Syntax.ObjectPattern ||
	    node.type === Syntax.ArrayPattern;
	}

	// Main function which does actual recursive destructuring
	// of nested complex structures.
	function getDestructuredComponents(node, state) {
	  var tmpIndex = state.localScope.tempVarIndex;
	  var components = [];
	  var patternItems = getPatternItems(node);

	  for (var idx = 0; idx < patternItems.length; idx++) {
	    var item = patternItems[idx];
	    if (!item) {
	      continue;
	    }

	    if (item.type === Syntax.SpreadElement) {
	      // Spread/rest of an array.
	      // TODO(dmitrys): support spread in the middle of a pattern
	      // and also for function param patterns: [x, ...xs, y]
	      components.push(item.argument.name +
	        '=Array.prototype.slice.call(' +
	        utils.getTempVar(tmpIndex) + ',' + idx + ')'
	      );
	      continue;
	    }

	    if (item.type === Syntax.SpreadProperty) {
	      var restExpression = restPropertyHelpers.renderRestExpression(
	        utils.getTempVar(tmpIndex),
	        patternItems
	      );
	      components.push(item.argument.name + '=' + restExpression);
	      continue;
	    }

	    // Depending on pattern type (Array or Object), we get
	    // corresponding pattern item parts.
	    var accessor = getPatternItemAccessor(node, item, tmpIndex, idx);
	    var value = getPatternItemValue(node, item);

	    // TODO(dmitrys): implement default values: {x, y=5}
	    if (value.type === Syntax.Identifier) {
	      // Simple pattern item.
	      components.push(value.name + '=' + accessor);
	    } else {
	      // Complex sub-structure.
	      components.push(
	        utils.getTempVar(++state.localScope.tempVarIndex) + '=' + accessor +
	        ',' + getDestructuredComponents(value, state)
	      );
	    }
	  }

	  return components.join(',');
	}

	function getPatternItems(node) {
	  return node.properties || node.elements;
	}

	function getPatternItemAccessor(node, patternItem, tmpIndex, idx) {
	  var tmpName = utils.getTempVar(tmpIndex);
	  if (node.type === Syntax.ObjectPattern) {
	    if (reservedWordsHelper.isReservedWord(patternItem.key.name)) {
	      return tmpName + '["' + patternItem.key.name + '"]';
	    } else if (patternItem.key.type === Syntax.Literal) {
	      return tmpName + '[' + JSON.stringify(patternItem.key.value) + ']';
	    } else if (patternItem.key.type === Syntax.Identifier) {
	      return tmpName + '.' + patternItem.key.name;
	    }
	  } else if (node.type === Syntax.ArrayPattern) {
	    return tmpName + '[' + idx + ']';
	  }
	}

	function getPatternItemValue(node, patternItem) {
	  return node.type === Syntax.ObjectPattern
	    ? patternItem.value
	    : patternItem;
	}

	// -------------------------------------------------------
	// 2. Assignment expression.
	//
	// [a, b] = [b, a];
	// ({x, y} = {y, x});
	// -------------------------------------------------------

	function visitStructuredAssignment(traverse, node, path, state) {
	  var exprNode = node.expression;
	  utils.append('var ' + utils.getTempVar(state.localScope.tempVarIndex) + '=', state);

	  utils.catchupWhiteSpace(exprNode.right.range[0], state);
	  traverse(exprNode.right, path, state);
	  utils.catchup(exprNode.right.range[1], state);

	  utils.append(
	    ';' + getDestructuredComponents(exprNode.left, state) + ';',
	    state
	  );

	  utils.catchupWhiteSpace(node.range[1], state);
	  state.localScope.tempVarIndex++;
	  return false;
	}

	visitStructuredAssignment.test = function(node, path, state) {
	  // We consider the expression statement rather than just assignment
	  // expression to cover case with object patters which should be
	  // wrapped in grouping operator: ({x, y} = {y, x});
	  return node.type === Syntax.ExpressionStatement &&
	    node.expression.type === Syntax.AssignmentExpression &&
	    isStructuredPattern(node.expression.left);
	};

	// -------------------------------------------------------
	// 3. Structured parameter.
	//
	// function foo({x, y}) { ... }
	// -------------------------------------------------------

	function visitStructuredParameter(traverse, node, path, state) {
	  utils.append(utils.getTempVar(getParamIndex(node, path)), state);
	  utils.catchupWhiteSpace(node.range[1], state);
	  return true;
	}

	function getParamIndex(paramNode, path) {
	  var funcNode = path[0];
	  var tmpIndex = 0;
	  for (var k = 0; k < funcNode.params.length; k++) {
	    var param = funcNode.params[k];
	    if (param === paramNode) {
	      break;
	    }
	    if (isStructuredPattern(param)) {
	      tmpIndex++;
	    }
	  }
	  return tmpIndex;
	}

	visitStructuredParameter.test = function(node, path, state) {
	  return isStructuredPattern(node) && isFunctionNode(path[0]);
	};

	function isFunctionNode(node) {
	  return (node.type == Syntax.FunctionDeclaration ||
	    node.type == Syntax.FunctionExpression ||
	    node.type == Syntax.MethodDefinition ||
	    node.type == Syntax.ArrowFunctionExpression);
	}

	// -------------------------------------------------------
	// 4. Function body for structured parameters.
	//
	// function foo({x, y}) { x; y; }
	// -------------------------------------------------------

	function visitFunctionBodyForStructuredParameter(traverse, node, path, state) {
	  var funcNode = path[0];

	  utils.catchup(funcNode.body.range[0] + 1, state);
	  renderDestructuredComponents(funcNode, state);

	  if (funcNode.rest) {
	    utils.append(
	      restParamVisitors.renderRestParamSetup(funcNode, state),
	      state
	    );
	  }

	  return true;
	}

	function renderDestructuredComponents(funcNode, state) {
	  var destructuredComponents = [];

	  for (var k = 0; k < funcNode.params.length; k++) {
	    var param = funcNode.params[k];
	    if (isStructuredPattern(param)) {
	      destructuredComponents.push(
	        getDestructuredComponents(param, state)
	      );
	      state.localScope.tempVarIndex++;
	    }
	  }

	  if (destructuredComponents.length) {
	    utils.append('var ' + destructuredComponents.join(',') + ';', state);
	  }
	}

	visitFunctionBodyForStructuredParameter.test = function(node, path, state) {
	  return node.type === Syntax.BlockStatement && isFunctionNode(path[0]);
	};

	exports.visitorList = [
	  visitStructuredVariable,
	  visitStructuredAssignment,
	  visitStructuredParameter,
	  visitFunctionBodyForStructuredParameter
	];

	exports.renderDestructuredComponents = renderDestructuredComponents;



/***/ },
/* 222 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*jslint node:true*/

	/**
	 * Desugars concise methods of objects to function expressions.
	 *
	 * var foo = {
	 *   method(x, y) { ... }
	 * };
	 *
	 * var foo = {
	 *   method: function(x, y) { ... }
	 * };
	 *
	 */

	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);
	var reservedWordsHelper = __webpack_require__(258);

	function visitObjectConciseMethod(traverse, node, path, state) {
	  var isGenerator = node.value.generator;
	  if (isGenerator) {
	    utils.catchupWhiteSpace(node.range[0] + 1, state);
	  }
	  if (node.computed) { // [<expr>]() { ...}
	    utils.catchup(node.key.range[1] + 1, state);
	  } else if (reservedWordsHelper.isReservedWord(node.key.name)) {
	    utils.catchup(node.key.range[0], state);
	    utils.append('"', state);
	    utils.catchup(node.key.range[1], state);
	    utils.append('"', state);
	  }

	  utils.catchup(node.key.range[1], state);
	  utils.append(
	    ':function' + (isGenerator ? '*' : ''),
	    state
	  );
	  path.unshift(node);
	  traverse(node.value, path, state);
	  path.shift();
	  return false;
	}

	visitObjectConciseMethod.test = function(node, path, state) {
	  return node.type === Syntax.Property &&
	    node.value.type === Syntax.FunctionExpression &&
	    node.method === true;
	};

	exports.visitorList = [
	  visitObjectConciseMethod
	];


/***/ },
/* 223 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*jslint node: true*/

	/**
	 * Desugars ES6 Object Literal short notations into ES3 full notation.
	 *
	 * // Easier return values.
	 * function foo(x, y) {
	 *   return {x, y}; // {x: x, y: y}
	 * };
	 *
	 * // Destructuring.
	 * function init({port, ip, coords: {x, y}}) { ... }
	 *
	 */
	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);

	/**
	 * @public
	 */
	function visitObjectLiteralShortNotation(traverse, node, path, state) {
	  utils.catchup(node.key.range[1], state);
	  utils.append(':' + node.key.name, state);
	  return false;
	}

	visitObjectLiteralShortNotation.test = function(node, path, state) {
	  return node.type === Syntax.Property &&
	    node.kind === 'init' &&
	    node.shorthand === true &&
	    path[0].type !== Syntax.ObjectPattern;
	};

	exports.visitorList = [
	  visitObjectLiteralShortNotation
	];



/***/ },
/* 224 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*jslint node:true*/

	/**
	 * Desugars ES6 rest parameters into an ES3 arguments array.
	 *
	 * function printf(template, ...args) {
	 *   args.forEach(...);
	 * }
	 *
	 * We could use `Array.prototype.slice.call`, but that usage of arguments causes
	 * functions to be deoptimized in V8, so instead we use a for-loop.
	 *
	 * function printf(template) {
	 *   for (var args = [], $__0 = 1, $__1 = arguments.length; $__0 < $__1; $__0++)
	 *     args.push(arguments[$__0]);
	 *   args.forEach(...);
	 * }
	 *
	 */
	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);



	function _nodeIsFunctionWithRestParam(node) {
	  return (node.type === Syntax.FunctionDeclaration
	          || node.type === Syntax.FunctionExpression
	          || node.type === Syntax.ArrowFunctionExpression)
	         && node.rest;
	}

	function visitFunctionParamsWithRestParam(traverse, node, path, state) {
	  if (node.parametricType) {
	    utils.catchup(node.parametricType.range[0], state);
	    path.unshift(node);
	    traverse(node.parametricType, path, state);
	    path.shift();
	  }

	  // Render params.
	  if (node.params.length) {
	    path.unshift(node);
	    traverse(node.params, path, state);
	    path.shift();
	  } else {
	    // -3 is for ... of the rest.
	    utils.catchup(node.rest.range[0] - 3, state);
	  }
	  utils.catchupWhiteSpace(node.rest.range[1], state);

	  path.unshift(node);
	  traverse(node.body, path, state);
	  path.shift();

	  return false;
	}

	visitFunctionParamsWithRestParam.test = function(node, path, state) {
	  return _nodeIsFunctionWithRestParam(node);
	};

	function renderRestParamSetup(functionNode, state) {
	  var idx = state.localScope.tempVarIndex++;
	  var len = state.localScope.tempVarIndex++;

	  return 'for (var ' + functionNode.rest.name + '=[],' +
	    utils.getTempVar(idx) + '=' + functionNode.params.length + ',' +
	    utils.getTempVar(len) + '=arguments.length;' +
	    utils.getTempVar(idx) + '<' +  utils.getTempVar(len) + ';' +
	    utils.getTempVar(idx) + '++) ' +
	    functionNode.rest.name + '.push(arguments[' + utils.getTempVar(idx) + ']);';
	}

	function visitFunctionBodyWithRestParam(traverse, node, path, state) {
	  utils.catchup(node.range[0] + 1, state);
	  var parentNode = path[0];
	  utils.append(renderRestParamSetup(parentNode, state), state);
	  return true;
	}

	visitFunctionBodyWithRestParam.test = function(node, path, state) {
	  return node.type === Syntax.BlockStatement
	         && _nodeIsFunctionWithRestParam(path[0]);
	};

	exports.renderRestParamSetup = renderRestParamSetup;
	exports.visitorList = [
	  visitFunctionParamsWithRestParam,
	  visitFunctionBodyWithRestParam
	];


/***/ },
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*jslint node:true*/

	/**
	 * @typechecks
	 */
	'use strict';

	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);

	/**
	 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-12.1.9
	 */
	function visitTemplateLiteral(traverse, node, path, state) {
	  var templateElements = node.quasis;

	  utils.append('(', state);
	  for (var ii = 0; ii < templateElements.length; ii++) {
	    var templateElement = templateElements[ii];
	    if (templateElement.value.raw !== '') {
	      utils.append(getCookedValue(templateElement), state);
	      if (!templateElement.tail) {
	        // + between element and substitution
	        utils.append(' + ', state);
	      }
	      // maintain line numbers
	      utils.move(templateElement.range[0], state);
	      utils.catchupNewlines(templateElement.range[1], state);
	    } else {  // templateElement.value.raw === ''
	      // Concatenat adjacent substitutions, e.g. `${x}${y}`. Empty templates
	      // appear before the first and after the last element - nothing to add in
	      // those cases.
	      if (ii > 0 && !templateElement.tail) {
	        // + between substitution and substitution
	        utils.append(' + ', state);
	      }
	    }

	    utils.move(templateElement.range[1], state);
	    if (!templateElement.tail) {
	      var substitution = node.expressions[ii];
	      if (substitution.type === Syntax.Identifier ||
	          substitution.type === Syntax.MemberExpression ||
	          substitution.type === Syntax.CallExpression) {
	        utils.catchup(substitution.range[1], state);
	      } else {
	        utils.append('(', state);
	        traverse(substitution, path, state);
	        utils.catchup(substitution.range[1], state);
	        utils.append(')', state);
	      }
	      // if next templateElement isn't empty...
	      if (templateElements[ii + 1].value.cooked !== '') {
	        utils.append(' + ', state);
	      }
	    }
	  }
	  utils.move(node.range[1], state);
	  utils.append(')', state);
	  return false;
	}

	visitTemplateLiteral.test = function(node, path, state) {
	  return node.type === Syntax.TemplateLiteral;
	};

	/**
	 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-12.2.6
	 */
	function visitTaggedTemplateExpression(traverse, node, path, state) {
	  var template = node.quasi;
	  var numQuasis = template.quasis.length;

	  // print the tag
	  utils.move(node.tag.range[0], state);
	  traverse(node.tag, path, state);
	  utils.catchup(node.tag.range[1], state);

	  // print array of template elements
	  utils.append('(function() { var siteObj = [', state);
	  for (var ii = 0; ii < numQuasis; ii++) {
	    utils.append(getCookedValue(template.quasis[ii]), state);
	    if (ii !== numQuasis - 1) {
	      utils.append(', ', state);
	    }
	  }
	  utils.append(']; siteObj.raw = [', state);
	  for (ii = 0; ii < numQuasis; ii++) {
	    utils.append(getRawValue(template.quasis[ii]), state);
	    if (ii !== numQuasis - 1) {
	      utils.append(', ', state);
	    }
	  }
	  utils.append(
	    ']; Object.freeze(siteObj.raw); Object.freeze(siteObj); return siteObj; }()',
	    state
	  );

	  // print substitutions
	  if (numQuasis > 1) {
	    for (ii = 0; ii < template.expressions.length; ii++) {
	      var expression = template.expressions[ii];
	      utils.append(', ', state);

	      // maintain line numbers by calling catchupWhiteSpace over the whole
	      // previous TemplateElement
	      utils.move(template.quasis[ii].range[0], state);
	      utils.catchupNewlines(template.quasis[ii].range[1], state);

	      utils.move(expression.range[0], state);
	      traverse(expression, path, state);
	      utils.catchup(expression.range[1], state);
	    }
	  }

	  // print blank lines to push the closing ) down to account for the final
	  // TemplateElement.
	  utils.catchupNewlines(node.range[1], state);

	  utils.append(')', state);

	  return false;
	}

	visitTaggedTemplateExpression.test = function(node, path, state) {
	  return node.type === Syntax.TaggedTemplateExpression;
	};

	function getCookedValue(templateElement) {
	  return JSON.stringify(templateElement.value.cooked);
	}

	function getRawValue(templateElement) {
	  return JSON.stringify(templateElement.value.raw);
	}

	exports.visitorList = [
	  visitTemplateLiteral,
	  visitTaggedTemplateExpression
	];


/***/ },
/* 226 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2004-present Facebook. All Rights Reserved.
	 */
	/*global exports:true*/

	/**
	 * Implements ES6 call spread.
	 *
	 * instance.method(a, b, c, ...d)
	 *
	 * instance.method.apply(instance, [a, b, c].concat(d))
	 *
	 */

	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);

	function process(traverse, node, path, state) {
	  utils.move(node.range[0], state);
	  traverse(node, path, state);
	  utils.catchup(node.range[1], state);
	}

	function visitCallSpread(traverse, node, path, state) {
	  utils.catchup(node.range[0], state);

	  if (node.type === Syntax.NewExpression) {
	    // Input  = new Set(1, 2, ...list)
	    // Output = new (Function.prototype.bind.apply(Set, [null, 1, 2].concat(list)))
	    utils.append('new (Function.prototype.bind.apply(', state);
	    process(traverse, node.callee, path, state);
	  } else if (node.callee.type === Syntax.MemberExpression) {
	    // Input  = get().fn(1, 2, ...more)
	    // Output = (_ = get()).fn.apply(_, [1, 2].apply(more))
	    var tempVar = utils.injectTempVar(state);
	    utils.append('(' + tempVar + ' = ', state);
	    process(traverse, node.callee.object, path, state);
	    utils.append(')', state);
	    if (node.callee.property.type === Syntax.Identifier) {
	      utils.append('.', state);
	      process(traverse, node.callee.property, path, state);
	    } else {
	      utils.append('[', state);
	      process(traverse, node.callee.property, path, state);
	      utils.append(']', state);
	    }
	    utils.append('.apply(' + tempVar, state);
	  } else {
	    // Input  = max(1, 2, ...list)
	    // Output = max.apply(null, [1, 2].concat(list))
	    var needsToBeWrappedInParenthesis =
	      node.callee.type === Syntax.FunctionDeclaration ||
	      node.callee.type === Syntax.FunctionExpression;
	    if (needsToBeWrappedInParenthesis) {
	      utils.append('(', state);
	    }
	    process(traverse, node.callee, path, state);
	    if (needsToBeWrappedInParenthesis) {
	      utils.append(')', state);
	    }
	    utils.append('.apply(null', state);
	  }
	  utils.append(', ', state);

	  var args = node.arguments.slice();
	  var spread = args.pop();
	  if (args.length || node.type === Syntax.NewExpression) {
	    utils.append('[', state);
	    if (node.type === Syntax.NewExpression) {
	      utils.append('null' + (args.length ? ', ' : ''), state);
	    }
	    while (args.length) {
	      var arg = args.shift();
	      utils.move(arg.range[0], state);
	      traverse(arg, path, state);
	      if (args.length) {
	        utils.catchup(args[0].range[0], state);
	      } else {
	        utils.catchup(arg.range[1], state);
	      }
	    }
	    utils.append('].concat(', state);
	    process(traverse, spread.argument, path, state);
	    utils.append(')', state);
	  } else {
	    process(traverse, spread.argument, path, state);
	  }
	  utils.append(node.type === Syntax.NewExpression ? '))' : ')', state);

	  utils.move(node.range[1], state);
	  return false;
	}

	visitCallSpread.test = function(node, path, state) {
	  return (
	    (
	      node.type === Syntax.CallExpression ||
	      node.type === Syntax.NewExpression
	    ) &&
	    node.arguments.length > 0 &&
	    node.arguments[node.arguments.length - 1].type === Syntax.SpreadElement
	  );
	};

	exports.visitorList = [
	  visitCallSpread,
	];


/***/ },
/* 227 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2004-present Facebook. All Rights Reserved.
	 */
	/*global exports:true*/

	/**
	 * Implements ES7 object spread property.
	 * https://gist.github.com/sebmarkbage/aa849c7973cb4452c547
	 *
	 * { ...a, x: 1 }
	 *
	 * Object.assign({}, a, {x: 1 })
	 *
	 */

	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);

	function visitObjectLiteralSpread(traverse, node, path, state) {
	  utils.catchup(node.range[0], state);

	  utils.append('Object.assign({', state);

	  // Skip the original {
	  utils.move(node.range[0] + 1, state);

	  var previousWasSpread = false;

	  for (var i = 0; i < node.properties.length; i++) {
	    var property = node.properties[i];
	    if (property.type === Syntax.SpreadProperty) {

	      // Close the previous object or initial object
	      if (!previousWasSpread) {
	        utils.append('}', state);
	      }

	      if (i === 0) {
	        // Normally there will be a comma when we catch up, but not before
	        // the first property.
	        utils.append(',', state);
	      }

	      utils.catchup(property.range[0], state);

	      // skip ...
	      utils.move(property.range[0] + 3, state);

	      traverse(property.argument, path, state);

	      utils.catchup(property.range[1], state);

	      previousWasSpread = true;

	    } else {

	      utils.catchup(property.range[0], state);

	      if (previousWasSpread) {
	        utils.append('{', state);
	      }

	      traverse(property, path, state);

	      utils.catchup(property.range[1], state);

	      previousWasSpread = false;

	    }
	  }

	  // Strip any non-whitespace between the last item and the end.
	  // We only catch up on whitespace so that we ignore any trailing commas which
	  // are stripped out for IE8 support. Unfortunately, this also strips out any
	  // trailing comments.
	  utils.catchupWhiteSpace(node.range[1] - 1, state);

	  // Skip the trailing }
	  utils.move(node.range[1], state);

	  if (!previousWasSpread) {
	    utils.append('}', state);
	  }

	  utils.append(')', state);
	  return false;
	}

	visitObjectLiteralSpread.test = function(node, path, state) {
	  if (node.type !== Syntax.ObjectExpression) {
	    return false;
	  }
	  // Tight loop optimization
	  var hasAtLeastOneSpreadProperty = false;
	  for (var i = 0; i < node.properties.length; i++) {
	    var property = node.properties[i];
	    if (property.type === Syntax.SpreadProperty) {
	      hasAtLeastOneSpreadProperty = true;
	    } else if (property.kind !== 'init') {
	      return false;
	    }
	  }
	  return hasAtLeastOneSpreadProperty;
	};

	exports.visitorList = [
	  visitObjectLiteralSpread
	];


/***/ },
/* 228 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	/*global exports:true*/
	'use strict';

	var Syntax = __webpack_require__(218).Syntax;
	var utils = __webpack_require__(232);

	var renderJSXExpressionContainer =
	  __webpack_require__(260).renderJSXExpressionContainer;
	var renderJSXLiteral = __webpack_require__(260).renderJSXLiteral;
	var quoteAttrName = __webpack_require__(260).quoteAttrName;

	var trimLeft = __webpack_require__(260).trimLeft;

	/**
	 * Customized desugar processor for React JSX. Currently:
	 *
	 * <X> </X> => React.createElement(X, null)
	 * <X prop="1" /> => React.createElement(X, {prop: '1'}, null)
	 * <X prop="2"><Y /></X> => React.createElement(X, {prop:'2'},
	 *   React.createElement(Y, null)
	 * )
	 * <div /> => React.createElement("div", null)
	 */

	/**
	 * Removes all non-whitespace/parenthesis characters
	 */
	var reNonWhiteParen = /([^\s\(\)])/g;
	function stripNonWhiteParen(value) {
	  return value.replace(reNonWhiteParen, '');
	}

	var tagConvention = /^[a-z]|\-/;
	function isTagName(name) {
	  return tagConvention.test(name);
	}

	function visitReactTag(traverse, object, path, state) {
	  var openingElement = object.openingElement;
	  var nameObject = openingElement.name;
	  var attributesObject = openingElement.attributes;

	  utils.catchup(openingElement.range[0], state, trimLeft);

	  if (nameObject.type === Syntax.JSXNamespacedName && nameObject.namespace) {
	    throw new Error('Namespace tags are not supported. ReactJSX is not XML.');
	  }

	  // We assume that the React runtime is already in scope
	  utils.append('React.createElement(', state);

	  if (nameObject.type === Syntax.JSXIdentifier && isTagName(nameObject.name)) {
	    utils.append('"' + nameObject.name + '"', state);
	    utils.move(nameObject.range[1], state);
	  } else {
	    // Use utils.catchup in this case so we can easily handle
	    // JSXMemberExpressions which look like Foo.Bar.Baz. This also handles
	    // JSXIdentifiers that aren't fallback tags.
	    utils.move(nameObject.range[0], state);
	    utils.catchup(nameObject.range[1], state);
	  }

	  utils.append(', ', state);

	  var hasAttributes = attributesObject.length;

	  var hasAtLeastOneSpreadProperty = attributesObject.some(function(attr) {
	    return attr.type === Syntax.JSXSpreadAttribute;
	  });

	  // if we don't have any attributes, pass in null
	  if (hasAtLeastOneSpreadProperty) {
	    utils.append('React.__spread({', state);
	  } else if (hasAttributes) {
	    utils.append('{', state);
	  } else {
	    utils.append('null', state);
	  }

	  // keep track of if the previous attribute was a spread attribute
	  var previousWasSpread = false;

	  // write attributes
	  attributesObject.forEach(function(attr, index) {
	    var isLast = index === attributesObject.length - 1;

	    if (attr.type === Syntax.JSXSpreadAttribute) {
	      // Close the previous object or initial object
	      if (!previousWasSpread) {
	        utils.append('}, ', state);
	      }

	      // Move to the expression start, ignoring everything except parenthesis
	      // and whitespace.
	      utils.catchup(attr.range[0], state, stripNonWhiteParen);
	      // Plus 1 to skip `{`.
	      utils.move(attr.range[0] + 1, state);
	      utils.catchup(attr.argument.range[0], state, stripNonWhiteParen);

	      traverse(attr.argument, path, state);

	      utils.catchup(attr.argument.range[1], state);

	      // Move to the end, ignoring parenthesis and the closing `}`
	      utils.catchup(attr.range[1] - 1, state, stripNonWhiteParen);

	      if (!isLast) {
	        utils.append(', ', state);
	      }

	      utils.move(attr.range[1], state);

	      previousWasSpread = true;

	      return;
	    }

	    // If the next attribute is a spread, we're effective last in this object
	    if (!isLast) {
	      isLast = attributesObject[index + 1].type === Syntax.JSXSpreadAttribute;
	    }

	    if (attr.name.namespace) {
	      throw new Error(
	         'Namespace attributes are not supported. ReactJSX is not XML.');
	    }
	    var name = attr.name.name;

	    utils.catchup(attr.range[0], state, trimLeft);

	    if (previousWasSpread) {
	      utils.append('{', state);
	    }

	    utils.append(quoteAttrName(name), state);
	    utils.append(': ', state);

	    if (!attr.value) {
	      state.g.buffer += 'true';
	      state.g.position = attr.name.range[1];
	      if (!isLast) {
	        utils.append(', ', state);
	      }
	    } else {
	      utils.move(attr.name.range[1], state);
	      // Use catchupNewlines to skip over the '=' in the attribute
	      utils.catchupNewlines(attr.value.range[0], state);
	      if (attr.value.type === Syntax.Literal) {
	        renderJSXLiteral(attr.value, isLast, state);
	      } else {
	        renderJSXExpressionContainer(traverse, attr.value, isLast, path, state);
	      }
	    }

	    utils.catchup(attr.range[1], state, trimLeft);

	    previousWasSpread = false;

	  });

	  if (!openingElement.selfClosing) {
	    utils.catchup(openingElement.range[1] - 1, state, trimLeft);
	    utils.move(openingElement.range[1], state);
	  }

	  if (hasAttributes && !previousWasSpread) {
	    utils.append('}', state);
	  }

	  if (hasAtLeastOneSpreadProperty) {
	    utils.append(')', state);
	  }

	  // filter out whitespace
	  var childrenToRender = object.children.filter(function(child) {
	    return !(child.type === Syntax.Literal
	             && typeof child.value === 'string'
	             && child.value.match(/^[ \t]*[\r\n][ \t\r\n]*$/));
	  });
	  if (childrenToRender.length > 0) {
	    var lastRenderableIndex;

	    childrenToRender.forEach(function(child, index) {
	      if (child.type !== Syntax.JSXExpressionContainer ||
	          child.expression.type !== Syntax.JSXEmptyExpression) {
	        lastRenderableIndex = index;
	      }
	    });

	    if (lastRenderableIndex !== undefined) {
	      utils.append(', ', state);
	    }

	    childrenToRender.forEach(function(child, index) {
	      utils.catchup(child.range[0], state, trimLeft);

	      var isLast = index >= lastRenderableIndex;

	      if (child.type === Syntax.Literal) {
	        renderJSXLiteral(child, isLast, state);
	      } else if (child.type === Syntax.JSXExpressionContainer) {
	        renderJSXExpressionContainer(traverse, child, isLast, path, state);
	      } else {
	        traverse(child, path, state);
	        if (!isLast) {
	          utils.append(', ', state);
	        }
	      }

	      utils.catchup(child.range[1], state, trimLeft);
	    });
	  }

	  if (openingElement.selfClosing) {
	    // everything up to />
	    utils.catchup(openingElement.range[1] - 2, state, trimLeft);
	    utils.move(openingElement.range[1], state);
	  } else {
	    // everything up to </ sdflksjfd>
	    utils.catchup(object.closingElement.range[0], state, trimLeft);
	    utils.move(object.closingElement.range[1], state);
	  }

	  utils.append(')', state);
	  return false;
	}

	visitReactTag.test = function(object, path, state) {
	  return object.type === Syntax.JSXElement;
	};

	exports.visitorList = [
	  visitReactTag
	];


/***/ },
/* 229 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	/*global exports:true*/
	'use strict';

	var Syntax = __webpack_require__(218).Syntax;
	var utils = __webpack_require__(232);

	function addDisplayName(displayName, object, state) {
	  if (object &&
	      object.type === Syntax.CallExpression &&
	      object.callee.type === Syntax.MemberExpression &&
	      object.callee.object.type === Syntax.Identifier &&
	      object.callee.object.name === 'React' &&
	      object.callee.property.type === Syntax.Identifier &&
	      object.callee.property.name === 'createClass' &&
	      object.arguments.length === 1 &&
	      object.arguments[0].type === Syntax.ObjectExpression) {
	    // Verify that the displayName property isn't already set
	    var properties = object.arguments[0].properties;
	    var safe = properties.every(function(property) {
	      var value = property.key.type === Syntax.Identifier ?
	        property.key.name :
	        property.key.value;
	      return value !== 'displayName';
	    });

	    if (safe) {
	      utils.catchup(object.arguments[0].range[0] + 1, state);
	      utils.append('displayName: "' + displayName + '",', state);
	    }
	  }
	}

	/**
	 * Transforms the following:
	 *
	 * var MyComponent = React.createClass({
	 *    render: ...
	 * });
	 *
	 * into:
	 *
	 * var MyComponent = React.createClass({
	 *    displayName: 'MyComponent',
	 *    render: ...
	 * });
	 *
	 * Also catches:
	 *
	 * MyComponent = React.createClass(...);
	 * exports.MyComponent = React.createClass(...);
	 * module.exports = {MyComponent: React.createClass(...)};
	 */
	function visitReactDisplayName(traverse, object, path, state) {
	  var left, right;

	  if (object.type === Syntax.AssignmentExpression) {
	    left = object.left;
	    right = object.right;
	  } else if (object.type === Syntax.Property) {
	    left = object.key;
	    right = object.value;
	  } else if (object.type === Syntax.VariableDeclarator) {
	    left = object.id;
	    right = object.init;
	  }

	  if (left && left.type === Syntax.MemberExpression) {
	    left = left.property;
	  }
	  if (left && left.type === Syntax.Identifier) {
	    addDisplayName(left.name, right, state);
	  }
	}

	visitReactDisplayName.test = function(object, path, state) {
	  return (
	    object.type === Syntax.AssignmentExpression ||
	    object.type === Syntax.Property ||
	    object.type === Syntax.VariableDeclarator
	  );
	};

	exports.visitorList = [
	  visitReactDisplayName
	];


/***/ },
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2014 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */
	/*global exports:true*/

	var Syntax = __webpack_require__(262).Syntax;
	var utils = __webpack_require__(232);
	var reserverdWordsHelper = __webpack_require__(258);

	/**
	 * Code adapted from https://github.com/spicyj/es3ify
	 * The MIT License (MIT)
	 * Copyright (c) 2014 Ben Alpert
	 */

	function visitProperty(traverse, node, path, state) {
	  utils.catchup(node.key.range[0], state);
	  utils.append('"', state);
	  utils.catchup(node.key.range[1], state);
	  utils.append('"', state);
	  utils.catchup(node.value.range[0], state);
	  traverse(node.value, path, state);
	  return false;
	}

	visitProperty.test = function(node) {
	  return node.type === Syntax.Property &&
	    node.key.type === Syntax.Identifier &&
	    !node.method &&
	    !node.shorthand &&
	    !node.computed &&
	    reserverdWordsHelper.isES3ReservedWord(node.key.name);
	};

	function visitMemberExpression(traverse, node, path, state) {
	  traverse(node.object, path, state);
	  utils.catchup(node.property.range[0] - 1, state);
	  utils.append('[', state);
	  utils.catchupWhiteSpace(node.property.range[0], state);
	  utils.append('"', state);
	  utils.catchup(node.property.range[1], state);
	  utils.append('"]', state);
	  return false;
	}

	visitMemberExpression.test = function(node) {
	  return node.type === Syntax.MemberExpression &&
	    node.property.type === Syntax.Identifier &&
	    reserverdWordsHelper.isES3ReservedWord(node.property.name);
	};

	exports.visitorList = [
	  visitProperty,
	  visitMemberExpression
	];


/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */

	var base64 = __webpack_require__(271)
	var ieee754 = __webpack_require__(269)
	var isArray = __webpack_require__(270)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var kMaxLength = 0x3fffffff
	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Note:
	 *
	 * - Implementation must support adding new properties to `Uint8Array` instances.
	 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
	 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *    incorrect length in some situations.
	 *
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
	 * get the Object implementation, which is slower but will work correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = (function () {
	  try {
	    var buf = new ArrayBuffer(0)
	    var arr = new Uint8Array(buf)
	    arr.foo = function () { return 42 }
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	})()

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (subject, encoding) {
	  var self = this
	  if (!(self instanceof Buffer)) return new Buffer(subject, encoding)

	  var type = typeof subject
	  var length

	  if (type === 'number') {
	    length = +subject
	  } else if (type === 'string') {
	    length = Buffer.byteLength(subject, encoding)
	  } else if (type === 'object' && subject !== null) {
	    // assume object is array-like
	    if (subject.type === 'Buffer' && isArray(subject.data)) subject = subject.data
	    length = +subject.length
	  } else {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (length > kMaxLength) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum size: 0x' +
	      kMaxLength.toString(16) + ' bytes')
	  }

	  if (length < 0) length = 0
	  else length >>>= 0 // coerce to uint32

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Preferred: Return an augmented `Uint8Array` instance for best performance
	    self = Buffer._augment(new Uint8Array(length)) // eslint-disable-line consistent-this
	  } else {
	    // Fallback: Return THIS instance of Buffer (created by `new`)
	    self.length = length
	    self._isBuffer = true
	  }

	  var i
	  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
	    // Speed optimization -- use set if we're copying from a typed array
	    self._set(subject)
	  } else if (isArrayish(subject)) {
	    // Treat array-ish objects as a byte array
	    if (Buffer.isBuffer(subject)) {
	      for (i = 0; i < length; i++) {
	        self[i] = subject.readUInt8(i)
	      }
	    } else {
	      for (i = 0; i < length; i++) {
	        self[i] = ((subject[i] % 256) + 256) % 256
	      }
	    }
	  } else if (type === 'string') {
	    self.write(subject, 0, encoding)
	  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT) {
	    for (i = 0; i < length; i++) {
	      self[i] = 0
	    }
	  }

	  if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent

	  return self
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length
	  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, totalLength) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  } else if (list.length === 1) {
	    return list[0]
	  }

	  var i
	  if (totalLength === undefined) {
	    totalLength = 0
	    for (i = 0; i < list.length; i++) {
	      totalLength += list[i].length
	    }
	  }

	  var buf = new Buffer(totalLength)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	Buffer.byteLength = function byteLength (str, encoding) {
	  var ret
	  str = str + ''
	  switch (encoding || 'utf8') {
	    case 'ascii':
	    case 'binary':
	    case 'raw':
	      ret = str.length
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = str.length * 2
	      break
	    case 'hex':
	      ret = str.length >>> 1
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8ToBytes(str).length
	      break
	    case 'base64':
	      ret = base64ToBytes(str).length
	      break
	    default:
	      ret = str.length
	  }
	  return ret
	}

	// pre-set for values that may exist in the future
	Buffer.prototype.length = undefined
	Buffer.prototype.parent = undefined

	// toString(encoding, start=0, end=buffer.length)
	Buffer.prototype.toString = function toString (encoding, start, end) {
	  var loweredCase = false

	  start = start >>> 0
	  end = end === undefined || end === Infinity ? this.length : end >>> 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` will be removed in Node 0.13+
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` will be removed in Node 0.13+
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	  return charsWritten
	}

	function asciiWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
	  return charsWritten
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
	  return charsWritten
	}

	function utf16leWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	  return charsWritten
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Support both (string, offset, length, encoding)
	  // and the legacy (string, encoding, offset, length)
	  if (isFinite(offset)) {
	    if (!isFinite(length)) {
	      encoding = length
	      length = undefined
	    }
	  } else {  // legacy
	    var swap = encoding
	    encoding = offset
	    offset = length
	    length = swap
	  }

	  offset = Number(offset) || 0

	  if (length < 0 || offset < 0 || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  var remaining = this.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	  encoding = String(encoding || 'utf8').toLowerCase()

	  var ret
	  switch (encoding) {
	    case 'hex':
	      ret = hexWrite(this, string, offset, length)
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8Write(this, string, offset, length)
	      break
	    case 'ascii':
	      ret = asciiWrite(this, string, offset, length)
	      break
	    case 'binary':
	      ret = binaryWrite(this, string, offset, length)
	      break
	    case 'base64':
	      ret = base64Write(this, string, offset, length)
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = utf16leWrite(this, string, offset, length)
	      break
	    default:
	      throw new TypeError('Unknown encoding: ' + encoding)
	  }
	  return ret
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  var res = ''
	  var tmp = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    if (buf[i] <= 0x7F) {
	      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
	      tmp = ''
	    } else {
	      tmp += '%' + buf[i].toString(16)
	    }
	  }

	  return res + decodeUtf8Char(tmp)
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) >>> 0 & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) >>> 0 & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = value
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = value
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) {
	    checkInt(
	      this, value, offset, byteLength,
	      Math.pow(2, 8 * byteLength - 1) - 1,
	      -Math.pow(2, 8 * byteLength - 1)
	    )
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) {
	    checkInt(
	      this, value, offset, byteLength,
	      Math.pow(2, 8 * byteLength - 1) - 1,
	      -Math.pow(2, 8 * byteLength - 1)
	    )
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = value
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, target_start, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (target_start >= target.length) target_start = target.length
	  if (!target_start) target_start = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (target_start < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - target_start < end - start) {
	    end = target.length - target_start + start
	  }

	  var len = end - start

	  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < len; i++) {
	      target[i + target_start] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), target_start)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated, will be removed in node 0.13+
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function isArrayish (subject) {
	  return isArray(subject) || Buffer.isBuffer(subject) ||
	      subject && typeof subject === 'object' &&
	      typeof subject.length === 'number'
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	  var i = 0

	  for (; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (leadSurrogate) {
	        // 2 leads in a row
	        if (codePoint < 0xDC00) {
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          leadSurrogate = codePoint
	          continue
	        } else {
	          // valid surrogate pair
	          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
	          leadSurrogate = null
	        }
	      } else {
	        // no lead yet

	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else {
	          // valid lead
	          leadSurrogate = codePoint
	          continue
	        }
	      }
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	      leadSurrogate = null
	    }

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x200000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function decodeUtf8Char (str) {
	  try {
	    return decodeURIComponent(str)
	  } catch (err) {
	    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(231).Buffer))

/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	/*jslint node: true*/
	var Syntax = __webpack_require__(262).Syntax;
	var leadingIndentRegexp = /(^|\n)( {2}|\t)/g;
	var nonWhiteRegexp = /(\S)/g;

	/**
	 * A `state` object represents the state of the parser. It has "local" and
	 * "global" parts. Global contains parser position, source, etc. Local contains
	 * scope based properties like current class name. State should contain all the
	 * info required for transformation. It's the only mandatory object that is
	 * being passed to every function in transform chain.
	 *
	 * @param  {string} source
	 * @param  {object} transformOptions
	 * @return {object}
	 */
	function createState(source, rootNode, transformOptions) {
	  return {
	    /**
	     * A tree representing the current local scope (and its lexical scope chain)
	     * Useful for tracking identifiers from parent scopes, etc.
	     * @type {Object}
	     */
	    localScope: {
	      parentNode: rootNode,
	      parentScope: null,
	      identifiers: {},
	      tempVarIndex: 0,
	      tempVars: []
	    },
	    /**
	     * The name (and, if applicable, expression) of the super class
	     * @type {Object}
	     */
	    superClass: null,
	    /**
	     * The namespace to use when munging identifiers
	     * @type {String}
	     */
	    mungeNamespace: '',
	    /**
	     * Ref to the node for the current MethodDefinition
	     * @type {Object}
	     */
	    methodNode: null,
	    /**
	     * Ref to the node for the FunctionExpression of the enclosing
	     * MethodDefinition
	     * @type {Object}
	     */
	    methodFuncNode: null,
	    /**
	     * Name of the enclosing class
	     * @type {String}
	     */
	    className: null,
	    /**
	     * Whether we're currently within a `strict` scope
	     * @type {Bool}
	     */
	    scopeIsStrict: null,
	    /**
	     * Indentation offset
	     * @type {Number}
	     */
	    indentBy: 0,
	    /**
	     * Global state (not affected by updateState)
	     * @type {Object}
	     */
	    g: {
	      /**
	       * A set of general options that transformations can consider while doing
	       * a transformation:
	       *
	       * - minify
	       *   Specifies that transformation steps should do their best to minify
	       *   the output source when possible. This is useful for places where
	       *   minification optimizations are possible with higher-level context
	       *   info than what jsxmin can provide.
	       *
	       *   For example, the ES6 class transform will minify munged private
	       *   variables if this flag is set.
	       */
	      opts: transformOptions,
	      /**
	       * Current position in the source code
	       * @type {Number}
	       */
	      position: 0,
	      /**
	       * Auxiliary data to be returned by transforms
	       * @type {Object}
	       */
	      extra: {},
	      /**
	       * Buffer containing the result
	       * @type {String}
	       */
	      buffer: '',
	      /**
	       * Source that is being transformed
	       * @type {String}
	       */
	      source: source,

	      /**
	       * Cached parsed docblock (see getDocblock)
	       * @type {object}
	       */
	      docblock: null,

	      /**
	       * Whether the thing was used
	       * @type {Boolean}
	       */
	      tagNamespaceUsed: false,

	      /**
	       * If using bolt xjs transformation
	       * @type {Boolean}
	       */
	      isBolt: undefined,

	      /**
	       * Whether to record source map (expensive) or not
	       * @type {SourceMapGenerator|null}
	       */
	      sourceMap: null,

	      /**
	       * Filename of the file being processed. Will be returned as a source
	       * attribute in the source map
	       */
	      sourceMapFilename: 'source.js',

	      /**
	       * Only when source map is used: last line in the source for which
	       * source map was generated
	       * @type {Number}
	       */
	      sourceLine: 1,

	      /**
	       * Only when source map is used: last line in the buffer for which
	       * source map was generated
	       * @type {Number}
	       */
	      bufferLine: 1,

	      /**
	       * The top-level Program AST for the original file.
	       */
	      originalProgramAST: null,

	      sourceColumn: 0,
	      bufferColumn: 0
	    }
	  };
	}

	/**
	 * Updates a copy of a given state with "update" and returns an updated state.
	 *
	 * @param  {object} state
	 * @param  {object} update
	 * @return {object}
	 */
	function updateState(state, update) {
	  var ret = Object.create(state);
	  Object.keys(update).forEach(function(updatedKey) {
	    ret[updatedKey] = update[updatedKey];
	  });
	  return ret;
	}

	/**
	 * Given a state fill the resulting buffer from the original source up to
	 * the end
	 *
	 * @param {number} end
	 * @param {object} state
	 * @param {?function} contentTransformer Optional callback to transform newly
	 *                                       added content.
	 */
	function catchup(end, state, contentTransformer) {
	  if (end < state.g.position) {
	    // cannot move backwards
	    return;
	  }
	  var source = state.g.source.substring(state.g.position, end);
	  var transformed = updateIndent(source, state);
	  if (state.g.sourceMap && transformed) {
	    // record where we are
	    state.g.sourceMap.addMapping({
	      generated: { line: state.g.bufferLine, column: state.g.bufferColumn },
	      original: { line: state.g.sourceLine, column: state.g.sourceColumn },
	      source: state.g.sourceMapFilename
	    });

	    // record line breaks in transformed source
	    var sourceLines = source.split('\n');
	    var transformedLines = transformed.split('\n');
	    // Add line break mappings between last known mapping and the end of the
	    // added piece. So for the code piece
	    //  (foo, bar);
	    // > var x = 2;
	    // > var b = 3;
	    //   var c =
	    // only add lines marked with ">": 2, 3.
	    for (var i = 1; i < sourceLines.length - 1; i++) {
	      state.g.sourceMap.addMapping({
	        generated: { line: state.g.bufferLine, column: 0 },
	        original: { line: state.g.sourceLine, column: 0 },
	        source: state.g.sourceMapFilename
	      });
	      state.g.sourceLine++;
	      state.g.bufferLine++;
	    }
	    // offset for the last piece
	    if (sourceLines.length > 1) {
	      state.g.sourceLine++;
	      state.g.bufferLine++;
	      state.g.sourceColumn = 0;
	      state.g.bufferColumn = 0;
	    }
	    state.g.sourceColumn += sourceLines[sourceLines.length - 1].length;
	    state.g.bufferColumn +=
	      transformedLines[transformedLines.length - 1].length;
	  }
	  state.g.buffer +=
	    contentTransformer ? contentTransformer(transformed) : transformed;
	  state.g.position = end;
	}

	/**
	 * Returns original source for an AST node.
	 * @param {object} node
	 * @param {object} state
	 * @return {string}
	 */
	function getNodeSourceText(node, state) {
	  return state.g.source.substring(node.range[0], node.range[1]);
	}

	function _replaceNonWhite(value) {
	  return value.replace(nonWhiteRegexp, ' ');
	}

	/**
	 * Removes all non-whitespace characters
	 */
	function _stripNonWhite(value) {
	  return value.replace(nonWhiteRegexp, '');
	}

	/**
	 * Finds the position of the next instance of the specified syntactic char in
	 * the pending source.
	 *
	 * NOTE: This will skip instances of the specified char if they sit inside a
	 *       comment body.
	 *
	 * NOTE: This function also assumes that the buffer's current position is not
	 *       already within a comment or a string. This is rarely the case since all
	 *       of the buffer-advancement utility methods tend to be used on syntactic
	 *       nodes' range values -- but it's a small gotcha that's worth mentioning.
	 */
	function getNextSyntacticCharOffset(char, state) {
	  var pendingSource = state.g.source.substring(state.g.position);
	  var pendingSourceLines = pendingSource.split('\n');

	  var charOffset = 0;
	  var line;
	  var withinBlockComment = false;
	  var withinString = false;
	  lineLoop: while ((line = pendingSourceLines.shift()) !== undefined) {
	    var lineEndPos = charOffset + line.length;
	    charLoop: for (; charOffset < lineEndPos; charOffset++) {
	      var currChar = pendingSource[charOffset];
	      if (currChar === '"' || currChar === '\'') {
	        withinString = !withinString;
	        continue charLoop;
	      } else if (withinString) {
	        continue charLoop;
	      } else if (charOffset + 1 < lineEndPos) {
	        var nextTwoChars = currChar + line[charOffset + 1];
	        if (nextTwoChars === '//') {
	          charOffset = lineEndPos + 1;
	          continue lineLoop;
	        } else if (nextTwoChars === '/*') {
	          withinBlockComment = true;
	          charOffset += 1;
	          continue charLoop;
	        } else if (nextTwoChars === '*/') {
	          withinBlockComment = false;
	          charOffset += 1;
	          continue charLoop;
	        }
	      }

	      if (!withinBlockComment && currChar === char) {
	        return charOffset + state.g.position;
	      }
	    }

	    // Account for '\n'
	    charOffset++;
	    withinString = false;
	  }

	  throw new Error('`' + char + '` not found!');
	}

	/**
	 * Catches up as `catchup` but replaces non-whitespace chars with spaces.
	 */
	function catchupWhiteOut(end, state) {
	  catchup(end, state, _replaceNonWhite);
	}

	/**
	 * Catches up as `catchup` but removes all non-whitespace characters.
	 */
	function catchupWhiteSpace(end, state) {
	  catchup(end, state, _stripNonWhite);
	}

	/**
	 * Removes all non-newline characters
	 */
	var reNonNewline = /[^\n]/g;
	function stripNonNewline(value) {
	  return value.replace(reNonNewline, function() {
	    return '';
	  });
	}

	/**
	 * Catches up as `catchup` but removes all non-newline characters.
	 *
	 * Equivalent to appending as many newlines as there are in the original source
	 * between the current position and `end`.
	 */
	function catchupNewlines(end, state) {
	  catchup(end, state, stripNonNewline);
	}


	/**
	 * Same as catchup but does not touch the buffer
	 *
	 * @param  {number} end
	 * @param  {object} state
	 */
	function move(end, state) {
	  // move the internal cursors
	  if (state.g.sourceMap) {
	    if (end < state.g.position) {
	      state.g.position = 0;
	      state.g.sourceLine = 1;
	      state.g.sourceColumn = 0;
	    }

	    var source = state.g.source.substring(state.g.position, end);
	    var sourceLines = source.split('\n');
	    if (sourceLines.length > 1) {
	      state.g.sourceLine += sourceLines.length - 1;
	      state.g.sourceColumn = 0;
	    }
	    state.g.sourceColumn += sourceLines[sourceLines.length - 1].length;
	  }
	  state.g.position = end;
	}

	/**
	 * Appends a string of text to the buffer
	 *
	 * @param {string} str
	 * @param {object} state
	 */
	function append(str, state) {
	  if (state.g.sourceMap && str) {
	    state.g.sourceMap.addMapping({
	      generated: { line: state.g.bufferLine, column: state.g.bufferColumn },
	      original: { line: state.g.sourceLine, column: state.g.sourceColumn },
	      source: state.g.sourceMapFilename
	    });
	    var transformedLines = str.split('\n');
	    if (transformedLines.length > 1) {
	      state.g.bufferLine += transformedLines.length - 1;
	      state.g.bufferColumn = 0;
	    }
	    state.g.bufferColumn +=
	      transformedLines[transformedLines.length - 1].length;
	  }
	  state.g.buffer += str;
	}

	/**
	 * Update indent using state.indentBy property. Indent is measured in
	 * double spaces. Updates a single line only.
	 *
	 * @param {string} str
	 * @param {object} state
	 * @return {string}
	 */
	function updateIndent(str, state) {
	  /*jshint -W004*/
	  var indentBy = state.indentBy;
	  if (indentBy < 0) {
	    for (var i = 0; i < -indentBy; i++) {
	      str = str.replace(leadingIndentRegexp, '$1');
	    }
	  } else {
	    for (var i = 0; i < indentBy; i++) {
	      str = str.replace(leadingIndentRegexp, '$1$2$2');
	    }
	  }
	  return str;
	}

	/**
	 * Calculates indent from the beginning of the line until "start" or the first
	 * character before start.
	 * @example
	 *   "  foo.bar()"
	 *         ^
	 *       start
	 *   indent will be "  "
	 *
	 * @param  {number} start
	 * @param  {object} state
	 * @return {string}
	 */
	function indentBefore(start, state) {
	  var end = start;
	  start = start - 1;

	  while (start > 0 && state.g.source[start] != '\n') {
	    if (!state.g.source[start].match(/[ \t]/)) {
	      end = start;
	    }
	    start--;
	  }
	  return state.g.source.substring(start + 1, end);
	}

	function getDocblock(state) {
	  if (!state.g.docblock) {
	    var docblock = __webpack_require__(263);
	    state.g.docblock =
	      docblock.parseAsObject(docblock.extract(state.g.source));
	  }
	  return state.g.docblock;
	}

	function identWithinLexicalScope(identName, state, stopBeforeNode) {
	  var currScope = state.localScope;
	  while (currScope) {
	    if (currScope.identifiers[identName] !== undefined) {
	      return true;
	    }

	    if (stopBeforeNode && currScope.parentNode === stopBeforeNode) {
	      break;
	    }

	    currScope = currScope.parentScope;
	  }
	  return false;
	}

	function identInLocalScope(identName, state) {
	  return state.localScope.identifiers[identName] !== undefined;
	}

	/**
	 * @param {object} boundaryNode
	 * @param {?array} path
	 * @return {?object} node
	 */
	function initScopeMetadata(boundaryNode, path, node) {
	  return {
	    boundaryNode: boundaryNode,
	    bindingPath: path,
	    bindingNode: node
	  };
	}

	function declareIdentInLocalScope(identName, metaData, state) {
	  state.localScope.identifiers[identName] = {
	    boundaryNode: metaData.boundaryNode,
	    path: metaData.bindingPath,
	    node: metaData.bindingNode,
	    state: Object.create(state)
	  };
	}

	function getLexicalBindingMetadata(identName, state) {
	  var currScope = state.localScope;
	  while (currScope) {
	    if (currScope.identifiers[identName] !== undefined) {
	      return currScope.identifiers[identName];
	    }

	    currScope = currScope.parentScope;
	  }
	}

	function getLocalBindingMetadata(identName, state) {
	  return state.localScope.identifiers[identName];
	}

	/**
	 * Apply the given analyzer function to the current node. If the analyzer
	 * doesn't return false, traverse each child of the current node using the given
	 * traverser function.
	 *
	 * @param {function} analyzer
	 * @param {function} traverser
	 * @param {object} node
	 * @param {array} path
	 * @param {object} state
	 */
	function analyzeAndTraverse(analyzer, traverser, node, path, state) {
	  if (node.type) {
	    if (analyzer(node, path, state) === false) {
	      return;
	    }
	    path.unshift(node);
	  }

	  getOrderedChildren(node).forEach(function(child) {
	    traverser(child, path, state);
	  });

	  node.type && path.shift();
	}

	/**
	 * It is crucial that we traverse in order, or else catchup() on a later
	 * node that is processed out of order can move the buffer past a node
	 * that we haven't handled yet, preventing us from modifying that node.
	 *
	 * This can happen when a node has multiple properties containing children.
	 * For example, XJSElement nodes have `openingElement`, `closingElement` and
	 * `children`. If we traverse `openingElement`, then `closingElement`, then
	 * when we get to `children`, the buffer has already caught up to the end of
	 * the closing element, after the children.
	 *
	 * This is basically a Schwartzian transform. Collects an array of children,
	 * each one represented as [child, startIndex]; sorts the array by start
	 * index; then traverses the children in that order.
	 */
	function getOrderedChildren(node) {
	  var queue = [];
	  for (var key in node) {
	    if (node.hasOwnProperty(key)) {
	      enqueueNodeWithStartIndex(queue, node[key]);
	    }
	  }
	  queue.sort(function(a, b) { return a[1] - b[1]; });
	  return queue.map(function(pair) { return pair[0]; });
	}

	/**
	 * Helper function for analyzeAndTraverse which queues up all of the children
	 * of the given node.
	 *
	 * Children can also be found in arrays, so we basically want to merge all of
	 * those arrays together so we can sort them and then traverse the children
	 * in order.
	 *
	 * One example is the Program node. It contains `body` and `comments`, both
	 * arrays. Lexographically, comments are interspersed throughout the body
	 * nodes, but esprima's AST groups them together.
	 */
	function enqueueNodeWithStartIndex(queue, node) {
	  if (typeof node !== 'object' || node === null) {
	    return;
	  }
	  if (node.range) {
	    queue.push([node, node.range[0]]);
	  } else if (Array.isArray(node)) {
	    for (var ii = 0; ii < node.length; ii++) {
	      enqueueNodeWithStartIndex(queue, node[ii]);
	    }
	  }
	}

	/**
	 * Checks whether a node or any of its sub-nodes contains
	 * a syntactic construct of the passed type.
	 * @param {object} node - AST node to test.
	 * @param {string} type - node type to lookup.
	 */
	function containsChildOfType(node, type) {
	  return containsChildMatching(node, function(node) {
	    return node.type === type;
	  });
	}

	function containsChildMatching(node, matcher) {
	  var foundMatchingChild = false;
	  function nodeTypeAnalyzer(node) {
	    if (matcher(node) === true) {
	      foundMatchingChild = true;
	      return false;
	    }
	  }
	  function nodeTypeTraverser(child, path, state) {
	    if (!foundMatchingChild) {
	      foundMatchingChild = containsChildMatching(child, matcher);
	    }
	  }
	  analyzeAndTraverse(
	    nodeTypeAnalyzer,
	    nodeTypeTraverser,
	    node,
	    []
	  );
	  return foundMatchingChild;
	}

	var scopeTypes = {};
	scopeTypes[Syntax.ArrowFunctionExpression] = true;
	scopeTypes[Syntax.FunctionExpression] = true;
	scopeTypes[Syntax.FunctionDeclaration] = true;
	scopeTypes[Syntax.Program] = true;

	function getBoundaryNode(path) {
	  for (var ii = 0; ii < path.length; ++ii) {
	    if (scopeTypes[path[ii].type]) {
	      return path[ii];
	    }
	  }
	  throw new Error(
	    'Expected to find a node with one of the following types in path:\n' +
	    JSON.stringify(Object.keys(scopeTypes))
	  );
	}

	function getTempVar(tempVarIndex) {
	  return '$__' + tempVarIndex;
	}

	function injectTempVar(state) {
	  var tempVar = '$__' + (state.localScope.tempVarIndex++);
	  state.localScope.tempVars.push(tempVar);
	  return tempVar;
	}

	function injectTempVarDeclarations(state, index) {
	  if (state.localScope.tempVars.length) {
	    state.g.buffer =
	      state.g.buffer.slice(0, index) +
	      'var ' + state.localScope.tempVars.join(', ') + ';' +
	      state.g.buffer.slice(index);
	    state.localScope.tempVars = [];
	  }
	}

	exports.analyzeAndTraverse = analyzeAndTraverse;
	exports.append = append;
	exports.catchup = catchup;
	exports.catchupNewlines = catchupNewlines;
	exports.catchupWhiteOut = catchupWhiteOut;
	exports.catchupWhiteSpace = catchupWhiteSpace;
	exports.containsChildMatching = containsChildMatching;
	exports.containsChildOfType = containsChildOfType;
	exports.createState = createState;
	exports.declareIdentInLocalScope = declareIdentInLocalScope;
	exports.getBoundaryNode = getBoundaryNode;
	exports.getDocblock = getDocblock;
	exports.getLexicalBindingMetadata = getLexicalBindingMetadata;
	exports.getLocalBindingMetadata = getLocalBindingMetadata;
	exports.getNextSyntacticCharOffset = getNextSyntacticCharOffset;
	exports.getNodeSourceText = getNodeSourceText;
	exports.getOrderedChildren = getOrderedChildren;
	exports.getTempVar = getTempVar;
	exports.identInLocalScope = identInLocalScope;
	exports.identWithinLexicalScope = identWithinLexicalScope;
	exports.indentBefore = indentBefore;
	exports.initScopeMetadata = initScopeMetadata;
	exports.injectTempVar = injectTempVar;
	exports.injectTempVarDeclarations = injectTempVarDeclarations;
	exports.move = move;
	exports.scopeTypes = scopeTypes;
	exports.updateIndent = updateIndent;
	exports.updateState = updateState;


/***/ },
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	function isNothing(subject) {
	  return (undefined === subject) || (null === subject);
	}


	function isObject(subject) {
	  return ('object' === typeof subject) && (null !== subject);
	}


	function toArray(sequence) {
	  if (Array.isArray(sequence)) {
	    return sequence;
	  } else if (isNothing(sequence)) {
	    return [];
	  } else {
	    return [ sequence ];
	  }
	}


	function extend(target, source) {
	  var index, length, key, sourceKeys;

	  if (source) {
	    sourceKeys = Object.keys(source);

	    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
	      key = sourceKeys[index];
	      target[key] = source[key];
	    }
	  }

	  return target;
	}


	function repeat(string, count) {
	  var result = '', cycle;

	  for (cycle = 0; cycle < count; cycle += 1) {
	    result += string;
	  }

	  return result;
	}


	function isNegativeZero(number) {
	  return (0 === number) && (Number.NEGATIVE_INFINITY === 1 / number);
	}


	module.exports.isNothing      = isNothing;
	module.exports.isObject       = isObject;
	module.exports.toArray        = toArray;
	module.exports.repeat         = repeat;
	module.exports.isNegativeZero = isNegativeZero;
	module.exports.extend         = extend;


/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var common = __webpack_require__(233);


	function Mark(name, buffer, position, line, column) {
	  this.name     = name;
	  this.buffer   = buffer;
	  this.position = position;
	  this.line     = line;
	  this.column   = column;
	}


	Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
	  var head, start, tail, end, snippet;

	  if (!this.buffer) {
	    return null;
	  }

	  indent = indent || 4;
	  maxLength = maxLength || 75;

	  head = '';
	  start = this.position;

	  while (start > 0 && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1))) {
	    start -= 1;
	    if (this.position - start > (maxLength / 2 - 1)) {
	      head = ' ... ';
	      start += 5;
	      break;
	    }
	  }

	  tail = '';
	  end = this.position;

	  while (end < this.buffer.length && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end))) {
	    end += 1;
	    if (end - this.position > (maxLength / 2 - 1)) {
	      tail = ' ... ';
	      end -= 5;
	      break;
	    }
	  }

	  snippet = this.buffer.slice(start, end);

	  return common.repeat(' ', indent) + head + snippet + tail + '\n' +
	         common.repeat(' ', indent + this.position - start + head.length) + '^';
	};


	Mark.prototype.toString = function toString(compact) {
	  var snippet, where = '';

	  if (this.name) {
	    where += 'in "' + this.name + '" ';
	  }

	  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

	  if (!compact) {
	    snippet = this.getSnippet();

	    if (snippet) {
	      where += ':\n' + snippet;
	    }
	  }

	  return where;
	};


	module.exports = Mark;


/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	module.exports = new Type('tag:yaml.org,2002:str', {
	  kind: 'scalar',
	  construct: function (data) { return null !== data ? data : ''; }
	});


/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	module.exports = new Type('tag:yaml.org,2002:seq', {
	  kind: 'sequence',
	  construct: function (data) { return null !== data ? data : []; }
	});


/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	module.exports = new Type('tag:yaml.org,2002:map', {
	  kind: 'mapping',
	  construct: function (data) { return null !== data ? data : {}; }
	});


/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	function resolveYamlNull(data) {
	  if (null === data) {
	    return true;
	  }

	  var max = data.length;

	  return (max === 1 && data === '~') ||
	         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
	}

	function constructYamlNull() {
	  return null;
	}

	function isNull(object) {
	  return null === object;
	}

	module.exports = new Type('tag:yaml.org,2002:null', {
	  kind: 'scalar',
	  resolve: resolveYamlNull,
	  construct: constructYamlNull,
	  predicate: isNull,
	  represent: {
	    canonical: function () { return '~';    },
	    lowercase: function () { return 'null'; },
	    uppercase: function () { return 'NULL'; },
	    camelcase: function () { return 'Null'; }
	  },
	  defaultStyle: 'lowercase'
	});


/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	function resolveYamlBoolean(data) {
	  if (null === data) {
	    return false;
	  }

	  var max = data.length;

	  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
	         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
	}

	function constructYamlBoolean(data) {
	  return data === 'true' ||
	         data === 'True' ||
	         data === 'TRUE';
	}

	function isBoolean(object) {
	  return '[object Boolean]' === Object.prototype.toString.call(object);
	}

	module.exports = new Type('tag:yaml.org,2002:bool', {
	  kind: 'scalar',
	  resolve: resolveYamlBoolean,
	  construct: constructYamlBoolean,
	  predicate: isBoolean,
	  represent: {
	    lowercase: function (object) { return object ? 'true' : 'false'; },
	    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
	    camelcase: function (object) { return object ? 'True' : 'False'; }
	  },
	  defaultStyle: 'lowercase'
	});


/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var common = __webpack_require__(233);
	var Type   = __webpack_require__(193);

	function isHexCode(c) {
	  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
	         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
	         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
	}

	function isOctCode(c) {
	  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
	}

	function isDecCode(c) {
	  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
	}

	function resolveYamlInteger(data) {
	  if (null === data) {
	    return false;
	  }

	  var max = data.length,
	      index = 0,
	      hasDigits = false,
	      ch;

	  if (!max) { return false; }

	  ch = data[index];

	  // sign
	  if (ch === '-' || ch === '+') {
	    ch = data[++index];
	  }

	  if (ch === '0') {
	    // 0
	    if (index+1 === max) { return true; }
	    ch = data[++index];

	    // base 2, base 8, base 16

	    if (ch === 'b') {
	      // base 2
	      index++;

	      for (; index < max; index++) {
	        ch = data[index];
	        if (ch === '_') { continue; }
	        if (ch !== '0' && ch !== '1') {
	          return false;
	        }
	        hasDigits = true;
	      }
	      return hasDigits;
	    }


	    if (ch === 'x') {
	      // base 16
	      index++;

	      for (; index < max; index++) {
	        ch = data[index];
	        if (ch === '_') { continue; }
	        if (!isHexCode(data.charCodeAt(index))) {
	          return false;
	        }
	        hasDigits = true;
	      }
	      return hasDigits;
	    }

	    // base 8
	    for (; index < max; index++) {
	      ch = data[index];
	      if (ch === '_') { continue; }
	      if (!isOctCode(data.charCodeAt(index))) {
	        return false;
	      }
	      hasDigits = true;
	    }
	    return hasDigits;
	  }

	  // base 10 (except 0) or base 60

	  for (; index < max; index++) {
	    ch = data[index];
	    if (ch === '_') { continue; }
	    if (ch === ':') { break; }
	    if (!isDecCode(data.charCodeAt(index))) {
	      return false;
	    }
	    hasDigits = true;
	  }

	  if (!hasDigits) { return false; }

	  // if !base60 - done;
	  if (ch !== ':') { return true; }

	  // base60 almost not used, no needs to optimize
	  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
	}

	function constructYamlInteger(data) {
	  var value = data, sign = 1, ch, base, digits = [];

	  if (value.indexOf('_') !== -1) {
	    value = value.replace(/_/g, '');
	  }

	  ch = value[0];

	  if (ch === '-' || ch === '+') {
	    if (ch === '-') { sign = -1; }
	    value = value.slice(1);
	    ch = value[0];
	  }

	  if ('0' === value) {
	    return 0;
	  }

	  if (ch === '0') {
	    if (value[1] === 'b') {
	      return sign * parseInt(value.slice(2), 2);
	    }
	    if (value[1] === 'x') {
	      return sign * parseInt(value, 16);
	    }
	    return sign * parseInt(value, 8);

	  }

	  if (value.indexOf(':') !== -1) {
	    value.split(':').forEach(function (v) {
	      digits.unshift(parseInt(v, 10));
	    });

	    value = 0;
	    base = 1;

	    digits.forEach(function (d) {
	      value += (d * base);
	      base *= 60;
	    });

	    return sign * value;

	  }

	  return sign * parseInt(value, 10);
	}

	function isInteger(object) {
	  return ('[object Number]' === Object.prototype.toString.call(object)) &&
	         (0 === object % 1 && !common.isNegativeZero(object));
	}

	module.exports = new Type('tag:yaml.org,2002:int', {
	  kind: 'scalar',
	  resolve: resolveYamlInteger,
	  construct: constructYamlInteger,
	  predicate: isInteger,
	  represent: {
	    binary:      function (object) { return '0b' + object.toString(2); },
	    octal:       function (object) { return '0'  + object.toString(8); },
	    decimal:     function (object) { return        object.toString(10); },
	    hexadecimal: function (object) { return '0x' + object.toString(16).toUpperCase(); }
	  },
	  defaultStyle: 'decimal',
	  styleAliases: {
	    binary:      [ 2,  'bin' ],
	    octal:       [ 8,  'oct' ],
	    decimal:     [ 10, 'dec' ],
	    hexadecimal: [ 16, 'hex' ]
	  }
	});


/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var common = __webpack_require__(233);
	var Type   = __webpack_require__(193);

	var YAML_FLOAT_PATTERN = new RegExp(
	  '^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?' +
	  '|\\.[0-9_]+(?:[eE][-+][0-9]+)?' +
	  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
	  '|[-+]?\\.(?:inf|Inf|INF)' +
	  '|\\.(?:nan|NaN|NAN))$');

	function resolveYamlFloat(data) {
	  if (null === data) {
	    return false;
	  }

	  var value, sign, base, digits;

	  if (!YAML_FLOAT_PATTERN.test(data)) {
	    return false;
	  }
	  return true;
	}

	function constructYamlFloat(data) {
	  var value, sign, base, digits;

	  value  = data.replace(/_/g, '').toLowerCase();
	  sign   = '-' === value[0] ? -1 : 1;
	  digits = [];

	  if (0 <= '+-'.indexOf(value[0])) {
	    value = value.slice(1);
	  }

	  if ('.inf' === value) {
	    return (1 === sign) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

	  } else if ('.nan' === value) {
	    return NaN;

	  } else if (0 <= value.indexOf(':')) {
	    value.split(':').forEach(function (v) {
	      digits.unshift(parseFloat(v, 10));
	    });

	    value = 0.0;
	    base = 1;

	    digits.forEach(function (d) {
	      value += d * base;
	      base *= 60;
	    });

	    return sign * value;

	  } else {
	    return sign * parseFloat(value, 10);
	  }
	}

	function representYamlFloat(object, style) {
	  if (isNaN(object)) {
	    switch (style) {
	    case 'lowercase':
	      return '.nan';
	    case 'uppercase':
	      return '.NAN';
	    case 'camelcase':
	      return '.NaN';
	    }
	  } else if (Number.POSITIVE_INFINITY === object) {
	    switch (style) {
	    case 'lowercase':
	      return '.inf';
	    case 'uppercase':
	      return '.INF';
	    case 'camelcase':
	      return '.Inf';
	    }
	  } else if (Number.NEGATIVE_INFINITY === object) {
	    switch (style) {
	    case 'lowercase':
	      return '-.inf';
	    case 'uppercase':
	      return '-.INF';
	    case 'camelcase':
	      return '-.Inf';
	    }
	  } else if (common.isNegativeZero(object)) {
	    return '-0.0';
	  } else {
	    return object.toString(10);
	  }
	}

	function isFloat(object) {
	  return ('[object Number]' === Object.prototype.toString.call(object)) &&
	         (0 !== object % 1 || common.isNegativeZero(object));
	}

	module.exports = new Type('tag:yaml.org,2002:float', {
	  kind: 'scalar',
	  resolve: resolveYamlFloat,
	  construct: constructYamlFloat,
	  predicate: isFloat,
	  represent: representYamlFloat,
	  defaultStyle: 'lowercase'
	});


/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	var YAML_TIMESTAMP_REGEXP = new RegExp(
	  '^([0-9][0-9][0-9][0-9])'          + // [1] year
	  '-([0-9][0-9]?)'                   + // [2] month
	  '-([0-9][0-9]?)'                   + // [3] day
	  '(?:(?:[Tt]|[ \\t]+)'              + // ...
	  '([0-9][0-9]?)'                    + // [4] hour
	  ':([0-9][0-9])'                    + // [5] minute
	  ':([0-9][0-9])'                    + // [6] second
	  '(?:\\.([0-9]*))?'                 + // [7] fraction
	  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
	  '(?::([0-9][0-9]))?))?)?$');         // [11] tz_minute

	function resolveYamlTimestamp(data) {
	  if (null === data) {
	    return false;
	  }

	  var match, year, month, day, hour, minute, second, fraction = 0,
	      delta = null, tz_hour, tz_minute, date;

	  match = YAML_TIMESTAMP_REGEXP.exec(data);

	  if (null === match) {
	    return false;
	  }

	  return true;
	}

	function constructYamlTimestamp(data) {
	  var match, year, month, day, hour, minute, second, fraction = 0,
	      delta = null, tz_hour, tz_minute, date;

	  match = YAML_TIMESTAMP_REGEXP.exec(data);

	  if (null === match) {
	    throw new Error('Date resolve error');
	  }

	  // match: [1] year [2] month [3] day

	  year = +(match[1]);
	  month = +(match[2]) - 1; // JS month starts with 0
	  day = +(match[3]);

	  if (!match[4]) { // no hour
	    return new Date(Date.UTC(year, month, day));
	  }

	  // match: [4] hour [5] minute [6] second [7] fraction

	  hour = +(match[4]);
	  minute = +(match[5]);
	  second = +(match[6]);

	  if (match[7]) {
	    fraction = match[7].slice(0, 3);
	    while (fraction.length < 3) { // milli-seconds
	      fraction += '0';
	    }
	    fraction = +fraction;
	  }

	  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

	  if (match[9]) {
	    tz_hour = +(match[10]);
	    tz_minute = +(match[11] || 0);
	    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
	    if ('-' === match[9]) {
	      delta = -delta;
	    }
	  }

	  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

	  if (delta) {
	    date.setTime(date.getTime() - delta);
	  }

	  return date;
	}

	function representYamlTimestamp(object /*, style*/) {
	  return object.toISOString();
	}

	module.exports = new Type('tag:yaml.org,2002:timestamp', {
	  kind: 'scalar',
	  resolve: resolveYamlTimestamp,
	  construct: constructYamlTimestamp,
	  instanceOf: Date,
	  represent: representYamlTimestamp
	});


/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	function resolveYamlMerge(data) {
	  return '<<' === data || null === data;
	}

	module.exports = new Type('tag:yaml.org,2002:merge', {
	  kind: 'scalar',
	  resolve: resolveYamlMerge
	});


/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	// A trick for browserified version.
	// Since we make browserifier to ignore `buffer` module, NodeBuffer will be undefined
	var NodeBuffer = __webpack_require__(261).Buffer;
	var Type       = __webpack_require__(193);


	// [ 64, 65, 66 ] -> [ padding, CR, LF ]
	var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


	function resolveYamlBinary(data) {
	  if (null === data) {
	    return false;
	  }

	  var code, idx, bitlen = 0, len = 0, max = data.length, map = BASE64_MAP;

	  // Convert one by one.
	  for (idx = 0; idx < max; idx ++) {
	    code = map.indexOf(data.charAt(idx));

	    // Skip CR/LF
	    if (code > 64) { continue; }

	    // Fail on illegal characters
	    if (code < 0) { return false; }

	    bitlen += 6;
	  }

	  // If there are any bits left, source was corrupted
	  return (bitlen % 8) === 0;
	}

	function constructYamlBinary(data) {
	  var code, idx, tailbits,
	      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
	      max = input.length,
	      map = BASE64_MAP,
	      bits = 0,
	      result = [];

	  // Collect by 6*4 bits (3 bytes)

	  for (idx = 0; idx < max; idx++) {
	    if ((idx % 4 === 0) && idx) {
	      result.push((bits >> 16) & 0xFF);
	      result.push((bits >> 8) & 0xFF);
	      result.push(bits & 0xFF);
	    }

	    bits = (bits << 6) | map.indexOf(input.charAt(idx));
	  }

	  // Dump tail

	  tailbits = (max % 4)*6;

	  if (tailbits === 0) {
	    result.push((bits >> 16) & 0xFF);
	    result.push((bits >> 8) & 0xFF);
	    result.push(bits & 0xFF);
	  } else if (tailbits === 18) {
	    result.push((bits >> 10) & 0xFF);
	    result.push((bits >> 2) & 0xFF);
	  } else if (tailbits === 12) {
	    result.push((bits >> 4) & 0xFF);
	  }

	  // Wrap into Buffer for NodeJS and leave Array for browser
	  if (NodeBuffer) {
	    return new NodeBuffer(result);
	  }

	  return result;
	}

	function representYamlBinary(object /*, style*/) {
	  var result = '', bits = 0, idx, tail,
	      max = object.length,
	      map = BASE64_MAP;

	  // Convert every three bytes to 4 ASCII characters.

	  for (idx = 0; idx < max; idx++) {
	    if ((idx % 3 === 0) && idx) {
	      result += map[(bits >> 18) & 0x3F];
	      result += map[(bits >> 12) & 0x3F];
	      result += map[(bits >> 6) & 0x3F];
	      result += map[bits & 0x3F];
	    }

	    bits = (bits << 8) + object[idx];
	  }

	  // Dump tail

	  tail = max % 3;

	  if (tail === 0) {
	    result += map[(bits >> 18) & 0x3F];
	    result += map[(bits >> 12) & 0x3F];
	    result += map[(bits >> 6) & 0x3F];
	    result += map[bits & 0x3F];
	  } else if (tail === 2) {
	    result += map[(bits >> 10) & 0x3F];
	    result += map[(bits >> 4) & 0x3F];
	    result += map[(bits << 2) & 0x3F];
	    result += map[64];
	  } else if (tail === 1) {
	    result += map[(bits >> 2) & 0x3F];
	    result += map[(bits << 4) & 0x3F];
	    result += map[64];
	    result += map[64];
	  }

	  return result;
	}

	function isBinary(object) {
	  return NodeBuffer && NodeBuffer.isBuffer(object);
	}

	module.exports = new Type('tag:yaml.org,2002:binary', {
	  kind: 'scalar',
	  resolve: resolveYamlBinary,
	  construct: constructYamlBinary,
	  predicate: isBinary,
	  represent: representYamlBinary
	});


/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	var _toString       = Object.prototype.toString;

	function resolveYamlOmap(data) {
	  if (null === data) {
	    return true;
	  }

	  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
	      object = data;

	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];
	    pairHasKey = false;

	    if ('[object Object]' !== _toString.call(pair)) {
	      return false;
	    }

	    for (pairKey in pair) {
	      if (_hasOwnProperty.call(pair, pairKey)) {
	        if (!pairHasKey) {
	          pairHasKey = true;
	        } else {
	          return false;
	        }
	      }
	    }

	    if (!pairHasKey) {
	      return false;
	    }

	    if (-1 === objectKeys.indexOf(pairKey)) {
	      objectKeys.push(pairKey);
	    } else {
	      return false;
	    }
	  }

	  return true;
	}

	function constructYamlOmap(data) {
	  return null !== data ? data : [];
	}

	module.exports = new Type('tag:yaml.org,2002:omap', {
	  kind: 'sequence',
	  resolve: resolveYamlOmap,
	  construct: constructYamlOmap
	});


/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	var _toString = Object.prototype.toString;

	function resolveYamlPairs(data) {
	  if (null === data) {
	    return true;
	  }

	  var index, length, pair, keys, result,
	      object = data;

	  result = new Array(object.length);

	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];

	    if ('[object Object]' !== _toString.call(pair)) {
	      return false;
	    }

	    keys = Object.keys(pair);

	    if (1 !== keys.length) {
	      return false;
	    }

	    result[index] = [ keys[0], pair[keys[0]] ];
	  }

	  return true;
	}

	function constructYamlPairs(data) {
	  if (null === data) {
	    return [];
	  }

	  var index, length, pair, keys, result,
	      object = data;

	  result = new Array(object.length);

	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];

	    keys = Object.keys(pair);

	    result[index] = [ keys[0], pair[keys[0]] ];
	  }

	  return result;
	}

	module.exports = new Type('tag:yaml.org,2002:pairs', {
	  kind: 'sequence',
	  resolve: resolveYamlPairs,
	  construct: constructYamlPairs
	});


/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	var _hasOwnProperty = Object.prototype.hasOwnProperty;

	function resolveYamlSet(data) {
	  if (null === data) {
	    return true;
	  }

	  var key, object = data;

	  for (key in object) {
	    if (_hasOwnProperty.call(object, key)) {
	      if (null !== object[key]) {
	        return false;
	      }
	    }
	  }

	  return true;
	}

	function constructYamlSet(data) {
	  return null !== data ? data : {};
	}

	module.exports = new Type('tag:yaml.org,2002:set', {
	  kind: 'mapping',
	  resolve: resolveYamlSet,
	  construct: constructYamlSet
	});


/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	function resolveJavascriptUndefined() {
	  return true;
	}

	function constructJavascriptUndefined() {
	  return undefined;
	}

	function representJavascriptUndefined() {
	  return '';
	}

	function isUndefined(object) {
	  return 'undefined' === typeof object;
	}

	module.exports = new Type('tag:yaml.org,2002:js/undefined', {
	  kind: 'scalar',
	  resolve: resolveJavascriptUndefined,
	  construct: constructJavascriptUndefined,
	  predicate: isUndefined,
	  represent: representJavascriptUndefined
	});


/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(193);

	function resolveJavascriptRegExp(data) {
	  if (null === data) {
	    return false;
	  }

	  if (0 === data.length) {
	    return false;
	  }

	  var regexp = data,
	      tail   = /\/([gim]*)$/.exec(data),
	      modifiers = '';

	  // if regexp starts with '/' it can have modifiers and must be properly closed
	  // `/foo/gim` - modifiers tail can be maximum 3 chars
	  if ('/' === regexp[0]) {
	    if (tail) {
	      modifiers = tail[1];
	    }

	    if (modifiers.length > 3) { return false; }
	    // if expression starts with /, is should be properly terminated
	    if (regexp[regexp.length - modifiers.length - 1] !== '/') { return false; }

	    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
	  }

	  try {
	    var dummy = new RegExp(regexp, modifiers);
	    return true;
	  } catch (error) {
	    return false;
	  }
	}

	function constructJavascriptRegExp(data) {
	  var regexp = data,
	      tail   = /\/([gim]*)$/.exec(data),
	      modifiers = '';

	  // `/foo/gim` - tail can be maximum 4 chars
	  if ('/' === regexp[0]) {
	    if (tail) {
	      modifiers = tail[1];
	    }
	    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
	  }

	  return new RegExp(regexp, modifiers);
	}

	function representJavascriptRegExp(object /*, style*/) {
	  var result = '/' + object.source + '/';

	  if (object.global) {
	    result += 'g';
	  }

	  if (object.multiline) {
	    result += 'm';
	  }

	  if (object.ignoreCase) {
	    result += 'i';
	  }

	  return result;
	}

	function isRegExp(object) {
	  return '[object RegExp]' === Object.prototype.toString.call(object);
	}

	module.exports = new Type('tag:yaml.org,2002:js/regexp', {
	  kind: 'scalar',
	  resolve: resolveJavascriptRegExp,
	  construct: constructJavascriptRegExp,
	  predicate: isRegExp,
	  represent: representJavascriptRegExp
	});


/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var esprima;

	// Browserified version does not have esprima
	//
	// 1. For node.js just require module as deps
	// 2. For browser try to require mudule via external AMD system.
	//    If not found - try to fallback to window.esprima. If not
	//    found too - then fail to parse.
	//
	try {
	  esprima = __webpack_require__(272);
	} catch (_) {
	  /*global window */
	  if (typeof window !== 'undefined') { esprima = window.esprima; }
	}

	var Type = __webpack_require__(193);

	function resolveJavascriptFunction(data) {
	  if (null === data) {
	    return false;
	  }

	  try {
	    var source = '(' + data + ')',
	        ast    = esprima.parse(source, { range: true }),
	        params = [],
	        body;

	    if ('Program'             !== ast.type         ||
	        1                     !== ast.body.length  ||
	        'ExpressionStatement' !== ast.body[0].type ||
	        'FunctionExpression'  !== ast.body[0].expression.type) {
	      return false;
	    }

	    return true;
	  } catch (err) {
	    return false;
	  }
	}

	function constructJavascriptFunction(data) {
	  /*jslint evil:true*/

	  var source = '(' + data + ')',
	      ast    = esprima.parse(source, { range: true }),
	      params = [],
	      body;

	  if ('Program'             !== ast.type         ||
	      1                     !== ast.body.length  ||
	      'ExpressionStatement' !== ast.body[0].type ||
	      'FunctionExpression'  !== ast.body[0].expression.type) {
	    throw new Error('Failed to resolve function');
	  }

	  ast.body[0].expression.params.forEach(function (param) {
	    params.push(param.name);
	  });

	  body = ast.body[0].expression.body.range;

	  // Esprima's ranges include the first '{' and the last '}' characters on
	  // function expressions. So cut them out.
	  return new Function(params, source.slice(body[0]+1, body[1]-1));
	}

	function representJavascriptFunction(object /*, style*/) {
	  return object.toString();
	}

	function isFunction(object) {
	  return '[object Function]' === Object.prototype.toString.call(object);
	}

	module.exports = new Type('tag:yaml.org,2002:js/function', {
	  kind: 'scalar',
	  resolve: resolveJavascriptFunction,
	  construct: constructJavascriptFunction,
	  predicate: isFunction,
	  represent: representJavascriptFunction
	});


/***/ },
/* 251 */,
/* 252 */,
/* 253 */,
/* 254 */,
/* 255 */,
/* 256 */,
/* 257 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Stringify = __webpack_require__(265);
	var Parse = __webpack_require__(266);


	// Declare internals

	var internals = {};


	module.exports = {
	    stringify: Stringify,
	    parse: Parse
	};


/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2014 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	var KEYWORDS = [
	  'break', 'do', 'in', 'typeof', 'case', 'else', 'instanceof', 'var', 'catch',
	  'export', 'new', 'void', 'class', 'extends', 'return', 'while', 'const',
	  'finally', 'super', 'with', 'continue', 'for', 'switch', 'yield', 'debugger',
	  'function', 'this', 'default', 'if', 'throw', 'delete', 'import', 'try'
	];

	var FUTURE_RESERVED_WORDS = [
	  'enum', 'await', 'implements', 'package', 'protected', 'static', 'interface',
	  'private', 'public'
	];

	var LITERALS = [
	  'null',
	  'true',
	  'false'
	];

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-reserved-words
	var RESERVED_WORDS = [].concat(
	  KEYWORDS,
	  FUTURE_RESERVED_WORDS,
	  LITERALS
	);

	var reservedWordsMap = Object.create(null);
	RESERVED_WORDS.forEach(function(k) {
	    reservedWordsMap[k] = true;
	});

	/**
	 * This list should not grow as new reserved words are introdued. This list is
	 * of words that need to be quoted because ES3-ish browsers do not allow their
	 * use as identifier names.
	 */
	var ES3_FUTURE_RESERVED_WORDS = [
	  'enum', 'implements', 'package', 'protected', 'static', 'interface',
	  'private', 'public'
	];

	var ES3_RESERVED_WORDS = [].concat(
	  KEYWORDS,
	  ES3_FUTURE_RESERVED_WORDS,
	  LITERALS
	);

	var es3ReservedWordsMap = Object.create(null);
	ES3_RESERVED_WORDS.forEach(function(k) {
	    es3ReservedWordsMap[k] = true;
	});

	exports.isReservedWord = function(word) {
	  return !!reservedWordsMap[word];
	};

	exports.isES3ReservedWord = function(word) {
	  return !!es3ReservedWordsMap[word];
	};


/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/*jslint node:true*/

	/**
	 * Desugars ES7 rest properties into ES5 object iteration.
	 */

	var Syntax = __webpack_require__(262).Syntax;

	// TODO: This is a pretty massive helper, it should only be defined once, in the
	// transform's runtime environment. We don't currently have a runtime though.
	var restFunction =
	  '(function(source, exclusion) {' +
	    'var rest = {};' +
	    'var hasOwn = Object.prototype.hasOwnProperty;' +
	    'if (source == null) {' +
	      'throw new TypeError();' +
	    '}' +
	    'for (var key in source) {' +
	      'if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {' +
	        'rest[key] = source[key];' +
	      '}' +
	    '}' +
	    'return rest;' +
	  '})';

	function getPropertyNames(properties) {
	  var names = [];
	  for (var i = 0; i < properties.length; i++) {
	    var property = properties[i];
	    if (property.type === Syntax.SpreadProperty) {
	      continue;
	    }
	    if (property.type === Syntax.Identifier) {
	      names.push(property.name);
	    } else {
	      names.push(property.key.name);
	    }
	  }
	  return names;
	}

	function getRestFunctionCall(source, exclusion) {
	  return restFunction + '(' + source + ',' + exclusion + ')';
	}

	function getSimpleShallowCopy(accessorExpression) {
	  // This could be faster with 'Object.assign({}, ' + accessorExpression + ')'
	  // but to unify code paths and avoid a ES6 dependency we use the same
	  // helper as for the exclusion case.
	  return getRestFunctionCall(accessorExpression, '{}');
	}

	function renderRestExpression(accessorExpression, excludedProperties) {
	  var excludedNames = getPropertyNames(excludedProperties);
	  if (!excludedNames.length) {
	    return getSimpleShallowCopy(accessorExpression);
	  }
	  return getRestFunctionCall(
	    accessorExpression,
	    '{' + excludedNames.join(':1,') + ':1}'
	  );
	}

	exports.renderRestExpression = renderRestExpression;


/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	/*global exports:true*/
	'use strict';
	var Syntax = __webpack_require__(218).Syntax;
	var utils = __webpack_require__(232);

	function renderJSXLiteral(object, isLast, state, start, end) {
	  var lines = object.value.split(/\r\n|\n|\r/);

	  if (start) {
	    utils.append(start, state);
	  }

	  var lastNonEmptyLine = 0;

	  lines.forEach(function(line, index) {
	    if (line.match(/[^ \t]/)) {
	      lastNonEmptyLine = index;
	    }
	  });

	  lines.forEach(function(line, index) {
	    var isFirstLine = index === 0;
	    var isLastLine = index === lines.length - 1;
	    var isLastNonEmptyLine = index === lastNonEmptyLine;

	    // replace rendered whitespace tabs with spaces
	    var trimmedLine = line.replace(/\t/g, ' ');

	    // trim whitespace touching a newline
	    if (!isFirstLine) {
	      trimmedLine = trimmedLine.replace(/^[ ]+/, '');
	    }
	    if (!isLastLine) {
	      trimmedLine = trimmedLine.replace(/[ ]+$/, '');
	    }

	    if (!isFirstLine) {
	      utils.append(line.match(/^[ \t]*/)[0], state);
	    }

	    if (trimmedLine || isLastNonEmptyLine) {
	      utils.append(
	        JSON.stringify(trimmedLine) +
	        (!isLastNonEmptyLine ? ' + \' \' +' : ''),
	        state);

	      if (isLastNonEmptyLine) {
	        if (end) {
	          utils.append(end, state);
	        }
	        if (!isLast) {
	          utils.append(', ', state);
	        }
	      }

	      // only restore tail whitespace if line had literals
	      if (trimmedLine && !isLastLine) {
	        utils.append(line.match(/[ \t]*$/)[0], state);
	      }
	    }

	    if (!isLastLine) {
	      utils.append('\n', state);
	    }
	  });

	  utils.move(object.range[1], state);
	}

	function renderJSXExpressionContainer(traverse, object, isLast, path, state) {
	  // Plus 1 to skip `{`.
	  utils.move(object.range[0] + 1, state);
	  utils.catchup(object.expression.range[0], state);
	  traverse(object.expression, path, state);

	  if (!isLast && object.expression.type !== Syntax.JSXEmptyExpression) {
	    // If we need to append a comma, make sure to do so after the expression.
	    utils.catchup(object.expression.range[1], state, trimLeft);
	    utils.append(', ', state);
	  }

	  // Minus 1 to skip `}`.
	  utils.catchup(object.range[1] - 1, state, trimLeft);
	  utils.move(object.range[1], state);
	  return false;
	}

	function quoteAttrName(attr) {
	  // Quote invalid JS identifiers.
	  if (!/^[a-z_$][a-z\d_$]*$/i.test(attr)) {
	    return '"' + attr + '"';
	  }
	  return attr;
	}

	function trimLeft(value) {
	  return value.replace(/^[ ]+/, '');
	}

	exports.renderJSXExpressionContainer = renderJSXExpressionContainer;
	exports.renderJSXLiteral = renderJSXLiteral;
	exports.quoteAttrName = quoteAttrName;
	exports.trimLeft = trimLeft;


/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
	  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
	  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
	  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
	  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
	  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
	  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:

	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.

	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	(function (root, factory) {
	    'use strict';

	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	    // Rhino, and plain browser loading.

	    /* istanbul ignore next */
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== 'undefined') {
	        factory(exports);
	    } else {
	        factory((root.esprima = {}));
	    }
	}(this, function (exports) {
	    'use strict';

	    var Token,
	        TokenName,
	        FnExprTokens,
	        Syntax,
	        PropertyKind,
	        Messages,
	        Regex,
	        SyntaxTreeDelegate,
	        XHTMLEntities,
	        ClassPropertyType,
	        source,
	        strict,
	        index,
	        lineNumber,
	        lineStart,
	        length,
	        delegate,
	        lookahead,
	        state,
	        extra;

	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8,
	        RegularExpression: 9,
	        Template: 10,
	        JSXIdentifier: 11,
	        JSXText: 12
	    };

	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';
	    TokenName[Token.JSXIdentifier] = 'JSXIdentifier';
	    TokenName[Token.JSXText] = 'JSXText';
	    TokenName[Token.RegularExpression] = 'RegularExpression';

	    // A function following one of those tokens is an expression.
	    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
	                    'return', 'case', 'delete', 'throw', 'void',
	                    // assignment operators
	                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
	                    '&=', '|=', '^=', ',',
	                    // binary/unary operators
	                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
	                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
	                    '<=', '<', '>', '!=', '!=='];

	    Syntax = {
	        AnyTypeAnnotation: 'AnyTypeAnnotation',
	        ArrayExpression: 'ArrayExpression',
	        ArrayPattern: 'ArrayPattern',
	        ArrayTypeAnnotation: 'ArrayTypeAnnotation',
	        ArrowFunctionExpression: 'ArrowFunctionExpression',
	        AssignmentExpression: 'AssignmentExpression',
	        BinaryExpression: 'BinaryExpression',
	        BlockStatement: 'BlockStatement',
	        BooleanTypeAnnotation: 'BooleanTypeAnnotation',
	        BreakStatement: 'BreakStatement',
	        CallExpression: 'CallExpression',
	        CatchClause: 'CatchClause',
	        ClassBody: 'ClassBody',
	        ClassDeclaration: 'ClassDeclaration',
	        ClassExpression: 'ClassExpression',
	        ClassImplements: 'ClassImplements',
	        ClassProperty: 'ClassProperty',
	        ComprehensionBlock: 'ComprehensionBlock',
	        ComprehensionExpression: 'ComprehensionExpression',
	        ConditionalExpression: 'ConditionalExpression',
	        ContinueStatement: 'ContinueStatement',
	        DebuggerStatement: 'DebuggerStatement',
	        DeclareClass: 'DeclareClass',
	        DeclareFunction: 'DeclareFunction',
	        DeclareModule: 'DeclareModule',
	        DeclareVariable: 'DeclareVariable',
	        DoWhileStatement: 'DoWhileStatement',
	        EmptyStatement: 'EmptyStatement',
	        ExportDeclaration: 'ExportDeclaration',
	        ExportBatchSpecifier: 'ExportBatchSpecifier',
	        ExportSpecifier: 'ExportSpecifier',
	        ExpressionStatement: 'ExpressionStatement',
	        ForInStatement: 'ForInStatement',
	        ForOfStatement: 'ForOfStatement',
	        ForStatement: 'ForStatement',
	        FunctionDeclaration: 'FunctionDeclaration',
	        FunctionExpression: 'FunctionExpression',
	        FunctionTypeAnnotation: 'FunctionTypeAnnotation',
	        FunctionTypeParam: 'FunctionTypeParam',
	        GenericTypeAnnotation: 'GenericTypeAnnotation',
	        Identifier: 'Identifier',
	        IfStatement: 'IfStatement',
	        ImportDeclaration: 'ImportDeclaration',
	        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
	        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
	        ImportSpecifier: 'ImportSpecifier',
	        InterfaceDeclaration: 'InterfaceDeclaration',
	        InterfaceExtends: 'InterfaceExtends',
	        IntersectionTypeAnnotation: 'IntersectionTypeAnnotation',
	        LabeledStatement: 'LabeledStatement',
	        Literal: 'Literal',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        MethodDefinition: 'MethodDefinition',
	        ModuleSpecifier: 'ModuleSpecifier',
	        NewExpression: 'NewExpression',
	        NullableTypeAnnotation: 'NullableTypeAnnotation',
	        NumberTypeAnnotation: 'NumberTypeAnnotation',
	        ObjectExpression: 'ObjectExpression',
	        ObjectPattern: 'ObjectPattern',
	        ObjectTypeAnnotation: 'ObjectTypeAnnotation',
	        ObjectTypeCallProperty: 'ObjectTypeCallProperty',
	        ObjectTypeIndexer: 'ObjectTypeIndexer',
	        ObjectTypeProperty: 'ObjectTypeProperty',
	        Program: 'Program',
	        Property: 'Property',
	        QualifiedTypeIdentifier: 'QualifiedTypeIdentifier',
	        ReturnStatement: 'ReturnStatement',
	        SequenceExpression: 'SequenceExpression',
	        SpreadElement: 'SpreadElement',
	        SpreadProperty: 'SpreadProperty',
	        StringLiteralTypeAnnotation: 'StringLiteralTypeAnnotation',
	        StringTypeAnnotation: 'StringTypeAnnotation',
	        SwitchCase: 'SwitchCase',
	        SwitchStatement: 'SwitchStatement',
	        TaggedTemplateExpression: 'TaggedTemplateExpression',
	        TemplateElement: 'TemplateElement',
	        TemplateLiteral: 'TemplateLiteral',
	        ThisExpression: 'ThisExpression',
	        ThrowStatement: 'ThrowStatement',
	        TupleTypeAnnotation: 'TupleTypeAnnotation',
	        TryStatement: 'TryStatement',
	        TypeAlias: 'TypeAlias',
	        TypeAnnotation: 'TypeAnnotation',
	        TypeCastExpression: 'TypeCastExpression',
	        TypeofTypeAnnotation: 'TypeofTypeAnnotation',
	        TypeParameterDeclaration: 'TypeParameterDeclaration',
	        TypeParameterInstantiation: 'TypeParameterInstantiation',
	        UnaryExpression: 'UnaryExpression',
	        UnionTypeAnnotation: 'UnionTypeAnnotation',
	        UpdateExpression: 'UpdateExpression',
	        VariableDeclaration: 'VariableDeclaration',
	        VariableDeclarator: 'VariableDeclarator',
	        VoidTypeAnnotation: 'VoidTypeAnnotation',
	        WhileStatement: 'WhileStatement',
	        WithStatement: 'WithStatement',
	        JSXIdentifier: 'JSXIdentifier',
	        JSXNamespacedName: 'JSXNamespacedName',
	        JSXMemberExpression: 'JSXMemberExpression',
	        JSXEmptyExpression: 'JSXEmptyExpression',
	        JSXExpressionContainer: 'JSXExpressionContainer',
	        JSXElement: 'JSXElement',
	        JSXClosingElement: 'JSXClosingElement',
	        JSXOpeningElement: 'JSXOpeningElement',
	        JSXAttribute: 'JSXAttribute',
	        JSXSpreadAttribute: 'JSXSpreadAttribute',
	        JSXText: 'JSXText',
	        YieldExpression: 'YieldExpression',
	        AwaitExpression: 'AwaitExpression'
	    };

	    PropertyKind = {
	        Data: 1,
	        Get: 2,
	        Set: 4
	    };

	    ClassPropertyType = {
	        'static': 'static',
	        prototype: 'prototype'
	    };

	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken: 'Unexpected token %0',
	        UnexpectedNumber: 'Unexpected number',
	        UnexpectedString: 'Unexpected string',
	        UnexpectedIdentifier: 'Unexpected identifier',
	        UnexpectedReserved: 'Unexpected reserved word',
	        UnexpectedTemplate: 'Unexpected quasi %0',
	        UnexpectedEOS: 'Unexpected end of input',
	        NewlineAfterThrow: 'Illegal newline after throw',
	        InvalidRegExp: 'Invalid regular expression',
	        UnterminatedRegExp: 'Invalid regular expression: missing /',
	        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
	        InvalidLHSInFormalsList: 'Invalid left-hand side in formals list',
	        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
	        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
	        NoCatchOrFinally: 'Missing catch or finally after try',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared',
	        IllegalContinue: 'Illegal continue statement',
	        IllegalBreak: 'Illegal break statement',
	        IllegalDuplicateClassProperty: 'Illegal duplicate property in class definition',
	        IllegalClassConstructorProperty: 'Illegal constructor property in class definition',
	        IllegalReturn: 'Illegal return statement',
	        IllegalSpread: 'Illegal spread element',
	        StrictModeWith: 'Strict mode code may not include a with statement',
	        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
	        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
	        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
	        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
	        ParameterAfterRestParameter: 'Rest parameter must be final parameter of an argument list',
	        DefaultRestParameter: 'Rest parameter can not have a default value',
	        ElementAfterSpreadElement: 'Spread must be the final element of an element list',
	        PropertyAfterSpreadProperty: 'A rest property must be the final property of an object literal',
	        ObjectPatternAsRestParameter: 'Invalid rest parameter',
	        ObjectPatternAsSpread: 'Invalid spread argument',
	        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
	        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
	        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
	        StrictDuplicateProperty: 'Duplicate data property in object literal not allowed in strict mode',
	        AccessorDataProperty: 'Object literal may not have data and accessor property with the same name',
	        AccessorGetSet: 'Object literal may not have multiple get/set accessors with the same name',
	        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
	        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictReservedWord: 'Use of future reserved word in strict mode',
	        MissingFromClause: 'Missing from clause',
	        NoAsAfterImportNamespace: 'Missing as after import *',
	        InvalidModuleSpecifier: 'Invalid module specifier',
	        IllegalImportDeclaration: 'Illegal import declaration',
	        IllegalExportDeclaration: 'Illegal export declaration',
	        NoUninitializedConst: 'Const must be initialized',
	        ComprehensionRequiresBlock: 'Comprehension must have at least one block',
	        ComprehensionError: 'Comprehension Error',
	        EachNotAllowed: 'Each is not supported',
	        InvalidJSXAttributeValue: 'JSX value should be either an expression or a quoted JSX text',
	        ExpectedJSXClosingTag: 'Expected corresponding JSX closing tag for %0',
	        AdjacentJSXElements: 'Adjacent JSX elements must be wrapped in an enclosing tag',
	        ConfusedAboutFunctionType: 'Unexpected token =>. It looks like ' +
	            'you are trying to write a function type, but you ended up ' +
	            'writing a grouped type followed by an =>, which is a syntax ' +
	            'error. Remember, function type parameters are named so function ' +
	            'types look like (name1: type1, name2: type2) => returnType. You ' +
	            'probably wrote (type1) => returnType'
	    };

	    // See also tools/generate-unicode-regex.py.
	    Regex = {
	        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
	        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
	        LeadingZeros: new RegExp('^0+(?!$)')
	    };

	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.

	    function assert(condition, message) {
	        /* istanbul ignore if */
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }

	    function StringMap() {
	        this.$data = {};
	    }

	    StringMap.prototype.get = function (key) {
	        key = '$' + key;
	        return this.$data[key];
	    };

	    StringMap.prototype.set = function (key, value) {
	        key = '$' + key;
	        this.$data[key] = value;
	        return this;
	    };

	    StringMap.prototype.has = function (key) {
	        key = '$' + key;
	        return Object.prototype.hasOwnProperty.call(this.$data, key);
	    };

	    StringMap.prototype.delete = function (key) {
	        key = '$' + key;
	        return delete this.$data[key];
	    };

	    function isDecimalDigit(ch) {
	        return (ch >= 48 && ch <= 57);   // 0..9
	    }

	    function isHexDigit(ch) {
	        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
	    }

	    function isOctalDigit(ch) {
	        return '01234567'.indexOf(ch) >= 0;
	    }


	    // 7.2 White Space

	    function isWhiteSpace(ch) {
	        return (ch === 32) ||  // space
	            (ch === 9) ||      // tab
	            (ch === 0xB) ||
	            (ch === 0xC) ||
	            (ch === 0xA0) ||
	            (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
	    }

	    // 7.3 Line Terminators

	    function isLineTerminator(ch) {
	        return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
	    }

	    // 7.6 Identifier Names and Identifiers

	    function isIdentifierStart(ch) {
	        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
	            (ch >= 65 && ch <= 90) ||         // A..Z
	            (ch >= 97 && ch <= 122) ||        // a..z
	            (ch === 92) ||                    // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
	    }

	    function isIdentifierPart(ch) {
	        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
	            (ch >= 65 && ch <= 90) ||         // A..Z
	            (ch >= 97 && ch <= 122) ||        // a..z
	            (ch >= 48 && ch <= 57) ||         // 0..9
	            (ch === 92) ||                    // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
	    }

	    // 7.6.1.2 Future Reserved Words

	    function isFutureReservedWord(id) {
	        switch (id) {
	        case 'class':
	        case 'enum':
	        case 'export':
	        case 'extends':
	        case 'import':
	        case 'super':
	            return true;
	        default:
	            return false;
	        }
	    }

	    function isStrictModeReservedWord(id) {
	        switch (id) {
	        case 'implements':
	        case 'interface':
	        case 'package':
	        case 'private':
	        case 'protected':
	        case 'public':
	        case 'static':
	        case 'yield':
	        case 'let':
	            return true;
	        default:
	            return false;
	        }
	    }

	    function isRestrictedWord(id) {
	        return id === 'eval' || id === 'arguments';
	    }

	    // 7.6.1.1 Keywords

	    function isKeyword(id) {
	        if (strict && isStrictModeReservedWord(id)) {
	            return true;
	        }

	        // 'const' is specialized as Keyword in V8.
	        // 'yield' is only treated as a keyword in strict mode.
	        // 'let' is for compatiblity with SpiderMonkey and ES.next.
	        // Some others are from future reserved words.

	        switch (id.length) {
	        case 2:
	            return (id === 'if') || (id === 'in') || (id === 'do');
	        case 3:
	            return (id === 'var') || (id === 'for') || (id === 'new') ||
	                (id === 'try') || (id === 'let');
	        case 4:
	            return (id === 'this') || (id === 'else') || (id === 'case') ||
	                (id === 'void') || (id === 'with') || (id === 'enum');
	        case 5:
	            return (id === 'while') || (id === 'break') || (id === 'catch') ||
	                (id === 'throw') || (id === 'const') ||
	                (id === 'class') || (id === 'super');
	        case 6:
	            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
	                (id === 'switch') || (id === 'export') || (id === 'import');
	        case 7:
	            return (id === 'default') || (id === 'finally') || (id === 'extends');
	        case 8:
	            return (id === 'function') || (id === 'continue') || (id === 'debugger');
	        case 10:
	            return (id === 'instanceof');
	        default:
	            return false;
	        }
	    }

	    // 7.4 Comments

	    function addComment(type, value, start, end, loc) {
	        var comment;
	        assert(typeof start === 'number', 'Comment must have valid position');

	        // Because the way the actual token is scanned, often the comments
	        // (if any) are skipped twice during the lexical analysis.
	        // Thus, we need to skip adding a comment if the comment array already
	        // handled it.
	        if (state.lastCommentStart >= start) {
	            return;
	        }
	        state.lastCommentStart = start;

	        comment = {
	            type: type,
	            value: value
	        };
	        if (extra.range) {
	            comment.range = [start, end];
	        }
	        if (extra.loc) {
	            comment.loc = loc;
	        }
	        extra.comments.push(comment);
	        if (extra.attachComment) {
	            extra.leadingComments.push(comment);
	            extra.trailingComments.push(comment);
	        }
	    }

	    function skipSingleLineComment() {
	        var start, loc, ch, comment;

	        start = index - 2;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart - 2
	            }
	        };

	        while (index < length) {
	            ch = source.charCodeAt(index);
	            ++index;
	            if (isLineTerminator(ch)) {
	                if (extra.comments) {
	                    comment = source.slice(start + 2, index - 1);
	                    loc.end = {
	                        line: lineNumber,
	                        column: index - lineStart - 1
	                    };
	                    addComment('Line', comment, start, index - 1, loc);
	                }
	                if (ch === 13 && source.charCodeAt(index) === 10) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	                return;
	            }
	        }

	        if (extra.comments) {
	            comment = source.slice(start + 2, index);
	            loc.end = {
	                line: lineNumber,
	                column: index - lineStart
	            };
	            addComment('Line', comment, start, index, loc);
	        }
	    }

	    function skipMultiLineComment() {
	        var start, loc, ch, comment;

	        if (extra.comments) {
	            start = index - 2;
	            loc = {
	                start: {
	                    line: lineNumber,
	                    column: index - lineStart - 2
	                }
	            };
	        }

	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (isLineTerminator(ch)) {
	                if (ch === 13 && source.charCodeAt(index + 1) === 10) {
	                    ++index;
	                }
	                ++lineNumber;
	                ++index;
	                lineStart = index;
	                if (index >= length) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            } else if (ch === 42) {
	                // Block comment ends with '*/' (char #42, char #47).
	                if (source.charCodeAt(index + 1) === 47) {
	                    ++index;
	                    ++index;
	                    if (extra.comments) {
	                        comment = source.slice(start + 2, index - 2);
	                        loc.end = {
	                            line: lineNumber,
	                            column: index - lineStart
	                        };
	                        addComment('Block', comment, start, index, loc);
	                    }
	                    return;
	                }
	                ++index;
	            } else {
	                ++index;
	            }
	        }

	        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	    }

	    function skipComment() {
	        var ch;

	        while (index < length) {
	            ch = source.charCodeAt(index);

	            if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch === 13 && source.charCodeAt(index) === 10) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	            } else if (ch === 47) { // 47 is '/'
	                ch = source.charCodeAt(index + 1);
	                if (ch === 47) {
	                    ++index;
	                    ++index;
	                    skipSingleLineComment();
	                } else if (ch === 42) {  // 42 is '*'
	                    ++index;
	                    ++index;
	                    skipMultiLineComment();
	                } else {
	                    break;
	                }
	            } else {
	                break;
	            }
	        }
	    }

	    function scanHexEscape(prefix) {
	        var i, len, ch, code = 0;

	        len = (prefix === 'u') ? 4 : 2;
	        for (i = 0; i < len; ++i) {
	            if (index < length && isHexDigit(source[index])) {
	                ch = source[index++];
	                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	            } else {
	                return '';
	            }
	        }
	        return String.fromCharCode(code);
	    }

	    function scanUnicodeCodePointEscape() {
	        var ch, code, cu1, cu2;

	        ch = source[index];
	        code = 0;

	        // At least, one hex digit is required.
	        if (ch === '}') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        while (index < length) {
	            ch = source[index++];
	            if (!isHexDigit(ch)) {
	                break;
	            }
	            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	        }

	        if (code > 0x10FFFF || ch !== '}') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        // UTF-16 Encoding
	        if (code <= 0xFFFF) {
	            return String.fromCharCode(code);
	        }
	        cu1 = ((code - 0x10000) >> 10) + 0xD800;
	        cu2 = ((code - 0x10000) & 1023) + 0xDC00;
	        return String.fromCharCode(cu1, cu2);
	    }

	    function getEscapedIdentifier() {
	        var ch, id;

	        ch = source.charCodeAt(index++);
	        id = String.fromCharCode(ch);

	        // '\u' (char #92, char #117) denotes an escaped character.
	        if (ch === 92) {
	            if (source.charCodeAt(index) !== 117) {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	            ++index;
	            ch = scanHexEscape('u');
	            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	            id = ch;
	        }

	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (!isIdentifierPart(ch)) {
	                break;
	            }
	            ++index;
	            id += String.fromCharCode(ch);

	            // '\u' (char #92, char #117) denotes an escaped character.
	            if (ch === 92) {
	                id = id.substr(0, id.length - 1);
	                if (source.charCodeAt(index) !== 117) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	                ++index;
	                ch = scanHexEscape('u');
	                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	                id += ch;
	            }
	        }

	        return id;
	    }

	    function getIdentifier() {
	        var start, ch;

	        start = index++;
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (ch === 92) {
	                // Blackslash (char #92) marks Unicode escape sequence.
	                index = start;
	                return getEscapedIdentifier();
	            }
	            if (isIdentifierPart(ch)) {
	                ++index;
	            } else {
	                break;
	            }
	        }

	        return source.slice(start, index);
	    }

	    function scanIdentifier() {
	        var start, id, type;

	        start = index;

	        // Backslash (char #92) starts an escaped character.
	        id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();

	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            type = Token.Identifier;
	        } else if (isKeyword(id)) {
	            type = Token.Keyword;
	        } else if (id === 'null') {
	            type = Token.NullLiteral;
	        } else if (id === 'true' || id === 'false') {
	            type = Token.BooleanLiteral;
	        } else {
	            type = Token.Identifier;
	        }

	        return {
	            type: type,
	            value: id,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }


	    // 7.7 Punctuators

	    function scanPunctuator() {
	        var start = index,
	            code = source.charCodeAt(index),
	            code2,
	            ch1 = source[index],
	            ch2,
	            ch3,
	            ch4;

	        if (state.inJSXTag || state.inJSXChild) {
	            // Don't need to check for '{' and '}' as it's already handled
	            // correctly by default.
	            switch (code) {
	            case 60:  // <
	            case 62:  // >
	                ++index;
	                return {
	                    type: Token.Punctuator,
	                    value: String.fromCharCode(code),
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }

	        switch (code) {
	        // Check for most common single-character punctuators.
	        case 40:   // ( open bracket
	        case 41:   // ) close bracket
	        case 59:   // ; semicolon
	        case 44:   // , comma
	        case 123:  // { open curly brace
	        case 125:  // } close curly brace
	        case 91:   // [
	        case 93:   // ]
	        case 58:   // :
	        case 63:   // ?
	        case 126:  // ~
	            ++index;
	            if (extra.tokenize) {
	                if (code === 40) {
	                    extra.openParenToken = extra.tokens.length;
	                } else if (code === 123) {
	                    extra.openCurlyToken = extra.tokens.length;
	                }
	            }
	            return {
	                type: Token.Punctuator,
	                value: String.fromCharCode(code),
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };

	        default:
	            code2 = source.charCodeAt(index + 1);

	            // '=' (char #61) marks an assignment or comparison operator.
	            if (code2 === 61) {
	                switch (code) {
	                case 37:  // %
	                case 38:  // &
	                case 42:  // *:
	                case 43:  // +
	                case 45:  // -
	                case 47:  // /
	                case 60:  // <
	                case 62:  // >
	                case 94:  // ^
	                case 124: // |
	                    index += 2;
	                    return {
	                        type: Token.Punctuator,
	                        value: String.fromCharCode(code) + String.fromCharCode(code2),
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };

	                case 33: // !
	                case 61: // =
	                    index += 2;

	                    // !== and ===
	                    if (source.charCodeAt(index) === 61) {
	                        ++index;
	                    }
	                    return {
	                        type: Token.Punctuator,
	                        value: source.slice(start, index),
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };
	                default:
	                    break;
	                }
	            }
	            break;
	        }

	        // Peek more characters.

	        ch2 = source[index + 1];
	        ch3 = source[index + 2];
	        ch4 = source[index + 3];

	        // 4-character punctuator: >>>=

	        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
	            if (ch4 === '=') {
	                index += 4;
	                return {
	                    type: Token.Punctuator,
	                    value: '>>>=',
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }

	        // 3-character punctuators: === !== >>> <<= >>=

	        if (ch1 === '>' && ch2 === '>' && ch3 === '>' && !state.inType) {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>>',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '<<=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '.' && ch2 === '.' && ch3 === '.') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '...',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        // Other 2-character punctuators: ++ -- << >> && ||

	        // Don't match these tokens if we're in a type, since they never can
	        // occur and can mess up types like Map<string, Array<string>>
	        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0) && !state.inType) {
	            index += 2;
	            return {
	                type: Token.Punctuator,
	                value: ch1 + ch2,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '=' && ch2 === '>') {
	            index += 2;
	            return {
	                type: Token.Punctuator,
	                value: '=>',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        if (ch1 === '.') {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	    }

	    // 7.8.3 Numeric Literals

	    function scanHexLiteral(start) {
	        var number = '';

	        while (index < length) {
	            if (!isHexDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }

	        if (number.length === 0) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseInt('0x' + number, 16),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanBinaryLiteral(start) {
	        var ch, number;

	        number = '';

	        while (index < length) {
	            ch = source[index];
	            if (ch !== '0' && ch !== '1') {
	                break;
	            }
	            number += source[index++];
	        }

	        if (number.length === 0) {
	            // only 0b or 0B
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        if (index < length) {
	            ch = source.charCodeAt(index);
	            /* istanbul ignore else */
	            if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 2),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanOctalLiteral(prefix, start) {
	        var number, octal;

	        if (isOctalDigit(prefix)) {
	            octal = true;
	            number = '0' + source[index++];
	        } else {
	            octal = false;
	            ++index;
	            number = '';
	        }

	        while (index < length) {
	            if (!isOctalDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }

	        if (!octal && number.length === 0) {
	            // only 0o or 0O
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 8),
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanNumericLiteral() {
	        var number, start, ch;

	        ch = source[index];
	        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');

	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];

	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            // Octal number in ES6 starts with '0o'.
	            // Binary number in ES6 starts with '0b'.
	            if (number === '0') {
	                if (ch === 'x' || ch === 'X') {
	                    ++index;
	                    return scanHexLiteral(start);
	                }
	                if (ch === 'b' || ch === 'B') {
	                    ++index;
	                    return scanBinaryLiteral(start);
	                }
	                if (ch === 'o' || ch === 'O' || isOctalDigit(ch)) {
	                    return scanOctalLiteral(ch, start);
	                }
	                // decimal number starts with '0' such as '09' is illegal.
	                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            }

	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }

	        if (ch === '.') {
	            number += source[index++];
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }

	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];

	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	            if (isDecimalDigit(source.charCodeAt(index))) {
	                while (isDecimalDigit(source.charCodeAt(index))) {
	                    number += source[index++];
	                }
	            } else {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }

	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    // 7.8.4 String Literals

	    function scanStringLiteral() {
	        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');

	        start = index;
	        ++index;

	        while (index < length) {
	            ch = source[index++];

	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'u':
	                    case 'x':
	                        if (source[index] === '{') {
	                            ++index;
	                            str += scanUnicodeCodePointEscape();
	                        } else {
	                            restore = index;
	                            unescaped = scanHexEscape(ch);
	                            if (unescaped) {
	                                str += unescaped;
	                            } else {
	                                index = restore;
	                                str += ch;
	                            }
	                        }
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;

	                    default:
	                        if (isOctalDigit(ch)) {
	                            code = '01234567'.indexOf(ch);

	                            // \0 is not octal escape sequence
	                            if (code !== 0) {
	                                octal = true;
	                            }

	                            /* istanbul ignore else */
	                            if (index < length && isOctalDigit(source[index])) {
	                                octal = true;
	                                code = code * 8 + '01234567'.indexOf(source[index++]);

	                                // 3 digits are only allowed when string starts
	                                // with 0, 1, 2, 3
	                                if ('0123'.indexOf(ch) >= 0 &&
	                                        index < length &&
	                                        isOctalDigit(source[index])) {
	                                    code = code * 8 + '01234567'.indexOf(source[index++]);
	                                }
	                            }
	                            str += String.fromCharCode(code);
	                        } else {
	                            str += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    lineStart = index;
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                break;
	            } else {
	                str += ch;
	            }
	        }

	        if (quote !== '') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanTemplate() {
	        var cooked = '', ch, start, terminated, tail, restore, unescaped, code, octal;

	        terminated = false;
	        tail = false;
	        start = index;

	        ++index;

	        while (index < length) {
	            ch = source[index++];
	            if (ch === '`') {
	                tail = true;
	                terminated = true;
	                break;
	            } else if (ch === '$') {
	                if (source[index] === '{') {
	                    ++index;
	                    terminated = true;
	                    break;
	                }
	                cooked += ch;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'n':
	                        cooked += '\n';
	                        break;
	                    case 'r':
	                        cooked += '\r';
	                        break;
	                    case 't':
	                        cooked += '\t';
	                        break;
	                    case 'u':
	                    case 'x':
	                        if (source[index] === '{') {
	                            ++index;
	                            cooked += scanUnicodeCodePointEscape();
	                        } else {
	                            restore = index;
	                            unescaped = scanHexEscape(ch);
	                            if (unescaped) {
	                                cooked += unescaped;
	                            } else {
	                                index = restore;
	                                cooked += ch;
	                            }
	                        }
	                        break;
	                    case 'b':
	                        cooked += '\b';
	                        break;
	                    case 'f':
	                        cooked += '\f';
	                        break;
	                    case 'v':
	                        cooked += '\v';
	                        break;

	                    default:
	                        if (isOctalDigit(ch)) {
	                            code = '01234567'.indexOf(ch);

	                            // \0 is not octal escape sequence
	                            if (code !== 0) {
	                                octal = true;
	                            }

	                            /* istanbul ignore else */
	                            if (index < length && isOctalDigit(source[index])) {
	                                octal = true;
	                                code = code * 8 + '01234567'.indexOf(source[index++]);

	                                // 3 digits are only allowed when string starts
	                                // with 0, 1, 2, 3
	                                if ('0123'.indexOf(ch) >= 0 &&
	                                        index < length &&
	                                        isOctalDigit(source[index])) {
	                                    code = code * 8 + '01234567'.indexOf(source[index++]);
	                                }
	                            }
	                            cooked += String.fromCharCode(code);
	                        } else {
	                            cooked += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    lineStart = index;
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                ++lineNumber;
	                if (ch === '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                lineStart = index;
	                cooked += '\n';
	            } else {
	                cooked += ch;
	            }
	        }

	        if (!terminated) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.Template,
	            value: {
	                cooked: cooked,
	                raw: source.slice(start + 1, index - ((tail) ? 1 : 2))
	            },
	            tail: tail,
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanTemplateElement(option) {
	        var startsWith, template;

	        lookahead = null;
	        skipComment();

	        startsWith = (option.head) ? '`' : '}';

	        if (source[index] !== startsWith) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        template = scanTemplate();

	        peek();

	        return template;
	    }

	    function testRegExp(pattern, flags) {
	        var tmp = pattern,
	            value;

	        if (flags.indexOf('u') >= 0) {
	            // Replace each astral symbol and every Unicode code point
	            // escape sequence with a single ASCII symbol to avoid throwing on
	            // regular expressions that are only valid in combination with the
	            // `/u` flag.
	            // Note: replacing with the ASCII symbol `x` might cause false
	            // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
	            // perfectly valid pattern that is equivalent to `[a-b]`, but it
	            // would be replaced by `[x-b]` which throws an error.
	            tmp = tmp
	                .replace(/\\u\{([0-9a-fA-F]+)\}/g, function ($0, $1) {
	                    if (parseInt($1, 16) <= 0x10FFFF) {
	                        return 'x';
	                    }
	                    throwError({}, Messages.InvalidRegExp);
	                })
	                .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, 'x');
	        }

	        // First, detect invalid regular expressions.
	        try {
	            value = new RegExp(tmp);
	        } catch (e) {
	            throwError({}, Messages.InvalidRegExp);
	        }

	        // Return a regular expression object for this pattern-flag pair, or
	        // `null` in case the current environment doesn't support the flags it
	        // uses.
	        try {
	            return new RegExp(pattern, flags);
	        } catch (exception) {
	            return null;
	        }
	    }

	    function scanRegExpBody() {
	        var ch, str, classMarker, terminated, body;

	        ch = source[index];
	        assert(ch === '/', 'Regular expression literal must start with a slash');
	        str = source[index++];

	        classMarker = false;
	        terminated = false;
	        while (index < length) {
	            ch = source[index++];
	            str += ch;
	            if (ch === '\\') {
	                ch = source[index++];
	                // ECMA-262 7.8.5
	                if (isLineTerminator(ch.charCodeAt(0))) {
	                    throwError({}, Messages.UnterminatedRegExp);
	                }
	                str += ch;
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                throwError({}, Messages.UnterminatedRegExp);
	            } else if (classMarker) {
	                if (ch === ']') {
	                    classMarker = false;
	                }
	            } else {
	                if (ch === '/') {
	                    terminated = true;
	                    break;
	                } else if (ch === '[') {
	                    classMarker = true;
	                }
	            }
	        }

	        if (!terminated) {
	            throwError({}, Messages.UnterminatedRegExp);
	        }

	        // Exclude leading and trailing slash.
	        body = str.substr(1, str.length - 2);
	        return {
	            value: body,
	            literal: str
	        };
	    }

	    function scanRegExpFlags() {
	        var ch, str, flags, restore;

	        str = '';
	        flags = '';
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch.charCodeAt(0))) {
	                break;
	            }

	            ++index;
	            if (ch === '\\' && index < length) {
	                ch = source[index];
	                if (ch === 'u') {
	                    ++index;
	                    restore = index;
	                    ch = scanHexEscape('u');
	                    if (ch) {
	                        flags += ch;
	                        for (str += '\\u'; restore < index; ++restore) {
	                            str += source[restore];
	                        }
	                    } else {
	                        index = restore;
	                        flags += 'u';
	                        str += '\\u';
	                    }
	                    throwErrorTolerant({}, Messages.UnexpectedToken, 'ILLEGAL');
	                } else {
	                    str += '\\';
	                    throwErrorTolerant({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            } else {
	                flags += ch;
	                str += ch;
	            }
	        }

	        return {
	            value: flags,
	            literal: str
	        };
	    }

	    function scanRegExp() {
	        var start, body, flags, value;

	        lookahead = null;
	        skipComment();
	        start = index;

	        body = scanRegExpBody();
	        flags = scanRegExpFlags();
	        value = testRegExp(body.value, flags.value);

	        if (extra.tokenize) {
	            return {
	                type: Token.RegularExpression,
	                value: value,
	                regex: {
	                    pattern: body.value,
	                    flags: flags.value
	                },
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }

	        return {
	            literal: body.literal + flags.literal,
	            value: value,
	            regex: {
	                pattern: body.value,
	                flags: flags.value
	            },
	            range: [start, index]
	        };
	    }

	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }

	    function advanceSlash() {
	        var prevToken,
	            checkToken;
	        // Using the following algorithm:
	        // https://github.com/mozilla/sweet.js/wiki/design
	        prevToken = extra.tokens[extra.tokens.length - 1];
	        if (!prevToken) {
	            // Nothing before that: it cannot be a division.
	            return scanRegExp();
	        }
	        if (prevToken.type === 'Punctuator') {
	            if (prevToken.value === ')') {
	                checkToken = extra.tokens[extra.openParenToken - 1];
	                if (checkToken &&
	                        checkToken.type === 'Keyword' &&
	                        (checkToken.value === 'if' ||
	                         checkToken.value === 'while' ||
	                         checkToken.value === 'for' ||
	                         checkToken.value === 'with')) {
	                    return scanRegExp();
	                }
	                return scanPunctuator();
	            }
	            if (prevToken.value === '}') {
	                // Dividing a function by anything makes little sense,
	                // but we have to check for that.
	                if (extra.tokens[extra.openCurlyToken - 3] &&
	                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
	                    // Anonymous function.
	                    checkToken = extra.tokens[extra.openCurlyToken - 4];
	                    if (!checkToken) {
	                        return scanPunctuator();
	                    }
	                } else if (extra.tokens[extra.openCurlyToken - 4] &&
	                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
	                    // Named function.
	                    checkToken = extra.tokens[extra.openCurlyToken - 5];
	                    if (!checkToken) {
	                        return scanRegExp();
	                    }
	                } else {
	                    return scanPunctuator();
	                }
	                // checkToken determines whether the function is
	                // a declaration or an expression.
	                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
	                    // It is an expression.
	                    return scanPunctuator();
	                }
	                // It is a declaration.
	                return scanRegExp();
	            }
	            return scanRegExp();
	        }
	        if (prevToken.type === 'Keyword' && prevToken.value !== 'this') {
	            return scanRegExp();
	        }
	        return scanPunctuator();
	    }

	    function advance() {
	        var ch;

	        if (!state.inJSXChild) {
	            skipComment();
	        }

	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [index, index]
	            };
	        }

	        if (state.inJSXChild) {
	            return advanceJSXChild();
	        }

	        ch = source.charCodeAt(index);

	        // Very common: ( and ) and ;
	        if (ch === 40 || ch === 41 || ch === 58) {
	            return scanPunctuator();
	        }

	        // String literal starts with single quote (#39) or double quote (#34).
	        if (ch === 39 || ch === 34) {
	            if (state.inJSXTag) {
	                return scanJSXStringLiteral();
	            }
	            return scanStringLiteral();
	        }

	        if (state.inJSXTag && isJSXIdentifierStart(ch)) {
	            return scanJSXIdentifier();
	        }

	        if (ch === 96) {
	            return scanTemplate();
	        }
	        if (isIdentifierStart(ch)) {
	            return scanIdentifier();
	        }

	        // Dot (.) char #46 can also start a floating-point number, hence the need
	        // to check the next character.
	        if (ch === 46) {
	            if (isDecimalDigit(source.charCodeAt(index + 1))) {
	                return scanNumericLiteral();
	            }
	            return scanPunctuator();
	        }

	        if (isDecimalDigit(ch)) {
	            return scanNumericLiteral();
	        }

	        // Slash (/) char #47 can also start a regex.
	        if (extra.tokenize && ch === 47) {
	            return advanceSlash();
	        }

	        return scanPunctuator();
	    }

	    function lex() {
	        var token;

	        token = lookahead;
	        index = token.range[1];
	        lineNumber = token.lineNumber;
	        lineStart = token.lineStart;

	        lookahead = advance();

	        index = token.range[1];
	        lineNumber = token.lineNumber;
	        lineStart = token.lineStart;

	        return token;
	    }

	    function peek() {
	        var pos, line, start;

	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        lookahead = advance();
	        index = pos;
	        lineNumber = line;
	        lineStart = start;
	    }

	    function lookahead2() {
	        var adv, pos, line, start, result;

	        // If we are collecting the tokens, don't grab the next one yet.
	        /* istanbul ignore next */
	        adv = (typeof extra.advance === 'function') ? extra.advance : advance;

	        pos = index;
	        line = lineNumber;
	        start = lineStart;

	        // Scan for the next immediate token.
	        /* istanbul ignore if */
	        if (lookahead === null) {
	            lookahead = adv();
	        }
	        index = lookahead.range[1];
	        lineNumber = lookahead.lineNumber;
	        lineStart = lookahead.lineStart;

	        // Grab the token right after.
	        result = adv();
	        index = pos;
	        lineNumber = line;
	        lineStart = start;

	        return result;
	    }

	    function rewind(token) {
	        index = token.range[0];
	        lineNumber = token.lineNumber;
	        lineStart = token.lineStart;
	        lookahead = token;
	    }

	    function markerCreate() {
	        if (!extra.loc && !extra.range) {
	            return undefined;
	        }
	        skipComment();
	        return {offset: index, line: lineNumber, col: index - lineStart};
	    }

	    function markerCreatePreserveWhitespace() {
	        if (!extra.loc && !extra.range) {
	            return undefined;
	        }
	        return {offset: index, line: lineNumber, col: index - lineStart};
	    }

	    function processComment(node) {
	        var lastChild,
	            trailingComments,
	            bottomRight = extra.bottomRightStack,
	            last = bottomRight[bottomRight.length - 1];

	        if (node.type === Syntax.Program) {
	            /* istanbul ignore else */
	            if (node.body.length > 0) {
	                return;
	            }
	        }

	        if (extra.trailingComments.length > 0) {
	            if (extra.trailingComments[0].range[0] >= node.range[1]) {
	                trailingComments = extra.trailingComments;
	                extra.trailingComments = [];
	            } else {
	                extra.trailingComments.length = 0;
	            }
	        } else {
	            if (last && last.trailingComments && last.trailingComments[0].range[0] >= node.range[1]) {
	                trailingComments = last.trailingComments;
	                delete last.trailingComments;
	            }
	        }

	        // Eating the stack.
	        if (last) {
	            while (last && last.range[0] >= node.range[0]) {
	                lastChild = last;
	                last = bottomRight.pop();
	            }
	        }

	        if (lastChild) {
	            if (lastChild.leadingComments && lastChild.leadingComments[lastChild.leadingComments.length - 1].range[1] <= node.range[0]) {
	                node.leadingComments = lastChild.leadingComments;
	                delete lastChild.leadingComments;
	            }
	        } else if (extra.leadingComments.length > 0 && extra.leadingComments[extra.leadingComments.length - 1].range[1] <= node.range[0]) {
	            node.leadingComments = extra.leadingComments;
	            extra.leadingComments = [];
	        }

	        if (trailingComments) {
	            node.trailingComments = trailingComments;
	        }

	        bottomRight.push(node);
	    }

	    function markerApply(marker, node) {
	        if (extra.range) {
	            node.range = [marker.offset, index];
	        }
	        if (extra.loc) {
	            node.loc = {
	                start: {
	                    line: marker.line,
	                    column: marker.col
	                },
	                end: {
	                    line: lineNumber,
	                    column: index - lineStart
	                }
	            };
	            node = delegate.postProcess(node);
	        }
	        if (extra.attachComment) {
	            processComment(node);
	        }
	        return node;
	    }

	    SyntaxTreeDelegate = {

	        name: 'SyntaxTree',

	        postProcess: function (node) {
	            return node;
	        },

	        createArrayExpression: function (elements) {
	            return {
	                type: Syntax.ArrayExpression,
	                elements: elements
	            };
	        },

	        createAssignmentExpression: function (operator, left, right) {
	            return {
	                type: Syntax.AssignmentExpression,
	                operator: operator,
	                left: left,
	                right: right
	            };
	        },

	        createBinaryExpression: function (operator, left, right) {
	            var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :
	                        Syntax.BinaryExpression;
	            return {
	                type: type,
	                operator: operator,
	                left: left,
	                right: right
	            };
	        },

	        createBlockStatement: function (body) {
	            return {
	                type: Syntax.BlockStatement,
	                body: body
	            };
	        },

	        createBreakStatement: function (label) {
	            return {
	                type: Syntax.BreakStatement,
	                label: label
	            };
	        },

	        createCallExpression: function (callee, args) {
	            return {
	                type: Syntax.CallExpression,
	                callee: callee,
	                'arguments': args
	            };
	        },

	        createCatchClause: function (param, body) {
	            return {
	                type: Syntax.CatchClause,
	                param: param,
	                body: body
	            };
	        },

	        createConditionalExpression: function (test, consequent, alternate) {
	            return {
	                type: Syntax.ConditionalExpression,
	                test: test,
	                consequent: consequent,
	                alternate: alternate
	            };
	        },

	        createContinueStatement: function (label) {
	            return {
	                type: Syntax.ContinueStatement,
	                label: label
	            };
	        },

	        createDebuggerStatement: function () {
	            return {
	                type: Syntax.DebuggerStatement
	            };
	        },

	        createDoWhileStatement: function (body, test) {
	            return {
	                type: Syntax.DoWhileStatement,
	                body: body,
	                test: test
	            };
	        },

	        createEmptyStatement: function () {
	            return {
	                type: Syntax.EmptyStatement
	            };
	        },

	        createExpressionStatement: function (expression) {
	            return {
	                type: Syntax.ExpressionStatement,
	                expression: expression
	            };
	        },

	        createForStatement: function (init, test, update, body) {
	            return {
	                type: Syntax.ForStatement,
	                init: init,
	                test: test,
	                update: update,
	                body: body
	            };
	        },

	        createForInStatement: function (left, right, body) {
	            return {
	                type: Syntax.ForInStatement,
	                left: left,
	                right: right,
	                body: body,
	                each: false
	            };
	        },

	        createForOfStatement: function (left, right, body) {
	            return {
	                type: Syntax.ForOfStatement,
	                left: left,
	                right: right,
	                body: body
	            };
	        },

	        createFunctionDeclaration: function (id, params, defaults, body, rest, generator, expression,
	                                             isAsync, returnType, typeParameters) {
	            var funDecl = {
	                type: Syntax.FunctionDeclaration,
	                id: id,
	                params: params,
	                defaults: defaults,
	                body: body,
	                rest: rest,
	                generator: generator,
	                expression: expression,
	                returnType: returnType,
	                typeParameters: typeParameters
	            };

	            if (isAsync) {
	                funDecl.async = true;
	            }

	            return funDecl;
	        },

	        createFunctionExpression: function (id, params, defaults, body, rest, generator, expression,
	                                            isAsync, returnType, typeParameters) {
	            var funExpr = {
	                type: Syntax.FunctionExpression,
	                id: id,
	                params: params,
	                defaults: defaults,
	                body: body,
	                rest: rest,
	                generator: generator,
	                expression: expression,
	                returnType: returnType,
	                typeParameters: typeParameters
	            };

	            if (isAsync) {
	                funExpr.async = true;
	            }

	            return funExpr;
	        },

	        createIdentifier: function (name) {
	            return {
	                type: Syntax.Identifier,
	                name: name,
	                // Only here to initialize the shape of the object to ensure
	                // that the 'typeAnnotation' key is ordered before others that
	                // are added later (like 'loc' and 'range'). This just helps
	                // keep the shape of Identifier nodes consistent with everything
	                // else.
	                typeAnnotation: undefined,
	                optional: undefined
	            };
	        },

	        createTypeAnnotation: function (typeAnnotation) {
	            return {
	                type: Syntax.TypeAnnotation,
	                typeAnnotation: typeAnnotation
	            };
	        },

	        createTypeCast: function (expression, typeAnnotation) {
	            return {
	                type: Syntax.TypeCastExpression,
	                expression: expression,
	                typeAnnotation: typeAnnotation
	            };
	        },

	        createFunctionTypeAnnotation: function (params, returnType, rest, typeParameters) {
	            return {
	                type: Syntax.FunctionTypeAnnotation,
	                params: params,
	                returnType: returnType,
	                rest: rest,
	                typeParameters: typeParameters
	            };
	        },

	        createFunctionTypeParam: function (name, typeAnnotation, optional) {
	            return {
	                type: Syntax.FunctionTypeParam,
	                name: name,
	                typeAnnotation: typeAnnotation,
	                optional: optional
	            };
	        },

	        createNullableTypeAnnotation: function (typeAnnotation) {
	            return {
	                type: Syntax.NullableTypeAnnotation,
	                typeAnnotation: typeAnnotation
	            };
	        },

	        createArrayTypeAnnotation: function (elementType) {
	            return {
	                type: Syntax.ArrayTypeAnnotation,
	                elementType: elementType
	            };
	        },

	        createGenericTypeAnnotation: function (id, typeParameters) {
	            return {
	                type: Syntax.GenericTypeAnnotation,
	                id: id,
	                typeParameters: typeParameters
	            };
	        },

	        createQualifiedTypeIdentifier: function (qualification, id) {
	            return {
	                type: Syntax.QualifiedTypeIdentifier,
	                qualification: qualification,
	                id: id
	            };
	        },

	        createTypeParameterDeclaration: function (params) {
	            return {
	                type: Syntax.TypeParameterDeclaration,
	                params: params
	            };
	        },

	        createTypeParameterInstantiation: function (params) {
	            return {
	                type: Syntax.TypeParameterInstantiation,
	                params: params
	            };
	        },

	        createAnyTypeAnnotation: function () {
	            return {
	                type: Syntax.AnyTypeAnnotation
	            };
	        },

	        createBooleanTypeAnnotation: function () {
	            return {
	                type: Syntax.BooleanTypeAnnotation
	            };
	        },

	        createNumberTypeAnnotation: function () {
	            return {
	                type: Syntax.NumberTypeAnnotation
	            };
	        },

	        createStringTypeAnnotation: function () {
	            return {
	                type: Syntax.StringTypeAnnotation
	            };
	        },

	        createStringLiteralTypeAnnotation: function (token) {
	            return {
	                type: Syntax.StringLiteralTypeAnnotation,
	                value: token.value,
	                raw: source.slice(token.range[0], token.range[1])
	            };
	        },

	        createVoidTypeAnnotation: function () {
	            return {
	                type: Syntax.VoidTypeAnnotation
	            };
	        },

	        createTypeofTypeAnnotation: function (argument) {
	            return {
	                type: Syntax.TypeofTypeAnnotation,
	                argument: argument
	            };
	        },

	        createTupleTypeAnnotation: function (types) {
	            return {
	                type: Syntax.TupleTypeAnnotation,
	                types: types
	            };
	        },

	        createObjectTypeAnnotation: function (properties, indexers, callProperties) {
	            return {
	                type: Syntax.ObjectTypeAnnotation,
	                properties: properties,
	                indexers: indexers,
	                callProperties: callProperties
	            };
	        },

	        createObjectTypeIndexer: function (id, key, value, isStatic) {
	            return {
	                type: Syntax.ObjectTypeIndexer,
	                id: id,
	                key: key,
	                value: value,
	                static: isStatic
	            };
	        },

	        createObjectTypeCallProperty: function (value, isStatic) {
	            return {
	                type: Syntax.ObjectTypeCallProperty,
	                value: value,
	                static: isStatic
	            };
	        },

	        createObjectTypeProperty: function (key, value, optional, isStatic) {
	            return {
	                type: Syntax.ObjectTypeProperty,
	                key: key,
	                value: value,
	                optional: optional,
	                static: isStatic
	            };
	        },

	        createUnionTypeAnnotation: function (types) {
	            return {
	                type: Syntax.UnionTypeAnnotation,
	                types: types
	            };
	        },

	        createIntersectionTypeAnnotation: function (types) {
	            return {
	                type: Syntax.IntersectionTypeAnnotation,
	                types: types
	            };
	        },

	        createTypeAlias: function (id, typeParameters, right) {
	            return {
	                type: Syntax.TypeAlias,
	                id: id,
	                typeParameters: typeParameters,
	                right: right
	            };
	        },

	        createInterface: function (id, typeParameters, body, extended) {
	            return {
	                type: Syntax.InterfaceDeclaration,
	                id: id,
	                typeParameters: typeParameters,
	                body: body,
	                extends: extended
	            };
	        },

	        createInterfaceExtends: function (id, typeParameters) {
	            return {
	                type: Syntax.InterfaceExtends,
	                id: id,
	                typeParameters: typeParameters
	            };
	        },

	        createDeclareFunction: function (id) {
	            return {
	                type: Syntax.DeclareFunction,
	                id: id
	            };
	        },

	        createDeclareVariable: function (id) {
	            return {
	                type: Syntax.DeclareVariable,
	                id: id
	            };
	        },

	        createDeclareModule: function (id, body) {
	            return {
	                type: Syntax.DeclareModule,
	                id: id,
	                body: body
	            };
	        },

	        createJSXAttribute: function (name, value) {
	            return {
	                type: Syntax.JSXAttribute,
	                name: name,
	                value: value || null
	            };
	        },

	        createJSXSpreadAttribute: function (argument) {
	            return {
	                type: Syntax.JSXSpreadAttribute,
	                argument: argument
	            };
	        },

	        createJSXIdentifier: function (name) {
	            return {
	                type: Syntax.JSXIdentifier,
	                name: name
	            };
	        },

	        createJSXNamespacedName: function (namespace, name) {
	            return {
	                type: Syntax.JSXNamespacedName,
	                namespace: namespace,
	                name: name
	            };
	        },

	        createJSXMemberExpression: function (object, property) {
	            return {
	                type: Syntax.JSXMemberExpression,
	                object: object,
	                property: property
	            };
	        },

	        createJSXElement: function (openingElement, closingElement, children) {
	            return {
	                type: Syntax.JSXElement,
	                openingElement: openingElement,
	                closingElement: closingElement,
	                children: children
	            };
	        },

	        createJSXEmptyExpression: function () {
	            return {
	                type: Syntax.JSXEmptyExpression
	            };
	        },

	        createJSXExpressionContainer: function (expression) {
	            return {
	                type: Syntax.JSXExpressionContainer,
	                expression: expression
	            };
	        },

	        createJSXOpeningElement: function (name, attributes, selfClosing) {
	            return {
	                type: Syntax.JSXOpeningElement,
	                name: name,
	                selfClosing: selfClosing,
	                attributes: attributes
	            };
	        },

	        createJSXClosingElement: function (name) {
	            return {
	                type: Syntax.JSXClosingElement,
	                name: name
	            };
	        },

	        createIfStatement: function (test, consequent, alternate) {
	            return {
	                type: Syntax.IfStatement,
	                test: test,
	                consequent: consequent,
	                alternate: alternate
	            };
	        },

	        createLabeledStatement: function (label, body) {
	            return {
	                type: Syntax.LabeledStatement,
	                label: label,
	                body: body
	            };
	        },

	        createLiteral: function (token) {
	            var object = {
	                type: Syntax.Literal,
	                value: token.value,
	                raw: source.slice(token.range[0], token.range[1])
	            };
	            if (token.regex) {
	                object.regex = token.regex;
	            }
	            return object;
	        },

	        createMemberExpression: function (accessor, object, property) {
	            return {
	                type: Syntax.MemberExpression,
	                computed: accessor === '[',
	                object: object,
	                property: property
	            };
	        },

	        createNewExpression: function (callee, args) {
	            return {
	                type: Syntax.NewExpression,
	                callee: callee,
	                'arguments': args
	            };
	        },

	        createObjectExpression: function (properties) {
	            return {
	                type: Syntax.ObjectExpression,
	                properties: properties
	            };
	        },

	        createPostfixExpression: function (operator, argument) {
	            return {
	                type: Syntax.UpdateExpression,
	                operator: operator,
	                argument: argument,
	                prefix: false
	            };
	        },

	        createProgram: function (body) {
	            return {
	                type: Syntax.Program,
	                body: body
	            };
	        },

	        createProperty: function (kind, key, value, method, shorthand, computed) {
	            return {
	                type: Syntax.Property,
	                key: key,
	                value: value,
	                kind: kind,
	                method: method,
	                shorthand: shorthand,
	                computed: computed
	            };
	        },

	        createReturnStatement: function (argument) {
	            return {
	                type: Syntax.ReturnStatement,
	                argument: argument
	            };
	        },

	        createSequenceExpression: function (expressions) {
	            return {
	                type: Syntax.SequenceExpression,
	                expressions: expressions
	            };
	        },

	        createSwitchCase: function (test, consequent) {
	            return {
	                type: Syntax.SwitchCase,
	                test: test,
	                consequent: consequent
	            };
	        },

	        createSwitchStatement: function (discriminant, cases) {
	            return {
	                type: Syntax.SwitchStatement,
	                discriminant: discriminant,
	                cases: cases
	            };
	        },

	        createThisExpression: function () {
	            return {
	                type: Syntax.ThisExpression
	            };
	        },

	        createThrowStatement: function (argument) {
	            return {
	                type: Syntax.ThrowStatement,
	                argument: argument
	            };
	        },

	        createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
	            return {
	                type: Syntax.TryStatement,
	                block: block,
	                guardedHandlers: guardedHandlers,
	                handlers: handlers,
	                finalizer: finalizer
	            };
	        },

	        createUnaryExpression: function (operator, argument) {
	            if (operator === '++' || operator === '--') {
	                return {
	                    type: Syntax.UpdateExpression,
	                    operator: operator,
	                    argument: argument,
	                    prefix: true
	                };
	            }
	            return {
	                type: Syntax.UnaryExpression,
	                operator: operator,
	                argument: argument,
	                prefix: true
	            };
	        },

	        createVariableDeclaration: function (declarations, kind) {
	            return {
	                type: Syntax.VariableDeclaration,
	                declarations: declarations,
	                kind: kind
	            };
	        },

	        createVariableDeclarator: function (id, init) {
	            return {
	                type: Syntax.VariableDeclarator,
	                id: id,
	                init: init
	            };
	        },

	        createWhileStatement: function (test, body) {
	            return {
	                type: Syntax.WhileStatement,
	                test: test,
	                body: body
	            };
	        },

	        createWithStatement: function (object, body) {
	            return {
	                type: Syntax.WithStatement,
	                object: object,
	                body: body
	            };
	        },

	        createTemplateElement: function (value, tail) {
	            return {
	                type: Syntax.TemplateElement,
	                value: value,
	                tail: tail
	            };
	        },

	        createTemplateLiteral: function (quasis, expressions) {
	            return {
	                type: Syntax.TemplateLiteral,
	                quasis: quasis,
	                expressions: expressions
	            };
	        },

	        createSpreadElement: function (argument) {
	            return {
	                type: Syntax.SpreadElement,
	                argument: argument
	            };
	        },

	        createSpreadProperty: function (argument) {
	            return {
	                type: Syntax.SpreadProperty,
	                argument: argument
	            };
	        },

	        createTaggedTemplateExpression: function (tag, quasi) {
	            return {
	                type: Syntax.TaggedTemplateExpression,
	                tag: tag,
	                quasi: quasi
	            };
	        },

	        createArrowFunctionExpression: function (params, defaults, body, rest, expression, isAsync) {
	            var arrowExpr = {
	                type: Syntax.ArrowFunctionExpression,
	                id: null,
	                params: params,
	                defaults: defaults,
	                body: body,
	                rest: rest,
	                generator: false,
	                expression: expression
	            };

	            if (isAsync) {
	                arrowExpr.async = true;
	            }

	            return arrowExpr;
	        },

	        createMethodDefinition: function (propertyType, kind, key, value, computed) {
	            return {
	                type: Syntax.MethodDefinition,
	                key: key,
	                value: value,
	                kind: kind,
	                'static': propertyType === ClassPropertyType.static,
	                computed: computed
	            };
	        },

	        createClassProperty: function (key, typeAnnotation, computed, isStatic) {
	            return {
	                type: Syntax.ClassProperty,
	                key: key,
	                typeAnnotation: typeAnnotation,
	                computed: computed,
	                static: isStatic
	            };
	        },

	        createClassBody: function (body) {
	            return {
	                type: Syntax.ClassBody,
	                body: body
	            };
	        },

	        createClassImplements: function (id, typeParameters) {
	            return {
	                type: Syntax.ClassImplements,
	                id: id,
	                typeParameters: typeParameters
	            };
	        },

	        createClassExpression: function (id, superClass, body, typeParameters, superTypeParameters, implemented) {
	            return {
	                type: Syntax.ClassExpression,
	                id: id,
	                superClass: superClass,
	                body: body,
	                typeParameters: typeParameters,
	                superTypeParameters: superTypeParameters,
	                implements: implemented
	            };
	        },

	        createClassDeclaration: function (id, superClass, body, typeParameters, superTypeParameters, implemented) {
	            return {
	                type: Syntax.ClassDeclaration,
	                id: id,
	                superClass: superClass,
	                body: body,
	                typeParameters: typeParameters,
	                superTypeParameters: superTypeParameters,
	                implements: implemented
	            };
	        },

	        createModuleSpecifier: function (token) {
	            return {
	                type: Syntax.ModuleSpecifier,
	                value: token.value,
	                raw: source.slice(token.range[0], token.range[1])
	            };
	        },

	        createExportSpecifier: function (id, name) {
	            return {
	                type: Syntax.ExportSpecifier,
	                id: id,
	                name: name
	            };
	        },

	        createExportBatchSpecifier: function () {
	            return {
	                type: Syntax.ExportBatchSpecifier
	            };
	        },

	        createImportDefaultSpecifier: function (id) {
	            return {
	                type: Syntax.ImportDefaultSpecifier,
	                id: id
	            };
	        },

	        createImportNamespaceSpecifier: function (id) {
	            return {
	                type: Syntax.ImportNamespaceSpecifier,
	                id: id
	            };
	        },

	        createExportDeclaration: function (isDefault, declaration, specifiers, src) {
	            return {
	                type: Syntax.ExportDeclaration,
	                'default': !!isDefault,
	                declaration: declaration,
	                specifiers: specifiers,
	                source: src
	            };
	        },

	        createImportSpecifier: function (id, name) {
	            return {
	                type: Syntax.ImportSpecifier,
	                id: id,
	                name: name
	            };
	        },

	        createImportDeclaration: function (specifiers, src, isType) {
	            return {
	                type: Syntax.ImportDeclaration,
	                specifiers: specifiers,
	                source: src,
	                isType: isType
	            };
	        },

	        createYieldExpression: function (argument, dlg) {
	            return {
	                type: Syntax.YieldExpression,
	                argument: argument,
	                delegate: dlg
	            };
	        },

	        createAwaitExpression: function (argument) {
	            return {
	                type: Syntax.AwaitExpression,
	                argument: argument
	            };
	        },

	        createComprehensionExpression: function (filter, blocks, body) {
	            return {
	                type: Syntax.ComprehensionExpression,
	                filter: filter,
	                blocks: blocks,
	                body: body
	            };
	        }

	    };

	    // Return true if there is a line terminator before the next token.

	    function peekLineTerminator() {
	        var pos, line, start, found;

	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        skipComment();
	        found = lineNumber !== line;
	        index = pos;
	        lineNumber = line;
	        lineStart = start;

	        return found;
	    }

	    // Throw an exception

	    function throwError(token, messageFormat) {
	        var error,
	            args = Array.prototype.slice.call(arguments, 2),
	            msg = messageFormat.replace(
	                /%(\d)/g,
	                function (whole, idx) {
	                    assert(idx < args.length, 'Message reference must be in range');
	                    return args[idx];
	                }
	            );

	        if (typeof token.lineNumber === 'number') {
	            error = new Error('Line ' + token.lineNumber + ': ' + msg);
	            error.index = token.range[0];
	            error.lineNumber = token.lineNumber;
	            error.column = token.range[0] - lineStart + 1;
	        } else {
	            error = new Error('Line ' + lineNumber + ': ' + msg);
	            error.index = index;
	            error.lineNumber = lineNumber;
	            error.column = index - lineStart + 1;
	        }

	        error.description = msg;
	        throw error;
	    }

	    function throwErrorTolerant() {
	        try {
	            throwError.apply(null, arguments);
	        } catch (e) {
	            if (extra.errors) {
	                extra.errors.push(e);
	            } else {
	                throw e;
	            }
	        }
	    }


	    // Throw an exception because of the token.

	    function throwUnexpected(token) {
	        if (token.type === Token.EOF) {
	            throwError(token, Messages.UnexpectedEOS);
	        }

	        if (token.type === Token.NumericLiteral) {
	            throwError(token, Messages.UnexpectedNumber);
	        }

	        if (token.type === Token.StringLiteral || token.type === Token.JSXText) {
	            throwError(token, Messages.UnexpectedString);
	        }

	        if (token.type === Token.Identifier) {
	            throwError(token, Messages.UnexpectedIdentifier);
	        }

	        if (token.type === Token.Keyword) {
	            if (isFutureReservedWord(token.value)) {
	                throwError(token, Messages.UnexpectedReserved);
	            } else if (strict && isStrictModeReservedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictReservedWord);
	                return;
	            }
	            throwError(token, Messages.UnexpectedToken, token.value);
	        }

	        if (token.type === Token.Template) {
	            throwError(token, Messages.UnexpectedTemplate, token.value.raw);
	        }

	        // BooleanLiteral, NullLiteral, or Punctuator.
	        throwError(token, Messages.UnexpectedToken, token.value);
	    }

	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.

	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpected(token);
	        }
	    }

	    // Expect the next token to match the specified keyword.
	    // If not, an exception will be thrown.

	    function expectKeyword(keyword, contextual) {
	        var token = lex();
	        if (token.type !== (contextual ? Token.Identifier : Token.Keyword) ||
	                token.value !== keyword) {
	            throwUnexpected(token);
	        }
	    }

	    // Expect the next token to match the specified contextual keyword.
	    // If not, an exception will be thrown.

	    function expectContextualKeyword(keyword) {
	        return expectKeyword(keyword, true);
	    }

	    // Return true if the next token matches the specified punctuator.

	    function match(value) {
	        return lookahead.type === Token.Punctuator && lookahead.value === value;
	    }

	    // Return true if the next token matches the specified keyword

	    function matchKeyword(keyword, contextual) {
	        var expectedType = contextual ? Token.Identifier : Token.Keyword;
	        return lookahead.type === expectedType && lookahead.value === keyword;
	    }

	    // Return true if the next token matches the specified contextual keyword

	    function matchContextualKeyword(keyword) {
	        return matchKeyword(keyword, true);
	    }

	    // Return true if the next token is an assignment operator

	    function matchAssign() {
	        var op;

	        if (lookahead.type !== Token.Punctuator) {
	            return false;
	        }
	        op = lookahead.value;
	        return op === '=' ||
	            op === '*=' ||
	            op === '/=' ||
	            op === '%=' ||
	            op === '+=' ||
	            op === '-=' ||
	            op === '<<=' ||
	            op === '>>=' ||
	            op === '>>>=' ||
	            op === '&=' ||
	            op === '^=' ||
	            op === '|=';
	    }

	    // Note that 'yield' is treated as a keyword in strict mode, but a
	    // contextual keyword (identifier) in non-strict mode, so we need to
	    // use matchKeyword('yield', false) and matchKeyword('yield', true)
	    // (i.e. matchContextualKeyword) appropriately.
	    function matchYield() {
	        return state.yieldAllowed && matchKeyword('yield', !strict);
	    }

	    function matchAsync() {
	        var backtrackToken = lookahead, matches = false;

	        if (matchContextualKeyword('async')) {
	            lex(); // Make sure peekLineTerminator() starts after 'async'.
	            matches = !peekLineTerminator();
	            rewind(backtrackToken); // Revert the lex().
	        }

	        return matches;
	    }

	    function matchAwait() {
	        return state.awaitAllowed && matchContextualKeyword('await');
	    }

	    function consumeSemicolon() {
	        var line, oldIndex = index, oldLineNumber = lineNumber,
	            oldLineStart = lineStart, oldLookahead = lookahead;

	        // Catch the very common case first: immediately a semicolon (char #59).
	        if (source.charCodeAt(index) === 59) {
	            lex();
	            return;
	        }

	        line = lineNumber;
	        skipComment();
	        if (lineNumber !== line) {
	            index = oldIndex;
	            lineNumber = oldLineNumber;
	            lineStart = oldLineStart;
	            lookahead = oldLookahead;
	            return;
	        }

	        if (match(';')) {
	            lex();
	            return;
	        }

	        if (lookahead.type !== Token.EOF && !match('}')) {
	            throwUnexpected(lookahead);
	        }
	    }

	    // Return true if provided expression is LeftHandSideExpression

	    function isLeftHandSide(expr) {
	        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
	    }

	    function isAssignableLeftHandSide(expr) {
	        return isLeftHandSide(expr) || expr.type === Syntax.ObjectPattern || expr.type === Syntax.ArrayPattern;
	    }

	    // 11.1.4 Array Initialiser

	    function parseArrayInitialiser() {
	        var elements = [], blocks = [], filter = null, tmp, possiblecomprehension = true,
	            marker = markerCreate();

	        expect('[');
	        while (!match(']')) {
	            if (lookahead.value === 'for' &&
	                    lookahead.type === Token.Keyword) {
	                if (!possiblecomprehension) {
	                    throwError({}, Messages.ComprehensionError);
	                }
	                matchKeyword('for');
	                tmp = parseForStatement({ignoreBody: true});
	                tmp.of = tmp.type === Syntax.ForOfStatement;
	                tmp.type = Syntax.ComprehensionBlock;
	                if (tmp.left.kind) { // can't be let or const
	                    throwError({}, Messages.ComprehensionError);
	                }
	                blocks.push(tmp);
	            } else if (lookahead.value === 'if' &&
	                           lookahead.type === Token.Keyword) {
	                if (!possiblecomprehension) {
	                    throwError({}, Messages.ComprehensionError);
	                }
	                expectKeyword('if');
	                expect('(');
	                filter = parseExpression();
	                expect(')');
	            } else if (lookahead.value === ',' &&
	                           lookahead.type === Token.Punctuator) {
	                possiblecomprehension = false; // no longer allowed.
	                lex();
	                elements.push(null);
	            } else {
	                tmp = parseSpreadOrAssignmentExpression();
	                elements.push(tmp);
	                if (tmp && tmp.type === Syntax.SpreadElement) {
	                    if (!match(']')) {
	                        throwError({}, Messages.ElementAfterSpreadElement);
	                    }
	                } else if (!(match(']') || matchKeyword('for') || matchKeyword('if'))) {
	                    expect(','); // this lexes.
	                    possiblecomprehension = false;
	                }
	            }
	        }

	        expect(']');

	        if (filter && !blocks.length) {
	            throwError({}, Messages.ComprehensionRequiresBlock);
	        }

	        if (blocks.length) {
	            if (elements.length !== 1) {
	                throwError({}, Messages.ComprehensionError);
	            }
	            return markerApply(marker, delegate.createComprehensionExpression(filter, blocks, elements[0]));
	        }
	        return markerApply(marker, delegate.createArrayExpression(elements));
	    }

	    // 11.1.5 Object Initialiser

	    function parsePropertyFunction(options) {
	        var previousStrict, previousYieldAllowed, previousAwaitAllowed,
	            params, defaults, body, marker = markerCreate();

	        previousStrict = strict;
	        previousYieldAllowed = state.yieldAllowed;
	        state.yieldAllowed = options.generator;
	        previousAwaitAllowed = state.awaitAllowed;
	        state.awaitAllowed = options.async;
	        params = options.params || [];
	        defaults = options.defaults || [];

	        body = parseConciseBody();
	        if (options.name && strict && isRestrictedWord(params[0].name)) {
	            throwErrorTolerant(options.name, Messages.StrictParamName);
	        }
	        strict = previousStrict;
	        state.yieldAllowed = previousYieldAllowed;
	        state.awaitAllowed = previousAwaitAllowed;

	        return markerApply(marker, delegate.createFunctionExpression(
	            null,
	            params,
	            defaults,
	            body,
	            options.rest || null,
	            options.generator,
	            body.type !== Syntax.BlockStatement,
	            options.async,
	            options.returnType,
	            options.typeParameters
	        ));
	    }


	    function parsePropertyMethodFunction(options) {
	        var previousStrict, tmp, method;

	        previousStrict = strict;
	        strict = true;

	        tmp = parseParams();

	        if (tmp.stricted) {
	            throwErrorTolerant(tmp.stricted, tmp.message);
	        }

	        method = parsePropertyFunction({
	            params: tmp.params,
	            defaults: tmp.defaults,
	            rest: tmp.rest,
	            generator: options.generator,
	            async: options.async,
	            returnType: tmp.returnType,
	            typeParameters: options.typeParameters
	        });

	        strict = previousStrict;

	        return method;
	    }


	    function parseObjectPropertyKey() {
	        var marker = markerCreate(),
	            token = lex(),
	            propertyKey,
	            result;

	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.

	        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                throwErrorTolerant(token, Messages.StrictOctalLiteral);
	            }
	            return markerApply(marker, delegate.createLiteral(token));
	        }

	        if (token.type === Token.Punctuator && token.value === '[') {
	            // For computed properties we should skip the [ and ], and
	            // capture in marker only the assignment expression itself.
	            marker = markerCreate();
	            propertyKey = parseAssignmentExpression();
	            result = markerApply(marker, propertyKey);
	            expect(']');
	            return result;
	        }

	        return markerApply(marker, delegate.createIdentifier(token.value));
	    }

	    function parseObjectProperty() {
	        var token, key, id, param, computed,
	            marker = markerCreate(), returnType, typeParameters;

	        token = lookahead;
	        computed = (token.value === '[' && token.type === Token.Punctuator);

	        if (token.type === Token.Identifier || computed || matchAsync()) {
	            id = parseObjectPropertyKey();

	            if (match(':')) {
	                lex();

	                return markerApply(
	                    marker,
	                    delegate.createProperty(
	                        'init',
	                        id,
	                        parseAssignmentExpression(),
	                        false,
	                        false,
	                        computed
	                    )
	                );
	            }

	            if (match('(') || match('<')) {
	                if (match('<')) {
	                    typeParameters = parseTypeParameterDeclaration();
	                }
	                return markerApply(
	                    marker,
	                    delegate.createProperty(
	                        'init',
	                        id,
	                        parsePropertyMethodFunction({
	                            generator: false,
	                            async: false,
	                            typeParameters: typeParameters
	                        }),
	                        true,
	                        false,
	                        computed
	                    )
	                );
	            }

	            // Property Assignment: Getter and Setter.

	            if (token.value === 'get') {
	                computed = (lookahead.value === '[');
	                key = parseObjectPropertyKey();

	                expect('(');
	                expect(')');
	                if (match(':')) {
	                    returnType = parseTypeAnnotation();
	                }

	                return markerApply(
	                    marker,
	                    delegate.createProperty(
	                        'get',
	                        key,
	                        parsePropertyFunction({
	                            generator: false,
	                            async: false,
	                            returnType: returnType
	                        }),
	                        false,
	                        false,
	                        computed
	                    )
	                );
	            }

	            if (token.value === 'set') {
	                computed = (lookahead.value === '[');
	                key = parseObjectPropertyKey();

	                expect('(');
	                token = lookahead;
	                param = [ parseTypeAnnotatableIdentifier() ];
	                expect(')');
	                if (match(':')) {
	                    returnType = parseTypeAnnotation();
	                }

	                return markerApply(
	                    marker,
	                    delegate.createProperty(
	                        'set',
	                        key,
	                        parsePropertyFunction({
	                            params: param,
	                            generator: false,
	                            async: false,
	                            name: token,
	                            returnType: returnType
	                        }),
	                        false,
	                        false,
	                        computed
	                    )
	                );
	            }

	            if (token.value === 'async') {
	                computed = (lookahead.value === '[');
	                key = parseObjectPropertyKey();

	                if (match('<')) {
	                    typeParameters = parseTypeParameterDeclaration();
	                }

	                return markerApply(
	                    marker,
	                    delegate.createProperty(
	                        'init',
	                        key,
	                        parsePropertyMethodFunction({
	                            generator: false,
	                            async: true,
	                            typeParameters: typeParameters
	                        }),
	                        true,
	                        false,
	                        computed
	                    )
	                );
	            }

	            if (computed) {
	                // Computed properties can only be used with full notation.
	                throwUnexpected(lookahead);
	            }

	            return markerApply(
	                marker,
	                delegate.createProperty('init', id, id, false, true, false)
	            );
	        }

	        if (token.type === Token.EOF || token.type === Token.Punctuator) {
	            if (!match('*')) {
	                throwUnexpected(token);
	            }
	            lex();

	            computed = (lookahead.type === Token.Punctuator && lookahead.value === '[');

	            id = parseObjectPropertyKey();

	            if (match('<')) {
	                typeParameters = parseTypeParameterDeclaration();
	            }

	            if (!match('(')) {
	                throwUnexpected(lex());
	            }

	            return markerApply(marker, delegate.createProperty(
	                'init',
	                id,
	                parsePropertyMethodFunction({
	                    generator: true,
	                    typeParameters: typeParameters
	                }),
	                true,
	                false,
	                computed
	            ));
	        }
	        key = parseObjectPropertyKey();
	        if (match(':')) {
	            lex();
	            return markerApply(marker, delegate.createProperty('init', key, parseAssignmentExpression(), false, false, false));
	        }
	        if (match('(') || match('<')) {
	            if (match('<')) {
	                typeParameters = parseTypeParameterDeclaration();
	            }
	            return markerApply(marker, delegate.createProperty(
	                'init',
	                key,
	                parsePropertyMethodFunction({
	                    generator: false,
	                    typeParameters: typeParameters
	                }),
	                true,
	                false,
	                false
	            ));
	        }
	        throwUnexpected(lex());
	    }

	    function parseObjectSpreadProperty() {
	        var marker = markerCreate();
	        expect('...');
	        return markerApply(marker, delegate.createSpreadProperty(parseAssignmentExpression()));
	    }

	    function getFieldName(key) {
	        var toString = String;
	        if (key.type === Syntax.Identifier) {
	            return key.name;
	        }
	        return toString(key.value);
	    }

	    function parseObjectInitialiser() {
	        var properties = [], property, name, kind, storedKind, map = new StringMap(),
	            marker = markerCreate(), toString = String;

	        expect('{');

	        while (!match('}')) {
	            if (match('...')) {
	                property = parseObjectSpreadProperty();
	            } else {
	                property = parseObjectProperty();

	                if (property.key.type === Syntax.Identifier) {
	                    name = property.key.name;
	                } else {
	                    name = toString(property.key.value);
	                }
	                kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;

	                if (map.has(name)) {
	                    storedKind = map.get(name);
	                    if (storedKind === PropertyKind.Data) {
	                        if (strict && kind === PropertyKind.Data) {
	                            throwErrorTolerant({}, Messages.StrictDuplicateProperty);
	                        } else if (kind !== PropertyKind.Data) {
	                            throwErrorTolerant({}, Messages.AccessorDataProperty);
	                        }
	                    } else {
	                        if (kind === PropertyKind.Data) {
	                            throwErrorTolerant({}, Messages.AccessorDataProperty);
	                        } else if (storedKind & kind) {
	                            throwErrorTolerant({}, Messages.AccessorGetSet);
	                        }
	                    }
	                    map.set(name, storedKind | kind);
	                } else {
	                    map.set(name, kind);
	                }
	            }

	            properties.push(property);

	            if (!match('}')) {
	                expect(',');
	            }
	        }

	        expect('}');

	        return markerApply(marker, delegate.createObjectExpression(properties));
	    }

	    function parseTemplateElement(option) {
	        var marker = markerCreate(),
	            token = scanTemplateElement(option);
	        if (strict && token.octal) {
	            throwError(token, Messages.StrictOctalLiteral);
	        }
	        return markerApply(marker, delegate.createTemplateElement({ raw: token.value.raw, cooked: token.value.cooked }, token.tail));
	    }

	    function parseTemplateLiteral() {
	        var quasi, quasis, expressions, marker = markerCreate();

	        quasi = parseTemplateElement({ head: true });
	        quasis = [ quasi ];
	        expressions = [];

	        while (!quasi.tail) {
	            expressions.push(parseExpression());
	            quasi = parseTemplateElement({ head: false });
	            quasis.push(quasi);
	        }

	        return markerApply(marker, delegate.createTemplateLiteral(quasis, expressions));
	    }

	    // 11.1.6 The Grouping Operator

	    function parseGroupExpression() {
	        var expr, marker, typeAnnotation;

	        expect('(');

	        ++state.parenthesizedCount;

	        marker = markerCreate();

	        expr = parseExpression();

	        if (match(':')) {
	            typeAnnotation = parseTypeAnnotation();
	            expr = markerApply(marker, delegate.createTypeCast(
	                expr,
	                typeAnnotation
	            ));
	        }

	        expect(')');

	        return expr;
	    }

	    function matchAsyncFuncExprOrDecl() {
	        var token;

	        if (matchAsync()) {
	            token = lookahead2();
	            if (token.type === Token.Keyword && token.value === 'function') {
	                return true;
	            }
	        }

	        return false;
	    }

	    // 11.1 Primary Expressions

	    function parsePrimaryExpression() {
	        var marker, type, token, expr;

	        type = lookahead.type;

	        if (type === Token.Identifier) {
	            marker = markerCreate();
	            return markerApply(marker, delegate.createIdentifier(lex().value));
	        }

	        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            if (strict && lookahead.octal) {
	                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
	            }
	            marker = markerCreate();
	            return markerApply(marker, delegate.createLiteral(lex()));
	        }

	        if (type === Token.Keyword) {
	            if (matchKeyword('this')) {
	                marker = markerCreate();
	                lex();
	                return markerApply(marker, delegate.createThisExpression());
	            }

	            if (matchKeyword('function')) {
	                return parseFunctionExpression();
	            }

	            if (matchKeyword('class')) {
	                return parseClassExpression();
	            }

	            if (matchKeyword('super')) {
	                marker = markerCreate();
	                lex();
	                return markerApply(marker, delegate.createIdentifier('super'));
	            }
	        }

	        if (type === Token.BooleanLiteral) {
	            marker = markerCreate();
	            token = lex();
	            token.value = (token.value === 'true');
	            return markerApply(marker, delegate.createLiteral(token));
	        }

	        if (type === Token.NullLiteral) {
	            marker = markerCreate();
	            token = lex();
	            token.value = null;
	            return markerApply(marker, delegate.createLiteral(token));
	        }

	        if (match('[')) {
	            return parseArrayInitialiser();
	        }

	        if (match('{')) {
	            return parseObjectInitialiser();
	        }

	        if (match('(')) {
	            return parseGroupExpression();
	        }

	        if (match('/') || match('/=')) {
	            marker = markerCreate();
	            expr = delegate.createLiteral(scanRegExp());
	            peek();
	            return markerApply(marker, expr);
	        }

	        if (type === Token.Template) {
	            return parseTemplateLiteral();
	        }

	        if (match('<')) {
	            return parseJSXElement();
	        }

	        throwUnexpected(lex());
	    }

	    // 11.2 Left-Hand-Side Expressions

	    function parseArguments() {
	        var args = [], arg;

	        expect('(');

	        if (!match(')')) {
	            while (index < length) {
	                arg = parseSpreadOrAssignmentExpression();
	                args.push(arg);

	                if (match(')')) {
	                    break;
	                } else if (arg.type === Syntax.SpreadElement) {
	                    throwError({}, Messages.ElementAfterSpreadElement);
	                }

	                expect(',');
	            }
	        }

	        expect(')');

	        return args;
	    }

	    function parseSpreadOrAssignmentExpression() {
	        if (match('...')) {
	            var marker = markerCreate();
	            lex();
	            return markerApply(marker, delegate.createSpreadElement(parseAssignmentExpression()));
	        }
	        return parseAssignmentExpression();
	    }

	    function parseNonComputedProperty() {
	        var marker = markerCreate(),
	            token = lex();

	        if (!isIdentifierName(token)) {
	            throwUnexpected(token);
	        }

	        return markerApply(marker, delegate.createIdentifier(token.value));
	    }

	    function parseNonComputedMember() {
	        expect('.');

	        return parseNonComputedProperty();
	    }

	    function parseComputedMember() {
	        var expr;

	        expect('[');

	        expr = parseExpression();

	        expect(']');

	        return expr;
	    }

	    function parseNewExpression() {
	        var callee, args, marker = markerCreate();

	        expectKeyword('new');
	        callee = parseLeftHandSideExpression();
	        args = match('(') ? parseArguments() : [];

	        return markerApply(marker, delegate.createNewExpression(callee, args));
	    }

	    function parseLeftHandSideExpressionAllowCall() {
	        var expr, args, marker = markerCreate();

	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        while (match('.') || match('[') || match('(') || lookahead.type === Token.Template) {
	            if (match('(')) {
	                args = parseArguments();
	                expr = markerApply(marker, delegate.createCallExpression(expr, args));
	            } else if (match('[')) {
	                expr = markerApply(marker, delegate.createMemberExpression('[', expr, parseComputedMember()));
	            } else if (match('.')) {
	                expr = markerApply(marker, delegate.createMemberExpression('.', expr, parseNonComputedMember()));
	            } else {
	                expr = markerApply(marker, delegate.createTaggedTemplateExpression(expr, parseTemplateLiteral()));
	            }
	        }

	        return expr;
	    }

	    function parseLeftHandSideExpression() {
	        var expr, marker = markerCreate();

	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        while (match('.') || match('[') || lookahead.type === Token.Template) {
	            if (match('[')) {
	                expr = markerApply(marker, delegate.createMemberExpression('[', expr, parseComputedMember()));
	            } else if (match('.')) {
	                expr = markerApply(marker, delegate.createMemberExpression('.', expr, parseNonComputedMember()));
	            } else {
	                expr = markerApply(marker, delegate.createTaggedTemplateExpression(expr, parseTemplateLiteral()));
	            }
	        }

	        return expr;
	    }

	    // 11.3 Postfix Expressions

	    function parsePostfixExpression() {
	        var marker = markerCreate(),
	            expr = parseLeftHandSideExpressionAllowCall(),
	            token;

	        if (lookahead.type !== Token.Punctuator) {
	            return expr;
	        }

	        if ((match('++') || match('--')) && !peekLineTerminator()) {
	            // 11.3.1, 11.3.2
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPostfix);
	            }

	            if (!isLeftHandSide(expr)) {
	                throwError({}, Messages.InvalidLHSInAssignment);
	            }

	            token = lex();
	            expr = markerApply(marker, delegate.createPostfixExpression(token.value, expr));
	        }

	        return expr;
	    }

	    // 11.4 Unary Operators

	    function parseUnaryExpression() {
	        var marker, token, expr;

	        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
	            return parsePostfixExpression();
	        }

	        if (match('++') || match('--')) {
	            marker = markerCreate();
	            token = lex();
	            expr = parseUnaryExpression();
	            // 11.4.4, 11.4.5
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPrefix);
	            }

	            if (!isLeftHandSide(expr)) {
	                throwError({}, Messages.InvalidLHSInAssignment);
	            }

	            return markerApply(marker, delegate.createUnaryExpression(token.value, expr));
	        }

	        if (match('+') || match('-') || match('~') || match('!')) {
	            marker = markerCreate();
	            token = lex();
	            expr = parseUnaryExpression();
	            return markerApply(marker, delegate.createUnaryExpression(token.value, expr));
	        }

	        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            marker = markerCreate();
	            token = lex();
	            expr = parseUnaryExpression();
	            expr = markerApply(marker, delegate.createUnaryExpression(token.value, expr));
	            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
	                throwErrorTolerant({}, Messages.StrictDelete);
	            }
	            return expr;
	        }

	        return parsePostfixExpression();
	    }

	    function binaryPrecedence(token, allowIn) {
	        var prec = 0;

	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return 0;
	        }

	        switch (token.value) {
	        case '||':
	            prec = 1;
	            break;

	        case '&&':
	            prec = 2;
	            break;

	        case '|':
	            prec = 3;
	            break;

	        case '^':
	            prec = 4;
	            break;

	        case '&':
	            prec = 5;
	            break;

	        case '==':
	        case '!=':
	        case '===':
	        case '!==':
	            prec = 6;
	            break;

	        case '<':
	        case '>':
	        case '<=':
	        case '>=':
	        case 'instanceof':
	            prec = 7;
	            break;

	        case 'in':
	            prec = allowIn ? 7 : 0;
	            break;

	        case '<<':
	        case '>>':
	        case '>>>':
	            prec = 8;
	            break;

	        case '+':
	        case '-':
	            prec = 9;
	            break;

	        case '*':
	        case '/':
	        case '%':
	            prec = 11;
	            break;

	        default:
	            break;
	        }

	        return prec;
	    }

	    // 11.5 Multiplicative Operators
	    // 11.6 Additive Operators
	    // 11.7 Bitwise Shift Operators
	    // 11.8 Relational Operators
	    // 11.9 Equality Operators
	    // 11.10 Binary Bitwise Operators
	    // 11.11 Binary Logical Operators

	    function parseBinaryExpression() {
	        var expr, token, prec, previousAllowIn, stack, right, operator, left, i,
	            marker, markers;

	        previousAllowIn = state.allowIn;
	        state.allowIn = true;

	        marker = markerCreate();
	        left = parseUnaryExpression();

	        token = lookahead;
	        prec = binaryPrecedence(token, previousAllowIn);
	        if (prec === 0) {
	            return left;
	        }
	        token.prec = prec;
	        lex();

	        markers = [marker, markerCreate()];
	        right = parseUnaryExpression();

	        stack = [left, token, right];

	        while ((prec = binaryPrecedence(lookahead, previousAllowIn)) > 0) {

	            // Reduce: make a binary expression from the three topmost entries.
	            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
	                right = stack.pop();
	                operator = stack.pop().value;
	                left = stack.pop();
	                expr = delegate.createBinaryExpression(operator, left, right);
	                markers.pop();
	                marker = markers.pop();
	                markerApply(marker, expr);
	                stack.push(expr);
	                markers.push(marker);
	            }

	            // Shift.
	            token = lex();
	            token.prec = prec;
	            stack.push(token);
	            markers.push(markerCreate());
	            expr = parseUnaryExpression();
	            stack.push(expr);
	        }

	        state.allowIn = previousAllowIn;

	        // Final reduce to clean-up the stack.
	        i = stack.length - 1;
	        expr = stack[i];
	        markers.pop();
	        while (i > 1) {
	            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
	            i -= 2;
	            marker = markers.pop();
	            markerApply(marker, expr);
	        }

	        return expr;
	    }


	    // 11.12 Conditional Operator

	    function parseConditionalExpression() {
	        var expr, previousAllowIn, consequent, alternate, marker = markerCreate();
	        expr = parseBinaryExpression();

	        if (match('?')) {
	            lex();
	            previousAllowIn = state.allowIn;
	            state.allowIn = true;
	            consequent = parseAssignmentExpression();
	            state.allowIn = previousAllowIn;
	            expect(':');
	            alternate = parseAssignmentExpression();

	            expr = markerApply(marker, delegate.createConditionalExpression(expr, consequent, alternate));
	        }

	        return expr;
	    }

	    // 11.13 Assignment Operators

	    // 12.14.5 AssignmentPattern

	    function reinterpretAsAssignmentBindingPattern(expr) {
	        var i, len, property, element;

	        if (expr.type === Syntax.ObjectExpression) {
	            expr.type = Syntax.ObjectPattern;
	            for (i = 0, len = expr.properties.length; i < len; i += 1) {
	                property = expr.properties[i];
	                if (property.type === Syntax.SpreadProperty) {
	                    if (i < len - 1) {
	                        throwError({}, Messages.PropertyAfterSpreadProperty);
	                    }
	                    reinterpretAsAssignmentBindingPattern(property.argument);
	                } else {
	                    if (property.kind !== 'init') {
	                        throwError({}, Messages.InvalidLHSInAssignment);
	                    }
	                    reinterpretAsAssignmentBindingPattern(property.value);
	                }
	            }
	        } else if (expr.type === Syntax.ArrayExpression) {
	            expr.type = Syntax.ArrayPattern;
	            for (i = 0, len = expr.elements.length; i < len; i += 1) {
	                element = expr.elements[i];
	                /* istanbul ignore else */
	                if (element) {
	                    reinterpretAsAssignmentBindingPattern(element);
	                }
	            }
	        } else if (expr.type === Syntax.Identifier) {
	            if (isRestrictedWord(expr.name)) {
	                throwError({}, Messages.InvalidLHSInAssignment);
	            }
	        } else if (expr.type === Syntax.SpreadElement) {
	            reinterpretAsAssignmentBindingPattern(expr.argument);
	            if (expr.argument.type === Syntax.ObjectPattern) {
	                throwError({}, Messages.ObjectPatternAsSpread);
	            }
	        } else {
	            /* istanbul ignore else */
	            if (expr.type !== Syntax.MemberExpression && expr.type !== Syntax.CallExpression && expr.type !== Syntax.NewExpression) {
	                throwError({}, Messages.InvalidLHSInAssignment);
	            }
	        }
	    }

	    // 13.2.3 BindingPattern

	    function reinterpretAsDestructuredParameter(options, expr) {
	        var i, len, property, element;

	        if (expr.type === Syntax.ObjectExpression) {
	            expr.type = Syntax.ObjectPattern;
	            for (i = 0, len = expr.properties.length; i < len; i += 1) {
	                property = expr.properties[i];
	                if (property.type === Syntax.SpreadProperty) {
	                    if (i < len - 1) {
	                        throwError({}, Messages.PropertyAfterSpreadProperty);
	                    }
	                    reinterpretAsDestructuredParameter(options, property.argument);
	                } else {
	                    if (property.kind !== 'init') {
	                        throwError({}, Messages.InvalidLHSInFormalsList);
	                    }
	                    reinterpretAsDestructuredParameter(options, property.value);
	                }
	            }
	        } else if (expr.type === Syntax.ArrayExpression) {
	            expr.type = Syntax.ArrayPattern;
	            for (i = 0, len = expr.elements.length; i < len; i += 1) {
	                element = expr.elements[i];
	                if (element) {
	                    reinterpretAsDestructuredParameter(options, element);
	                }
	            }
	        } else if (expr.type === Syntax.Identifier) {
	            validateParam(options, expr, expr.name);
	        } else if (expr.type === Syntax.SpreadElement) {
	            // BindingRestElement only allows BindingIdentifier
	            if (expr.argument.type !== Syntax.Identifier) {
	                throwError({}, Messages.InvalidLHSInFormalsList);
	            }
	            validateParam(options, expr.argument, expr.argument.name);
	        } else {
	            throwError({}, Messages.InvalidLHSInFormalsList);
	        }
	    }

	    function reinterpretAsCoverFormalsList(expressions) {
	        var i, len, param, params, defaults, defaultCount, options, rest;

	        params = [];
	        defaults = [];
	        defaultCount = 0;
	        rest = null;
	        options = {
	            paramSet: new StringMap()
	        };

	        for (i = 0, len = expressions.length; i < len; i += 1) {
	            param = expressions[i];
	            if (param.type === Syntax.Identifier) {
	                params.push(param);
	                defaults.push(null);
	                validateParam(options, param, param.name);
	            } else if (param.type === Syntax.ObjectExpression || param.type === Syntax.ArrayExpression) {
	                reinterpretAsDestructuredParameter(options, param);
	                params.push(param);
	                defaults.push(null);
	            } else if (param.type === Syntax.SpreadElement) {
	                assert(i === len - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
	                if (param.argument.type !== Syntax.Identifier) {
	                    throwError({}, Messages.InvalidLHSInFormalsList);
	                }
	                reinterpretAsDestructuredParameter(options, param.argument);
	                rest = param.argument;
	            } else if (param.type === Syntax.AssignmentExpression) {
	                params.push(param.left);
	                defaults.push(param.right);
	                ++defaultCount;
	                validateParam(options, param.left, param.left.name);
	            } else {
	                return null;
	            }
	        }

	        if (options.message === Messages.StrictParamDupe) {
	            throwError(
	                strict ? options.stricted : options.firstRestricted,
	                options.message
	            );
	        }

	        if (defaultCount === 0) {
	            defaults = [];
	        }

	        return {
	            params: params,
	            defaults: defaults,
	            rest: rest,
	            stricted: options.stricted,
	            firstRestricted: options.firstRestricted,
	            message: options.message
	        };
	    }

	    function parseArrowFunctionExpression(options, marker) {
	        var previousStrict, previousYieldAllowed, previousAwaitAllowed, body;

	        expect('=>');

	        previousStrict = strict;
	        previousYieldAllowed = state.yieldAllowed;
	        state.yieldAllowed = false;
	        previousAwaitAllowed = state.awaitAllowed;
	        state.awaitAllowed = !!options.async;
	        body = parseConciseBody();

	        if (strict && options.firstRestricted) {
	            throwError(options.firstRestricted, options.message);
	        }
	        if (strict && options.stricted) {
	            throwErrorTolerant(options.stricted, options.message);
	        }

	        strict = previousStrict;
	        state.yieldAllowed = previousYieldAllowed;
	        state.awaitAllowed = previousAwaitAllowed;

	        return markerApply(marker, delegate.createArrowFunctionExpression(
	            options.params,
	            options.defaults,
	            body,
	            options.rest,
	            body.type !== Syntax.BlockStatement,
	            !!options.async
	        ));
	    }

	    function parseAssignmentExpression() {
	        var marker, expr, token, params, oldParenthesizedCount,
	            startsWithParen = false, backtrackToken = lookahead,
	            possiblyAsync = false;

	        if (matchYield()) {
	            return parseYieldExpression();
	        }

	        if (matchAwait()) {
	            return parseAwaitExpression();
	        }

	        oldParenthesizedCount = state.parenthesizedCount;

	        marker = markerCreate();

	        if (matchAsyncFuncExprOrDecl()) {
	            return parseFunctionExpression();
	        }

	        if (matchAsync()) {
	            // We can't be completely sure that this 'async' token is
	            // actually a contextual keyword modifying a function
	            // expression, so we might have to un-lex() it later by
	            // calling rewind(backtrackToken).
	            possiblyAsync = true;
	            lex();
	        }

	        if (match('(')) {
	            token = lookahead2();
	            if ((token.type === Token.Punctuator && token.value === ')') || token.value === '...') {
	                params = parseParams();
	                if (!match('=>')) {
	                    throwUnexpected(lex());
	                }
	                params.async = possiblyAsync;
	                return parseArrowFunctionExpression(params, marker);
	            }
	            startsWithParen = true;
	        }

	        token = lookahead;

	        // If the 'async' keyword is not followed by a '(' character or an
	        // identifier, then it can't be an arrow function modifier, and we
	        // should interpret it as a normal identifer.
	        if (possiblyAsync && !match('(') && token.type !== Token.Identifier) {
	            possiblyAsync = false;
	            rewind(backtrackToken);
	        }

	        expr = parseConditionalExpression();

	        if (match('=>') &&
	                (state.parenthesizedCount === oldParenthesizedCount ||
	                state.parenthesizedCount === (oldParenthesizedCount + 1))) {
	            if (expr.type === Syntax.Identifier) {
	                params = reinterpretAsCoverFormalsList([ expr ]);
	            } else if (expr.type === Syntax.AssignmentExpression ||
	                    expr.type === Syntax.ArrayExpression ||
	                    expr.type === Syntax.ObjectExpression) {
	                if (!startsWithParen) {
	                    throwUnexpected(lex());
	                }
	                params = reinterpretAsCoverFormalsList([ expr ]);
	            } else if (expr.type === Syntax.SequenceExpression) {
	                params = reinterpretAsCoverFormalsList(expr.expressions);
	            }
	            if (params) {
	                params.async = possiblyAsync;
	                return parseArrowFunctionExpression(params, marker);
	            }
	        }

	        // If we haven't returned by now, then the 'async' keyword was not
	        // a function modifier, and we should rewind and interpret it as a
	        // normal identifier.
	        if (possiblyAsync) {
	            possiblyAsync = false;
	            rewind(backtrackToken);
	            expr = parseConditionalExpression();
	        }

	        if (matchAssign()) {
	            // 11.13.1
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant(token, Messages.StrictLHSAssignment);
	            }

	            // ES.next draf 11.13 Runtime Semantics step 1
	            if (match('=') && (expr.type === Syntax.ObjectExpression || expr.type === Syntax.ArrayExpression)) {
	                reinterpretAsAssignmentBindingPattern(expr);
	            } else if (!isLeftHandSide(expr)) {
	                throwError({}, Messages.InvalidLHSInAssignment);
	            }

	            expr = markerApply(marker, delegate.createAssignmentExpression(lex().value, expr, parseAssignmentExpression()));
	        }

	        return expr;
	    }

	    // 11.14 Comma Operator

	    function parseExpression() {
	        var marker, expr, expressions, sequence, spreadFound;

	        marker = markerCreate();
	        expr = parseAssignmentExpression();
	        expressions = [ expr ];

	        if (match(',')) {
	            while (index < length) {
	                if (!match(',')) {
	                    break;
	                }

	                lex();
	                expr = parseSpreadOrAssignmentExpression();
	                expressions.push(expr);

	                if (expr.type === Syntax.SpreadElement) {
	                    spreadFound = true;
	                    if (!match(')')) {
	                        throwError({}, Messages.ElementAfterSpreadElement);
	                    }
	                    break;
	                }
	            }

	            sequence = markerApply(marker, delegate.createSequenceExpression(expressions));
	        }

	        if (spreadFound && lookahead2().value !== '=>') {
	            throwError({}, Messages.IllegalSpread);
	        }

	        return sequence || expr;
	    }

	    // 12.1 Block

	    function parseStatementList() {
	        var list = [],
	            statement;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            statement = parseSourceElement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            list.push(statement);
	        }

	        return list;
	    }

	    function parseBlock() {
	        var block, marker = markerCreate();

	        expect('{');

	        block = parseStatementList();

	        expect('}');

	        return markerApply(marker, delegate.createBlockStatement(block));
	    }

	    // 12.2 Variable Statement

	    function parseTypeParameterDeclaration() {
	        var marker = markerCreate(), paramTypes = [];

	        expect('<');
	        while (!match('>')) {
	            paramTypes.push(parseTypeAnnotatableIdentifier());
	            if (!match('>')) {
	                expect(',');
	            }
	        }
	        expect('>');

	        return markerApply(marker, delegate.createTypeParameterDeclaration(
	            paramTypes
	        ));
	    }

	    function parseTypeParameterInstantiation() {
	        var marker = markerCreate(), oldInType = state.inType, paramTypes = [];

	        state.inType = true;

	        expect('<');
	        while (!match('>')) {
	            paramTypes.push(parseType());
	            if (!match('>')) {
	                expect(',');
	            }
	        }
	        expect('>');

	        state.inType = oldInType;

	        return markerApply(marker, delegate.createTypeParameterInstantiation(
	            paramTypes
	        ));
	    }

	    function parseObjectTypeIndexer(marker, isStatic) {
	        var id, key, value;

	        expect('[');
	        id = parseObjectPropertyKey();
	        expect(':');
	        key = parseType();
	        expect(']');
	        expect(':');
	        value = parseType();

	        return markerApply(marker, delegate.createObjectTypeIndexer(
	            id,
	            key,
	            value,
	            isStatic
	        ));
	    }

	    function parseObjectTypeMethodish(marker) {
	        var params = [], rest = null, returnType, typeParameters = null;
	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }

	        expect('(');
	        while (lookahead.type === Token.Identifier) {
	            params.push(parseFunctionTypeParam());
	            if (!match(')')) {
	                expect(',');
	            }
	        }

	        if (match('...')) {
	            lex();
	            rest = parseFunctionTypeParam();
	        }
	        expect(')');
	        expect(':');
	        returnType = parseType();

	        return markerApply(marker, delegate.createFunctionTypeAnnotation(
	            params,
	            returnType,
	            rest,
	            typeParameters
	        ));
	    }

	    function parseObjectTypeMethod(marker, isStatic, key) {
	        var optional = false, value;
	        value = parseObjectTypeMethodish(marker);

	        return markerApply(marker, delegate.createObjectTypeProperty(
	            key,
	            value,
	            optional,
	            isStatic
	        ));
	    }

	    function parseObjectTypeCallProperty(marker, isStatic) {
	        var valueMarker = markerCreate();
	        return markerApply(marker, delegate.createObjectTypeCallProperty(
	            parseObjectTypeMethodish(valueMarker),
	            isStatic
	        ));
	    }

	    function parseObjectType(allowStatic) {
	        var callProperties = [], indexers = [], marker, optional = false,
	            properties = [], propertyKey, propertyTypeAnnotation,
	            token, isStatic, matchStatic;

	        expect('{');

	        while (!match('}')) {
	            marker = markerCreate();
	            matchStatic =
	                   strict
	                   ? matchKeyword('static')
	                   : matchContextualKeyword('static');

	            if (allowStatic && matchStatic) {
	                token = lex();
	                isStatic = true;
	            }

	            if (match('[')) {
	                indexers.push(parseObjectTypeIndexer(marker, isStatic));
	            } else if (match('(') || match('<')) {
	                callProperties.push(parseObjectTypeCallProperty(marker, allowStatic));
	            } else {
	                if (isStatic && match(':')) {
	                    propertyKey = markerApply(marker, delegate.createIdentifier(token));
	                    throwErrorTolerant(token, Messages.StrictReservedWord);
	                } else {
	                    propertyKey = parseObjectPropertyKey();
	                }
	                if (match('<') || match('(')) {
	                    // This is a method property
	                    properties.push(parseObjectTypeMethod(marker, isStatic, propertyKey));
	                } else {
	                    if (match('?')) {
	                        lex();
	                        optional = true;
	                    }
	                    expect(':');
	                    propertyTypeAnnotation = parseType();
	                    properties.push(markerApply(marker, delegate.createObjectTypeProperty(
	                        propertyKey,
	                        propertyTypeAnnotation,
	                        optional,
	                        isStatic
	                    )));
	                }
	            }

	            if (match(';')) {
	                lex();
	            } else if (!match('}')) {
	                throwUnexpected(lookahead);
	            }
	        }

	        expect('}');

	        return delegate.createObjectTypeAnnotation(
	            properties,
	            indexers,
	            callProperties
	        );
	    }

	    function parseGenericType() {
	        var marker = markerCreate(),
	            typeParameters = null, typeIdentifier;

	        typeIdentifier = parseVariableIdentifier();

	        while (match('.')) {
	            expect('.');
	            typeIdentifier = markerApply(marker, delegate.createQualifiedTypeIdentifier(
	                typeIdentifier,
	                parseVariableIdentifier()
	            ));
	        }

	        if (match('<')) {
	            typeParameters = parseTypeParameterInstantiation();
	        }

	        return markerApply(marker, delegate.createGenericTypeAnnotation(
	            typeIdentifier,
	            typeParameters
	        ));
	    }

	    function parseVoidType() {
	        var marker = markerCreate();
	        expectKeyword('void');
	        return markerApply(marker, delegate.createVoidTypeAnnotation());
	    }

	    function parseTypeofType() {
	        var argument, marker = markerCreate();
	        expectKeyword('typeof');
	        argument = parsePrimaryType();
	        return markerApply(marker, delegate.createTypeofTypeAnnotation(
	            argument
	        ));
	    }

	    function parseTupleType() {
	        var marker = markerCreate(), types = [];
	        expect('[');
	        // We allow trailing commas
	        while (index < length && !match(']')) {
	            types.push(parseType());
	            if (match(']')) {
	                break;
	            }
	            expect(',');
	        }
	        expect(']');
	        return markerApply(marker, delegate.createTupleTypeAnnotation(
	            types
	        ));
	    }

	    function parseFunctionTypeParam() {
	        var marker = markerCreate(), name, optional = false, typeAnnotation;
	        name = parseVariableIdentifier();
	        if (match('?')) {
	            lex();
	            optional = true;
	        }
	        expect(':');
	        typeAnnotation = parseType();
	        return markerApply(marker, delegate.createFunctionTypeParam(
	            name,
	            typeAnnotation,
	            optional
	        ));
	    }

	    function parseFunctionTypeParams() {
	        var ret = { params: [], rest: null };
	        while (lookahead.type === Token.Identifier) {
	            ret.params.push(parseFunctionTypeParam());
	            if (!match(')')) {
	                expect(',');
	            }
	        }

	        if (match('...')) {
	            lex();
	            ret.rest = parseFunctionTypeParam();
	        }
	        return ret;
	    }

	    // The parsing of types roughly parallels the parsing of expressions, and
	    // primary types are kind of like primary expressions...they're the
	    // primitives with which other types are constructed.
	    function parsePrimaryType() {
	        var params = null, returnType = null,
	            marker = markerCreate(), rest = null, tmp,
	            typeParameters, token, type, isGroupedType = false;

	        switch (lookahead.type) {
	        case Token.Identifier:
	            switch (lookahead.value) {
	            case 'any':
	                lex();
	                return markerApply(marker, delegate.createAnyTypeAnnotation());
	            case 'bool':  // fallthrough
	            case 'boolean':
	                lex();
	                return markerApply(marker, delegate.createBooleanTypeAnnotation());
	            case 'number':
	                lex();
	                return markerApply(marker, delegate.createNumberTypeAnnotation());
	            case 'string':
	                lex();
	                return markerApply(marker, delegate.createStringTypeAnnotation());
	            }
	            return markerApply(marker, parseGenericType());
	        case Token.Punctuator:
	            switch (lookahead.value) {
	            case '{':
	                return markerApply(marker, parseObjectType());
	            case '[':
	                return parseTupleType();
	            case '<':
	                typeParameters = parseTypeParameterDeclaration();
	                expect('(');
	                tmp = parseFunctionTypeParams();
	                params = tmp.params;
	                rest = tmp.rest;
	                expect(')');

	                expect('=>');

	                returnType = parseType();

	                return markerApply(marker, delegate.createFunctionTypeAnnotation(
	                    params,
	                    returnType,
	                    rest,
	                    typeParameters
	                ));
	            case '(':
	                lex();
	                // Check to see if this is actually a grouped type
	                if (!match(')') && !match('...')) {
	                    if (lookahead.type === Token.Identifier) {
	                        token = lookahead2();
	                        isGroupedType = token.value !== '?' && token.value !== ':';
	                    } else {
	                        isGroupedType = true;
	                    }
	                }

	                if (isGroupedType) {
	                    type = parseType();
	                    expect(')');

	                    // If we see a => next then someone was probably confused about
	                    // function types, so we can provide a better error message
	                    if (match('=>')) {
	                        throwError({}, Messages.ConfusedAboutFunctionType);
	                    }

	                    return type;
	                }

	                tmp = parseFunctionTypeParams();
	                params = tmp.params;
	                rest = tmp.rest;

	                expect(')');

	                expect('=>');

	                returnType = parseType();

	                return markerApply(marker, delegate.createFunctionTypeAnnotation(
	                    params,
	                    returnType,
	                    rest,
	                    null /* typeParameters */
	                ));
	            }
	            break;
	        case Token.Keyword:
	            switch (lookahead.value) {
	            case 'void':
	                return markerApply(marker, parseVoidType());
	            case 'typeof':
	                return markerApply(marker, parseTypeofType());
	            }
	            break;
	        case Token.StringLiteral:
	            token = lex();
	            if (token.octal) {
	                throwError(token, Messages.StrictOctalLiteral);
	            }
	            return markerApply(marker, delegate.createStringLiteralTypeAnnotation(
	                token
	            ));
	        }

	        throwUnexpected(lookahead);
	    }

	    function parsePostfixType() {
	        var marker = markerCreate(), t = parsePrimaryType();
	        if (match('[')) {
	            expect('[');
	            expect(']');
	            return markerApply(marker, delegate.createArrayTypeAnnotation(t));
	        }
	        return t;
	    }

	    function parsePrefixType() {
	        var marker = markerCreate();
	        if (match('?')) {
	            lex();
	            return markerApply(marker, delegate.createNullableTypeAnnotation(
	                parsePrefixType()
	            ));
	        }
	        return parsePostfixType();
	    }


	    function parseIntersectionType() {
	        var marker = markerCreate(), type, types;
	        type = parsePrefixType();
	        types = [type];
	        while (match('&')) {
	            lex();
	            types.push(parsePrefixType());
	        }

	        return types.length === 1 ?
	                type :
	                markerApply(marker, delegate.createIntersectionTypeAnnotation(
	                    types
	                ));
	    }

	    function parseUnionType() {
	        var marker = markerCreate(), type, types;
	        type = parseIntersectionType();
	        types = [type];
	        while (match('|')) {
	            lex();
	            types.push(parseIntersectionType());
	        }
	        return types.length === 1 ?
	                type :
	                markerApply(marker, delegate.createUnionTypeAnnotation(
	                    types
	                ));
	    }

	    function parseType() {
	        var oldInType = state.inType, type;
	        state.inType = true;

	        type = parseUnionType();

	        state.inType = oldInType;
	        return type;
	    }

	    function parseTypeAnnotation() {
	        var marker = markerCreate(), type;

	        expect(':');
	        type = parseType();

	        return markerApply(marker, delegate.createTypeAnnotation(type));
	    }

	    function parseVariableIdentifier() {
	        var marker = markerCreate(),
	            token = lex();

	        if (token.type !== Token.Identifier) {
	            throwUnexpected(token);
	        }

	        return markerApply(marker, delegate.createIdentifier(token.value));
	    }

	    function parseTypeAnnotatableIdentifier(requireTypeAnnotation, canBeOptionalParam) {
	        var marker = markerCreate(),
	            ident = parseVariableIdentifier(),
	            isOptionalParam = false;

	        if (canBeOptionalParam && match('?')) {
	            expect('?');
	            isOptionalParam = true;
	        }

	        if (requireTypeAnnotation || match(':')) {
	            ident.typeAnnotation = parseTypeAnnotation();
	            ident = markerApply(marker, ident);
	        }

	        if (isOptionalParam) {
	            ident.optional = true;
	            ident = markerApply(marker, ident);
	        }

	        return ident;
	    }

	    function parseVariableDeclaration(kind) {
	        var id,
	            marker = markerCreate(),
	            init = null,
	            typeAnnotationMarker = markerCreate();
	        if (match('{')) {
	            id = parseObjectInitialiser();
	            reinterpretAsAssignmentBindingPattern(id);
	            if (match(':')) {
	                id.typeAnnotation = parseTypeAnnotation();
	                markerApply(typeAnnotationMarker, id);
	            }
	        } else if (match('[')) {
	            id = parseArrayInitialiser();
	            reinterpretAsAssignmentBindingPattern(id);
	            if (match(':')) {
	                id.typeAnnotation = parseTypeAnnotation();
	                markerApply(typeAnnotationMarker, id);
	            }
	        } else {
	            /* istanbul ignore next */
	            id = state.allowKeyword ? parseNonComputedProperty() : parseTypeAnnotatableIdentifier();
	            // 12.2.1
	            if (strict && isRestrictedWord(id.name)) {
	                throwErrorTolerant({}, Messages.StrictVarName);
	            }
	        }

	        if (kind === 'const') {
	            if (!match('=')) {
	                throwError({}, Messages.NoUninitializedConst);
	            }
	            expect('=');
	            init = parseAssignmentExpression();
	        } else if (match('=')) {
	            lex();
	            init = parseAssignmentExpression();
	        }

	        return markerApply(marker, delegate.createVariableDeclarator(id, init));
	    }

	    function parseVariableDeclarationList(kind) {
	        var list = [];

	        do {
	            list.push(parseVariableDeclaration(kind));
	            if (!match(',')) {
	                break;
	            }
	            lex();
	        } while (index < length);

	        return list;
	    }

	    function parseVariableStatement() {
	        var declarations, marker = markerCreate();

	        expectKeyword('var');

	        declarations = parseVariableDeclarationList();

	        consumeSemicolon();

	        return markerApply(marker, delegate.createVariableDeclaration(declarations, 'var'));
	    }

	    // kind may be `const` or `let`
	    // Both are experimental and not in the specification yet.
	    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
	    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
	    function parseConstLetDeclaration(kind) {
	        var declarations, marker = markerCreate();

	        expectKeyword(kind);

	        declarations = parseVariableDeclarationList(kind);

	        consumeSemicolon();

	        return markerApply(marker, delegate.createVariableDeclaration(declarations, kind));
	    }

	    // people.mozilla.org/~jorendorff/es6-draft.html

	    function parseModuleSpecifier() {
	        var marker = markerCreate(),
	            specifier;

	        if (lookahead.type !== Token.StringLiteral) {
	            throwError({}, Messages.InvalidModuleSpecifier);
	        }
	        specifier = delegate.createModuleSpecifier(lookahead);
	        lex();
	        return markerApply(marker, specifier);
	    }

	    function parseExportBatchSpecifier() {
	        var marker = markerCreate();
	        expect('*');
	        return markerApply(marker, delegate.createExportBatchSpecifier());
	    }

	    function parseExportSpecifier() {
	        var id, name = null, marker = markerCreate(), from;
	        if (matchKeyword('default')) {
	            lex();
	            id = markerApply(marker, delegate.createIdentifier('default'));
	            // export {default} from "something";
	        } else {
	            id = parseVariableIdentifier();
	        }
	        if (matchContextualKeyword('as')) {
	            lex();
	            name = parseNonComputedProperty();
	        }

	        return markerApply(marker, delegate.createExportSpecifier(id, name));
	    }

	    function parseExportDeclaration() {
	        var declaration = null,
	            possibleIdentifierToken, sourceElement,
	            isExportFromIdentifier,
	            src = null, specifiers = [],
	            marker = markerCreate();

	        expectKeyword('export');

	        if (matchKeyword('default')) {
	            // covers:
	            // export default ...
	            lex();
	            if (matchKeyword('function') || matchKeyword('class')) {
	                possibleIdentifierToken = lookahead2();
	                if (isIdentifierName(possibleIdentifierToken)) {
	                    // covers:
	                    // export default function foo () {}
	                    // export default class foo {}
	                    sourceElement = parseSourceElement();
	                    return markerApply(marker, delegate.createExportDeclaration(true, sourceElement, [sourceElement.id], null));
	                }
	                // covers:
	                // export default function () {}
	                // export default class {}
	                switch (lookahead.value) {
	                case 'class':
	                    return markerApply(marker, delegate.createExportDeclaration(true, parseClassExpression(), [], null));
	                case 'function':
	                    return markerApply(marker, delegate.createExportDeclaration(true, parseFunctionExpression(), [], null));
	                }
	            }

	            if (matchContextualKeyword('from')) {
	                throwError({}, Messages.UnexpectedToken, lookahead.value);
	            }

	            // covers:
	            // export default {};
	            // export default [];
	            if (match('{')) {
	                declaration = parseObjectInitialiser();
	            } else if (match('[')) {
	                declaration = parseArrayInitialiser();
	            } else {
	                declaration = parseAssignmentExpression();
	            }
	            consumeSemicolon();
	            return markerApply(marker, delegate.createExportDeclaration(true, declaration, [], null));
	        }

	        // non-default export
	        if (lookahead.type === Token.Keyword || matchContextualKeyword('type')) {
	            // covers:
	            // export var f = 1;
	            switch (lookahead.value) {
	            case 'type':
	            case 'let':
	            case 'const':
	            case 'var':
	            case 'class':
	            case 'function':
	                return markerApply(marker, delegate.createExportDeclaration(false, parseSourceElement(), specifiers, null));
	            }
	        }

	        if (match('*')) {
	            // covers:
	            // export * from "foo";
	            specifiers.push(parseExportBatchSpecifier());

	            if (!matchContextualKeyword('from')) {
	                throwError({}, lookahead.value ?
	                        Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	            }
	            lex();
	            src = parseModuleSpecifier();
	            consumeSemicolon();

	            return markerApply(marker, delegate.createExportDeclaration(false, null, specifiers, src));
	        }

	        expect('{');
	        if (!match('}')) {
	            do {
	                isExportFromIdentifier = isExportFromIdentifier || matchKeyword('default');
	                specifiers.push(parseExportSpecifier());
	            } while (match(',') && lex());
	        }
	        expect('}');

	        if (matchContextualKeyword('from')) {
	            // covering:
	            // export {default} from "foo";
	            // export {foo} from "foo";
	            lex();
	            src = parseModuleSpecifier();
	            consumeSemicolon();
	        } else if (isExportFromIdentifier) {
	            // covering:
	            // export {default}; // missing fromClause
	            throwError({}, lookahead.value ?
	                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	        } else {
	            // cover
	            // export {foo};
	            consumeSemicolon();
	        }
	        return markerApply(marker, delegate.createExportDeclaration(false, declaration, specifiers, src));
	    }


	    function parseImportSpecifier() {
	        // import {<foo as bar>} ...;
	        var id, name = null, marker = markerCreate();

	        id = parseNonComputedProperty();
	        if (matchContextualKeyword('as')) {
	            lex();
	            name = parseVariableIdentifier();
	        }

	        return markerApply(marker, delegate.createImportSpecifier(id, name));
	    }

	    function parseNamedImports() {
	        var specifiers = [];
	        // {foo, bar as bas}
	        expect('{');
	        if (!match('}')) {
	            do {
	                specifiers.push(parseImportSpecifier());
	            } while (match(',') && lex());
	        }
	        expect('}');
	        return specifiers;
	    }

	    function parseImportDefaultSpecifier() {
	        // import <foo> ...;
	        var id, marker = markerCreate();

	        id = parseNonComputedProperty();

	        return markerApply(marker, delegate.createImportDefaultSpecifier(id));
	    }

	    function parseImportNamespaceSpecifier() {
	        // import <* as foo> ...;
	        var id, marker = markerCreate();

	        expect('*');
	        if (!matchContextualKeyword('as')) {
	            throwError({}, Messages.NoAsAfterImportNamespace);
	        }
	        lex();
	        id = parseNonComputedProperty();

	        return markerApply(marker, delegate.createImportNamespaceSpecifier(id));
	    }

	    function parseImportDeclaration() {
	        var specifiers, src, marker = markerCreate(), isType = false, token2;

	        expectKeyword('import');

	        if (matchContextualKeyword('type')) {
	            token2 = lookahead2();
	            if ((token2.type === Token.Identifier && token2.value !== 'from') ||
	                    (token2.type === Token.Punctuator &&
	                        (token2.value === '{' || token2.value === '*'))) {
	                isType = true;
	                lex();
	            }
	        }

	        specifiers = [];

	        if (lookahead.type === Token.StringLiteral) {
	            // covers:
	            // import "foo";
	            src = parseModuleSpecifier();
	            consumeSemicolon();
	            return markerApply(marker, delegate.createImportDeclaration(specifiers, src, isType));
	        }

	        if (!matchKeyword('default') && isIdentifierName(lookahead)) {
	            // covers:
	            // import foo
	            // import foo, ...
	            specifiers.push(parseImportDefaultSpecifier());
	            if (match(',')) {
	                lex();
	            }
	        }
	        if (match('*')) {
	            // covers:
	            // import foo, * as foo
	            // import * as foo
	            specifiers.push(parseImportNamespaceSpecifier());
	        } else if (match('{')) {
	            // covers:
	            // import foo, {bar}
	            // import {bar}
	            specifiers = specifiers.concat(parseNamedImports());
	        }

	        if (!matchContextualKeyword('from')) {
	            throwError({}, lookahead.value ?
	                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	        }
	        lex();
	        src = parseModuleSpecifier();
	        consumeSemicolon();

	        return markerApply(marker, delegate.createImportDeclaration(specifiers, src, isType));
	    }

	    // 12.3 Empty Statement

	    function parseEmptyStatement() {
	        var marker = markerCreate();
	        expect(';');
	        return markerApply(marker, delegate.createEmptyStatement());
	    }

	    // 12.4 Expression Statement

	    function parseExpressionStatement() {
	        var marker = markerCreate(), expr = parseExpression();
	        consumeSemicolon();
	        return markerApply(marker, delegate.createExpressionStatement(expr));
	    }

	    // 12.5 If statement

	    function parseIfStatement() {
	        var test, consequent, alternate, marker = markerCreate();

	        expectKeyword('if');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        consequent = parseStatement();

	        if (matchKeyword('else')) {
	            lex();
	            alternate = parseStatement();
	        } else {
	            alternate = null;
	        }

	        return markerApply(marker, delegate.createIfStatement(test, consequent, alternate));
	    }

	    // 12.6 Iteration Statements

	    function parseDoWhileStatement() {
	        var body, test, oldInIteration, marker = markerCreate();

	        expectKeyword('do');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        expectKeyword('while');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        if (match(';')) {
	            lex();
	        }

	        return markerApply(marker, delegate.createDoWhileStatement(body, test));
	    }

	    function parseWhileStatement() {
	        var test, body, oldInIteration, marker = markerCreate();

	        expectKeyword('while');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        return markerApply(marker, delegate.createWhileStatement(test, body));
	    }

	    function parseForVariableDeclaration() {
	        var marker = markerCreate(),
	            token = lex(),
	            declarations = parseVariableDeclarationList();

	        return markerApply(marker, delegate.createVariableDeclaration(declarations, token.value));
	    }

	    function parseForStatement(opts) {
	        var init, test, update, left, right, body, operator, oldInIteration,
	            marker = markerCreate();
	        init = test = update = null;
	        expectKeyword('for');

	        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
	        if (matchContextualKeyword('each')) {
	            throwError({}, Messages.EachNotAllowed);
	        }

	        expect('(');

	        if (match(';')) {
	            lex();
	        } else {
	            if (matchKeyword('var') || matchKeyword('let') || matchKeyword('const')) {
	                state.allowIn = false;
	                init = parseForVariableDeclaration();
	                state.allowIn = true;

	                if (init.declarations.length === 1) {
	                    if (matchKeyword('in') || matchContextualKeyword('of')) {
	                        operator = lookahead;
	                        if (!((operator.value === 'in' || init.kind !== 'var') && init.declarations[0].init)) {
	                            lex();
	                            left = init;
	                            right = parseExpression();
	                            init = null;
	                        }
	                    }
	                }
	            } else {
	                state.allowIn = false;
	                init = parseExpression();
	                state.allowIn = true;

	                if (matchContextualKeyword('of')) {
	                    operator = lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                } else if (matchKeyword('in')) {
	                    // LeftHandSideExpression
	                    if (!isAssignableLeftHandSide(init)) {
	                        throwError({}, Messages.InvalidLHSInForIn);
	                    }
	                    operator = lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            }

	            if (typeof left === 'undefined') {
	                expect(';');
	            }
	        }

	        if (typeof left === 'undefined') {

	            if (!match(';')) {
	                test = parseExpression();
	            }
	            expect(';');

	            if (!match(')')) {
	                update = parseExpression();
	            }
	        }

	        expect(')');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        if (!(opts !== undefined && opts.ignoreBody)) {
	            body = parseStatement();
	        }

	        state.inIteration = oldInIteration;

	        if (typeof left === 'undefined') {
	            return markerApply(marker, delegate.createForStatement(init, test, update, body));
	        }

	        if (operator.value === 'in') {
	            return markerApply(marker, delegate.createForInStatement(left, right, body));
	        }
	        return markerApply(marker, delegate.createForOfStatement(left, right, body));
	    }

	    // 12.7 The continue statement

	    function parseContinueStatement() {
	        var label = null, marker = markerCreate();

	        expectKeyword('continue');

	        // Optimize the most common form: 'continue;'.
	        if (source.charCodeAt(index) === 59) {
	            lex();

	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }

	            return markerApply(marker, delegate.createContinueStatement(null));
	        }

	        if (peekLineTerminator()) {
	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }

	            return markerApply(marker, delegate.createContinueStatement(null));
	        }

	        if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();

	            if (!state.labelSet.has(label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }

	        consumeSemicolon();

	        if (label === null && !state.inIteration) {
	            throwError({}, Messages.IllegalContinue);
	        }

	        return markerApply(marker, delegate.createContinueStatement(label));
	    }

	    // 12.8 The break statement

	    function parseBreakStatement() {
	        var label = null, marker = markerCreate();

	        expectKeyword('break');

	        // Catch the very common case first: immediately a semicolon (char #59).
	        if (source.charCodeAt(index) === 59) {
	            lex();

	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }

	            return markerApply(marker, delegate.createBreakStatement(null));
	        }

	        if (peekLineTerminator()) {
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }

	            return markerApply(marker, delegate.createBreakStatement(null));
	        }

	        if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();

	            if (!state.labelSet.has(label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }

	        consumeSemicolon();

	        if (label === null && !(state.inIteration || state.inSwitch)) {
	            throwError({}, Messages.IllegalBreak);
	        }

	        return markerApply(marker, delegate.createBreakStatement(label));
	    }

	    // 12.9 The return statement

	    function parseReturnStatement() {
	        var argument = null, marker = markerCreate();

	        expectKeyword('return');

	        if (!state.inFunctionBody) {
	            throwErrorTolerant({}, Messages.IllegalReturn);
	        }

	        // 'return' followed by a space and an identifier is very common.
	        if (source.charCodeAt(index) === 32) {
	            if (isIdentifierStart(source.charCodeAt(index + 1))) {
	                argument = parseExpression();
	                consumeSemicolon();
	                return markerApply(marker, delegate.createReturnStatement(argument));
	            }
	        }

	        if (peekLineTerminator()) {
	            return markerApply(marker, delegate.createReturnStatement(null));
	        }

	        if (!match(';')) {
	            if (!match('}') && lookahead.type !== Token.EOF) {
	                argument = parseExpression();
	            }
	        }

	        consumeSemicolon();

	        return markerApply(marker, delegate.createReturnStatement(argument));
	    }

	    // 12.10 The with statement

	    function parseWithStatement() {
	        var object, body, marker = markerCreate();

	        if (strict) {
	            throwErrorTolerant({}, Messages.StrictModeWith);
	        }

	        expectKeyword('with');

	        expect('(');

	        object = parseExpression();

	        expect(')');

	        body = parseStatement();

	        return markerApply(marker, delegate.createWithStatement(object, body));
	    }

	    // 12.10 The swith statement

	    function parseSwitchCase() {
	        var test,
	            consequent = [],
	            sourceElement,
	            marker = markerCreate();

	        if (matchKeyword('default')) {
	            lex();
	            test = null;
	        } else {
	            expectKeyword('case');
	            test = parseExpression();
	        }
	        expect(':');

	        while (index < length) {
	            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
	                break;
	            }
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            consequent.push(sourceElement);
	        }

	        return markerApply(marker, delegate.createSwitchCase(test, consequent));
	    }

	    function parseSwitchStatement() {
	        var discriminant, cases, clause, oldInSwitch, defaultFound, marker = markerCreate();

	        expectKeyword('switch');

	        expect('(');

	        discriminant = parseExpression();

	        expect(')');

	        expect('{');

	        cases = [];

	        if (match('}')) {
	            lex();
	            return markerApply(marker, delegate.createSwitchStatement(discriminant, cases));
	        }

	        oldInSwitch = state.inSwitch;
	        state.inSwitch = true;
	        defaultFound = false;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            clause = parseSwitchCase();
	            if (clause.test === null) {
	                if (defaultFound) {
	                    throwError({}, Messages.MultipleDefaultsInSwitch);
	                }
	                defaultFound = true;
	            }
	            cases.push(clause);
	        }

	        state.inSwitch = oldInSwitch;

	        expect('}');

	        return markerApply(marker, delegate.createSwitchStatement(discriminant, cases));
	    }

	    // 12.13 The throw statement

	    function parseThrowStatement() {
	        var argument, marker = markerCreate();

	        expectKeyword('throw');

	        if (peekLineTerminator()) {
	            throwError({}, Messages.NewlineAfterThrow);
	        }

	        argument = parseExpression();

	        consumeSemicolon();

	        return markerApply(marker, delegate.createThrowStatement(argument));
	    }

	    // 12.14 The try statement

	    function parseCatchClause() {
	        var param, body, marker = markerCreate();

	        expectKeyword('catch');

	        expect('(');
	        if (match(')')) {
	            throwUnexpected(lookahead);
	        }

	        param = parseExpression();
	        // 12.14.1
	        if (strict && param.type === Syntax.Identifier && isRestrictedWord(param.name)) {
	            throwErrorTolerant({}, Messages.StrictCatchVariable);
	        }

	        expect(')');
	        body = parseBlock();
	        return markerApply(marker, delegate.createCatchClause(param, body));
	    }

	    function parseTryStatement() {
	        var block, handlers = [], finalizer = null, marker = markerCreate();

	        expectKeyword('try');

	        block = parseBlock();

	        if (matchKeyword('catch')) {
	            handlers.push(parseCatchClause());
	        }

	        if (matchKeyword('finally')) {
	            lex();
	            finalizer = parseBlock();
	        }

	        if (handlers.length === 0 && !finalizer) {
	            throwError({}, Messages.NoCatchOrFinally);
	        }

	        return markerApply(marker, delegate.createTryStatement(block, [], handlers, finalizer));
	    }

	    // 12.15 The debugger statement

	    function parseDebuggerStatement() {
	        var marker = markerCreate();
	        expectKeyword('debugger');

	        consumeSemicolon();

	        return markerApply(marker, delegate.createDebuggerStatement());
	    }

	    // 12 Statements

	    function parseStatement() {
	        var type = lookahead.type,
	            marker,
	            expr,
	            labeledBody;

	        if (type === Token.EOF) {
	            throwUnexpected(lookahead);
	        }

	        if (type === Token.Punctuator) {
	            switch (lookahead.value) {
	            case ';':
	                return parseEmptyStatement();
	            case '{':
	                return parseBlock();
	            case '(':
	                return parseExpressionStatement();
	            default:
	                break;
	            }
	        }

	        if (type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'break':
	                return parseBreakStatement();
	            case 'continue':
	                return parseContinueStatement();
	            case 'debugger':
	                return parseDebuggerStatement();
	            case 'do':
	                return parseDoWhileStatement();
	            case 'for':
	                return parseForStatement();
	            case 'function':
	                return parseFunctionDeclaration();
	            case 'class':
	                return parseClassDeclaration();
	            case 'if':
	                return parseIfStatement();
	            case 'return':
	                return parseReturnStatement();
	            case 'switch':
	                return parseSwitchStatement();
	            case 'throw':
	                return parseThrowStatement();
	            case 'try':
	                return parseTryStatement();
	            case 'var':
	                return parseVariableStatement();
	            case 'while':
	                return parseWhileStatement();
	            case 'with':
	                return parseWithStatement();
	            default:
	                break;
	            }
	        }

	        if (matchAsyncFuncExprOrDecl()) {
	            return parseFunctionDeclaration();
	        }

	        marker = markerCreate();
	        expr = parseExpression();

	        // 12.12 Labelled Statements
	        if ((expr.type === Syntax.Identifier) && match(':')) {
	            lex();

	            if (state.labelSet.has(expr.name)) {
	                throwError({}, Messages.Redeclaration, 'Label', expr.name);
	            }

	            state.labelSet.set(expr.name, true);
	            labeledBody = parseStatement();
	            state.labelSet.delete(expr.name);
	            return markerApply(marker, delegate.createLabeledStatement(expr, labeledBody));
	        }

	        consumeSemicolon();

	        return markerApply(marker, delegate.createExpressionStatement(expr));
	    }

	    // 13 Function Definition

	    function parseConciseBody() {
	        if (match('{')) {
	            return parseFunctionSourceElements();
	        }
	        return parseAssignmentExpression();
	    }

	    function parseFunctionSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted,
	            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, oldParenthesizedCount,
	            marker = markerCreate();

	        expect('{');

	        while (index < length) {
	            if (lookahead.type !== Token.StringLiteral) {
	                break;
	            }
	            token = lookahead;

	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }

	        oldLabelSet = state.labelSet;
	        oldInIteration = state.inIteration;
	        oldInSwitch = state.inSwitch;
	        oldInFunctionBody = state.inFunctionBody;
	        oldParenthesizedCount = state.parenthesizedCount;

	        state.labelSet = new StringMap();
	        state.inIteration = false;
	        state.inSwitch = false;
	        state.inFunctionBody = true;
	        state.parenthesizedCount = 0;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }

	        expect('}');

	        state.labelSet = oldLabelSet;
	        state.inIteration = oldInIteration;
	        state.inSwitch = oldInSwitch;
	        state.inFunctionBody = oldInFunctionBody;
	        state.parenthesizedCount = oldParenthesizedCount;

	        return markerApply(marker, delegate.createBlockStatement(sourceElements));
	    }

	    function validateParam(options, param, name) {
	        if (strict) {
	            if (isRestrictedWord(name)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamName;
	            }
	            if (options.paramSet.has(name)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        } else if (!options.firstRestricted) {
	            if (isRestrictedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictParamName;
	            } else if (isStrictModeReservedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictReservedWord;
	            } else if (options.paramSet.has(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        }
	        options.paramSet.set(name, true);
	    }

	    function parseParam(options) {
	        var marker, token, rest, param, def;

	        token = lookahead;
	        if (token.value === '...') {
	            token = lex();
	            rest = true;
	        }

	        if (match('[')) {
	            marker = markerCreate();
	            param = parseArrayInitialiser();
	            reinterpretAsDestructuredParameter(options, param);
	            if (match(':')) {
	                param.typeAnnotation = parseTypeAnnotation();
	                markerApply(marker, param);
	            }
	        } else if (match('{')) {
	            marker = markerCreate();
	            if (rest) {
	                throwError({}, Messages.ObjectPatternAsRestParameter);
	            }
	            param = parseObjectInitialiser();
	            reinterpretAsDestructuredParameter(options, param);
	            if (match(':')) {
	                param.typeAnnotation = parseTypeAnnotation();
	                markerApply(marker, param);
	            }
	        } else {
	            param =
	                rest
	                ? parseTypeAnnotatableIdentifier(
	                    false, /* requireTypeAnnotation */
	                    false /* canBeOptionalParam */
	                )
	                : parseTypeAnnotatableIdentifier(
	                    false, /* requireTypeAnnotation */
	                    true /* canBeOptionalParam */
	                );

	            validateParam(options, token, token.value);
	        }

	        if (match('=')) {
	            if (rest) {
	                throwErrorTolerant(lookahead, Messages.DefaultRestParameter);
	            }
	            lex();
	            def = parseAssignmentExpression();
	            ++options.defaultCount;
	        }

	        if (rest) {
	            if (!match(')')) {
	                throwError({}, Messages.ParameterAfterRestParameter);
	            }
	            options.rest = param;
	            return false;
	        }

	        options.params.push(param);
	        options.defaults.push(def);
	        return !match(')');
	    }

	    function parseParams(firstRestricted) {
	        var options, marker = markerCreate();

	        options = {
	            params: [],
	            defaultCount: 0,
	            defaults: [],
	            rest: null,
	            firstRestricted: firstRestricted
	        };

	        expect('(');

	        if (!match(')')) {
	            options.paramSet = new StringMap();
	            while (index < length) {
	                if (!parseParam(options)) {
	                    break;
	                }
	                expect(',');
	            }
	        }

	        expect(')');

	        if (options.defaultCount === 0) {
	            options.defaults = [];
	        }

	        if (match(':')) {
	            options.returnType = parseTypeAnnotation();
	        }

	        return markerApply(marker, options);
	    }

	    function parseFunctionDeclaration() {
	        var id, body, token, tmp, firstRestricted, message, generator, isAsync,
	            previousStrict, previousYieldAllowed, previousAwaitAllowed,
	            marker = markerCreate(), typeParameters;

	        isAsync = false;
	        if (matchAsync()) {
	            lex();
	            isAsync = true;
	        }

	        expectKeyword('function');

	        generator = false;
	        if (match('*')) {
	            lex();
	            generator = true;
	        }

	        token = lookahead;

	        id = parseVariableIdentifier();

	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }

	        if (strict) {
	            if (isRestrictedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictFunctionName);
	            }
	        } else {
	            if (isRestrictedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictFunctionName;
	            } else if (isStrictModeReservedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictReservedWord;
	            }
	        }

	        tmp = parseParams(firstRestricted);
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }

	        previousStrict = strict;
	        previousYieldAllowed = state.yieldAllowed;
	        state.yieldAllowed = generator;
	        previousAwaitAllowed = state.awaitAllowed;
	        state.awaitAllowed = isAsync;

	        body = parseFunctionSourceElements();

	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && tmp.stricted) {
	            throwErrorTolerant(tmp.stricted, message);
	        }
	        strict = previousStrict;
	        state.yieldAllowed = previousYieldAllowed;
	        state.awaitAllowed = previousAwaitAllowed;

	        return markerApply(
	            marker,
	            delegate.createFunctionDeclaration(
	                id,
	                tmp.params,
	                tmp.defaults,
	                body,
	                tmp.rest,
	                generator,
	                false,
	                isAsync,
	                tmp.returnType,
	                typeParameters
	            )
	        );
	    }

	    function parseFunctionExpression() {
	        var token, id = null, firstRestricted, message, tmp, body, generator, isAsync,
	            previousStrict, previousYieldAllowed, previousAwaitAllowed,
	            marker = markerCreate(), typeParameters;

	        isAsync = false;
	        if (matchAsync()) {
	            lex();
	            isAsync = true;
	        }

	        expectKeyword('function');

	        generator = false;

	        if (match('*')) {
	            lex();
	            generator = true;
	        }

	        if (!match('(')) {
	            if (!match('<')) {
	                token = lookahead;
	                id = parseVariableIdentifier();

	                if (strict) {
	                    if (isRestrictedWord(token.value)) {
	                        throwErrorTolerant(token, Messages.StrictFunctionName);
	                    }
	                } else {
	                    if (isRestrictedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictFunctionName;
	                    } else if (isStrictModeReservedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictReservedWord;
	                    }
	                }
	            }

	            if (match('<')) {
	                typeParameters = parseTypeParameterDeclaration();
	            }
	        }

	        tmp = parseParams(firstRestricted);
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }

	        previousStrict = strict;
	        previousYieldAllowed = state.yieldAllowed;
	        state.yieldAllowed = generator;
	        previousAwaitAllowed = state.awaitAllowed;
	        state.awaitAllowed = isAsync;

	        body = parseFunctionSourceElements();

	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && tmp.stricted) {
	            throwErrorTolerant(tmp.stricted, message);
	        }
	        strict = previousStrict;
	        state.yieldAllowed = previousYieldAllowed;
	        state.awaitAllowed = previousAwaitAllowed;

	        return markerApply(
	            marker,
	            delegate.createFunctionExpression(
	                id,
	                tmp.params,
	                tmp.defaults,
	                body,
	                tmp.rest,
	                generator,
	                false,
	                isAsync,
	                tmp.returnType,
	                typeParameters
	            )
	        );
	    }

	    function parseYieldExpression() {
	        var delegateFlag, expr, marker = markerCreate();

	        expectKeyword('yield', !strict);

	        delegateFlag = false;
	        if (match('*')) {
	            lex();
	            delegateFlag = true;
	        }

	        expr = parseAssignmentExpression();

	        return markerApply(marker, delegate.createYieldExpression(expr, delegateFlag));
	    }

	    function parseAwaitExpression() {
	        var expr, marker = markerCreate();
	        expectContextualKeyword('await');
	        expr = parseAssignmentExpression();
	        return markerApply(marker, delegate.createAwaitExpression(expr));
	    }

	    // 14 Functions and classes

	    // 14.1 Functions is defined above (13 in ES5)
	    // 14.2 Arrow Functions Definitions is defined in (7.3 assignments)

	    // 14.3 Method Definitions
	    // 14.3.7
	    function specialMethod(methodDefinition) {
	        return methodDefinition.kind === 'get' ||
	               methodDefinition.kind === 'set' ||
	               methodDefinition.value.generator;
	    }

	    function parseMethodDefinition(key, isStatic, generator, computed) {
	        var token, param, propType,
	            isAsync, typeParameters, tokenValue, returnType;

	        propType = isStatic ? ClassPropertyType.static : ClassPropertyType.prototype;

	        if (generator) {
	            return delegate.createMethodDefinition(
	                propType,
	                '',
	                key,
	                parsePropertyMethodFunction({ generator: true }),
	                computed
	            );
	        }

	        tokenValue = key.type === 'Identifier' && key.name;

	        if (tokenValue === 'get' && !match('(')) {
	            key = parseObjectPropertyKey();

	            expect('(');
	            expect(')');
	            if (match(':')) {
	                returnType = parseTypeAnnotation();
	            }
	            return delegate.createMethodDefinition(
	                propType,
	                'get',
	                key,
	                parsePropertyFunction({ generator: false, returnType: returnType }),
	                computed
	            );
	        }
	        if (tokenValue === 'set' && !match('(')) {
	            key = parseObjectPropertyKey();

	            expect('(');
	            token = lookahead;
	            param = [ parseTypeAnnotatableIdentifier() ];
	            expect(')');
	            if (match(':')) {
	                returnType = parseTypeAnnotation();
	            }
	            return delegate.createMethodDefinition(
	                propType,
	                'set',
	                key,
	                parsePropertyFunction({
	                    params: param,
	                    generator: false,
	                    name: token,
	                    returnType: returnType
	                }),
	                computed
	            );
	        }

	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }

	        isAsync = tokenValue === 'async' && !match('(');
	        if (isAsync) {
	            key = parseObjectPropertyKey();
	        }

	        return delegate.createMethodDefinition(
	            propType,
	            '',
	            key,
	            parsePropertyMethodFunction({
	                generator: false,
	                async: isAsync,
	                typeParameters: typeParameters
	            }),
	            computed
	        );
	    }

	    function parseClassProperty(key, computed, isStatic) {
	        var typeAnnotation;

	        typeAnnotation = parseTypeAnnotation();
	        expect(';');

	        return delegate.createClassProperty(
	            key,
	            typeAnnotation,
	            computed,
	            isStatic
	        );
	    }

	    function parseClassElement() {
	        var computed = false, generator = false, key, marker = markerCreate(),
	            isStatic = false, possiblyOpenBracketToken;
	        if (match(';')) {
	            lex();
	            return undefined;
	        }

	        if (lookahead.value === 'static') {
	            lex();
	            isStatic = true;
	        }

	        if (match('*')) {
	            lex();
	            generator = true;
	        }

	        possiblyOpenBracketToken = lookahead;
	        if (matchContextualKeyword('get') || matchContextualKeyword('set')) {
	            possiblyOpenBracketToken = lookahead2();
	        }

	        if (possiblyOpenBracketToken.type === Token.Punctuator
	                && possiblyOpenBracketToken.value === '[') {
	            computed = true;
	        }

	        key = parseObjectPropertyKey();

	        if (!generator && lookahead.value === ':') {
	            return markerApply(marker, parseClassProperty(key, computed, isStatic));
	        }

	        return markerApply(marker, parseMethodDefinition(
	            key,
	            isStatic,
	            generator,
	            computed
	        ));
	    }

	    function parseClassBody() {
	        var classElement, classElements = [], existingProps = {},
	            marker = markerCreate(), propName, propType;

	        existingProps[ClassPropertyType.static] = new StringMap();
	        existingProps[ClassPropertyType.prototype] = new StringMap();

	        expect('{');

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            classElement = parseClassElement(existingProps);

	            if (typeof classElement !== 'undefined') {
	                classElements.push(classElement);

	                propName = !classElement.computed && getFieldName(classElement.key);
	                if (propName !== false) {
	                    propType = classElement.static ?
	                                ClassPropertyType.static :
	                                ClassPropertyType.prototype;

	                    if (classElement.type === Syntax.MethodDefinition) {
	                        if (propName === 'constructor' && !classElement.static) {
	                            if (specialMethod(classElement)) {
	                                throwError(classElement, Messages.IllegalClassConstructorProperty);
	                            }
	                            if (existingProps[ClassPropertyType.prototype].has('constructor')) {
	                                throwError(classElement.key, Messages.IllegalDuplicateClassProperty);
	                            }
	                        }
	                        existingProps[propType].set(propName, true);
	                    }
	                }
	            }
	        }

	        expect('}');

	        return markerApply(marker, delegate.createClassBody(classElements));
	    }

	    function parseClassImplements() {
	        var id, implemented = [], marker, typeParameters;
	        if (strict) {
	            expectKeyword('implements');
	        } else {
	            expectContextualKeyword('implements');
	        }
	        while (index < length) {
	            marker = markerCreate();
	            id = parseVariableIdentifier();
	            if (match('<')) {
	                typeParameters = parseTypeParameterInstantiation();
	            } else {
	                typeParameters = null;
	            }
	            implemented.push(markerApply(marker, delegate.createClassImplements(
	                id,
	                typeParameters
	            )));
	            if (!match(',')) {
	                break;
	            }
	            expect(',');
	        }
	        return implemented;
	    }

	    function parseClassExpression() {
	        var id, implemented, previousYieldAllowed, superClass = null,
	            superTypeParameters, marker = markerCreate(), typeParameters,
	            matchImplements;

	        expectKeyword('class');

	        matchImplements =
	                strict
	                ? matchKeyword('implements')
	                : matchContextualKeyword('implements');

	        if (!matchKeyword('extends') && !matchImplements && !match('{')) {
	            id = parseVariableIdentifier();
	        }

	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }

	        if (matchKeyword('extends')) {
	            expectKeyword('extends');
	            previousYieldAllowed = state.yieldAllowed;
	            state.yieldAllowed = false;
	            superClass = parseLeftHandSideExpressionAllowCall();
	            if (match('<')) {
	                superTypeParameters = parseTypeParameterInstantiation();
	            }
	            state.yieldAllowed = previousYieldAllowed;
	        }

	        if (strict ? matchKeyword('implements') : matchContextualKeyword('implements')) {
	            implemented = parseClassImplements();
	        }

	        return markerApply(marker, delegate.createClassExpression(
	            id,
	            superClass,
	            parseClassBody(),
	            typeParameters,
	            superTypeParameters,
	            implemented
	        ));
	    }

	    function parseClassDeclaration() {
	        var id, implemented, previousYieldAllowed, superClass = null,
	            superTypeParameters, marker = markerCreate(), typeParameters;

	        expectKeyword('class');

	        id = parseVariableIdentifier();

	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }

	        if (matchKeyword('extends')) {
	            expectKeyword('extends');
	            previousYieldAllowed = state.yieldAllowed;
	            state.yieldAllowed = false;
	            superClass = parseLeftHandSideExpressionAllowCall();
	            if (match('<')) {
	                superTypeParameters = parseTypeParameterInstantiation();
	            }
	            state.yieldAllowed = previousYieldAllowed;
	        }

	        if (strict ? matchKeyword('implements') : matchContextualKeyword('implements')) {
	            implemented = parseClassImplements();
	        }

	        return markerApply(marker, delegate.createClassDeclaration(
	            id,
	            superClass,
	            parseClassBody(),
	            typeParameters,
	            superTypeParameters,
	            implemented
	        ));
	    }

	    // 15 Program

	    function parseSourceElement() {
	        var token;
	        if (lookahead.type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'const':
	            case 'let':
	                return parseConstLetDeclaration(lookahead.value);
	            case 'function':
	                return parseFunctionDeclaration();
	            case 'export':
	                throwErrorTolerant({}, Messages.IllegalExportDeclaration);
	                return parseExportDeclaration();
	            case 'import':
	                throwErrorTolerant({}, Messages.IllegalImportDeclaration);
	                return parseImportDeclaration();
	            case 'interface':
	                if (lookahead2().type === Token.Identifier) {
	                    return parseInterface();
	                }
	                return parseStatement();
	            default:
	                return parseStatement();
	            }
	        }

	        if (matchContextualKeyword('type')
	                && lookahead2().type === Token.Identifier) {
	            return parseTypeAlias();
	        }

	        if (matchContextualKeyword('interface')
	                && lookahead2().type === Token.Identifier) {
	            return parseInterface();
	        }

	        if (matchContextualKeyword('declare')) {
	            token = lookahead2();
	            if (token.type === Token.Keyword) {
	                switch (token.value) {
	                case 'class':
	                    return parseDeclareClass();
	                case 'function':
	                    return parseDeclareFunction();
	                case 'var':
	                    return parseDeclareVariable();
	                }
	            } else if (token.type === Token.Identifier
	                    && token.value === 'module') {
	                return parseDeclareModule();
	            }
	        }

	        if (lookahead.type !== Token.EOF) {
	            return parseStatement();
	        }
	    }

	    function parseProgramElement() {
	        var isModule = extra.sourceType === 'module' || extra.sourceType === 'nonStrictModule';

	        if (isModule && lookahead.type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'export':
	                return parseExportDeclaration();
	            case 'import':
	                return parseImportDeclaration();
	            }
	        }

	        return parseSourceElement();
	    }

	    function parseProgramElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted;

	        while (index < length) {
	            token = lookahead;
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }

	            sourceElement = parseProgramElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }

	        while (index < length) {
	            sourceElement = parseProgramElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }
	        return sourceElements;
	    }

	    function parseProgram() {
	        var body, marker = markerCreate();
	        strict = extra.sourceType === 'module';
	        peek();
	        body = parseProgramElements();
	        return markerApply(marker, delegate.createProgram(body));
	    }

	    // 16 JSX

	    XHTMLEntities = {
	        quot: '\u0022',
	        amp: '&',
	        apos: '\u0027',
	        lt: '<',
	        gt: '>',
	        nbsp: '\u00A0',
	        iexcl: '\u00A1',
	        cent: '\u00A2',
	        pound: '\u00A3',
	        curren: '\u00A4',
	        yen: '\u00A5',
	        brvbar: '\u00A6',
	        sect: '\u00A7',
	        uml: '\u00A8',
	        copy: '\u00A9',
	        ordf: '\u00AA',
	        laquo: '\u00AB',
	        not: '\u00AC',
	        shy: '\u00AD',
	        reg: '\u00AE',
	        macr: '\u00AF',
	        deg: '\u00B0',
	        plusmn: '\u00B1',
	        sup2: '\u00B2',
	        sup3: '\u00B3',
	        acute: '\u00B4',
	        micro: '\u00B5',
	        para: '\u00B6',
	        middot: '\u00B7',
	        cedil: '\u00B8',
	        sup1: '\u00B9',
	        ordm: '\u00BA',
	        raquo: '\u00BB',
	        frac14: '\u00BC',
	        frac12: '\u00BD',
	        frac34: '\u00BE',
	        iquest: '\u00BF',
	        Agrave: '\u00C0',
	        Aacute: '\u00C1',
	        Acirc: '\u00C2',
	        Atilde: '\u00C3',
	        Auml: '\u00C4',
	        Aring: '\u00C5',
	        AElig: '\u00C6',
	        Ccedil: '\u00C7',
	        Egrave: '\u00C8',
	        Eacute: '\u00C9',
	        Ecirc: '\u00CA',
	        Euml: '\u00CB',
	        Igrave: '\u00CC',
	        Iacute: '\u00CD',
	        Icirc: '\u00CE',
	        Iuml: '\u00CF',
	        ETH: '\u00D0',
	        Ntilde: '\u00D1',
	        Ograve: '\u00D2',
	        Oacute: '\u00D3',
	        Ocirc: '\u00D4',
	        Otilde: '\u00D5',
	        Ouml: '\u00D6',
	        times: '\u00D7',
	        Oslash: '\u00D8',
	        Ugrave: '\u00D9',
	        Uacute: '\u00DA',
	        Ucirc: '\u00DB',
	        Uuml: '\u00DC',
	        Yacute: '\u00DD',
	        THORN: '\u00DE',
	        szlig: '\u00DF',
	        agrave: '\u00E0',
	        aacute: '\u00E1',
	        acirc: '\u00E2',
	        atilde: '\u00E3',
	        auml: '\u00E4',
	        aring: '\u00E5',
	        aelig: '\u00E6',
	        ccedil: '\u00E7',
	        egrave: '\u00E8',
	        eacute: '\u00E9',
	        ecirc: '\u00EA',
	        euml: '\u00EB',
	        igrave: '\u00EC',
	        iacute: '\u00ED',
	        icirc: '\u00EE',
	        iuml: '\u00EF',
	        eth: '\u00F0',
	        ntilde: '\u00F1',
	        ograve: '\u00F2',
	        oacute: '\u00F3',
	        ocirc: '\u00F4',
	        otilde: '\u00F5',
	        ouml: '\u00F6',
	        divide: '\u00F7',
	        oslash: '\u00F8',
	        ugrave: '\u00F9',
	        uacute: '\u00FA',
	        ucirc: '\u00FB',
	        uuml: '\u00FC',
	        yacute: '\u00FD',
	        thorn: '\u00FE',
	        yuml: '\u00FF',
	        OElig: '\u0152',
	        oelig: '\u0153',
	        Scaron: '\u0160',
	        scaron: '\u0161',
	        Yuml: '\u0178',
	        fnof: '\u0192',
	        circ: '\u02C6',
	        tilde: '\u02DC',
	        Alpha: '\u0391',
	        Beta: '\u0392',
	        Gamma: '\u0393',
	        Delta: '\u0394',
	        Epsilon: '\u0395',
	        Zeta: '\u0396',
	        Eta: '\u0397',
	        Theta: '\u0398',
	        Iota: '\u0399',
	        Kappa: '\u039A',
	        Lambda: '\u039B',
	        Mu: '\u039C',
	        Nu: '\u039D',
	        Xi: '\u039E',
	        Omicron: '\u039F',
	        Pi: '\u03A0',
	        Rho: '\u03A1',
	        Sigma: '\u03A3',
	        Tau: '\u03A4',
	        Upsilon: '\u03A5',
	        Phi: '\u03A6',
	        Chi: '\u03A7',
	        Psi: '\u03A8',
	        Omega: '\u03A9',
	        alpha: '\u03B1',
	        beta: '\u03B2',
	        gamma: '\u03B3',
	        delta: '\u03B4',
	        epsilon: '\u03B5',
	        zeta: '\u03B6',
	        eta: '\u03B7',
	        theta: '\u03B8',
	        iota: '\u03B9',
	        kappa: '\u03BA',
	        lambda: '\u03BB',
	        mu: '\u03BC',
	        nu: '\u03BD',
	        xi: '\u03BE',
	        omicron: '\u03BF',
	        pi: '\u03C0',
	        rho: '\u03C1',
	        sigmaf: '\u03C2',
	        sigma: '\u03C3',
	        tau: '\u03C4',
	        upsilon: '\u03C5',
	        phi: '\u03C6',
	        chi: '\u03C7',
	        psi: '\u03C8',
	        omega: '\u03C9',
	        thetasym: '\u03D1',
	        upsih: '\u03D2',
	        piv: '\u03D6',
	        ensp: '\u2002',
	        emsp: '\u2003',
	        thinsp: '\u2009',
	        zwnj: '\u200C',
	        zwj: '\u200D',
	        lrm: '\u200E',
	        rlm: '\u200F',
	        ndash: '\u2013',
	        mdash: '\u2014',
	        lsquo: '\u2018',
	        rsquo: '\u2019',
	        sbquo: '\u201A',
	        ldquo: '\u201C',
	        rdquo: '\u201D',
	        bdquo: '\u201E',
	        dagger: '\u2020',
	        Dagger: '\u2021',
	        bull: '\u2022',
	        hellip: '\u2026',
	        permil: '\u2030',
	        prime: '\u2032',
	        Prime: '\u2033',
	        lsaquo: '\u2039',
	        rsaquo: '\u203A',
	        oline: '\u203E',
	        frasl: '\u2044',
	        euro: '\u20AC',
	        image: '\u2111',
	        weierp: '\u2118',
	        real: '\u211C',
	        trade: '\u2122',
	        alefsym: '\u2135',
	        larr: '\u2190',
	        uarr: '\u2191',
	        rarr: '\u2192',
	        darr: '\u2193',
	        harr: '\u2194',
	        crarr: '\u21B5',
	        lArr: '\u21D0',
	        uArr: '\u21D1',
	        rArr: '\u21D2',
	        dArr: '\u21D3',
	        hArr: '\u21D4',
	        forall: '\u2200',
	        part: '\u2202',
	        exist: '\u2203',
	        empty: '\u2205',
	        nabla: '\u2207',
	        isin: '\u2208',
	        notin: '\u2209',
	        ni: '\u220B',
	        prod: '\u220F',
	        sum: '\u2211',
	        minus: '\u2212',
	        lowast: '\u2217',
	        radic: '\u221A',
	        prop: '\u221D',
	        infin: '\u221E',
	        ang: '\u2220',
	        and: '\u2227',
	        or: '\u2228',
	        cap: '\u2229',
	        cup: '\u222A',
	        'int': '\u222B',
	        there4: '\u2234',
	        sim: '\u223C',
	        cong: '\u2245',
	        asymp: '\u2248',
	        ne: '\u2260',
	        equiv: '\u2261',
	        le: '\u2264',
	        ge: '\u2265',
	        sub: '\u2282',
	        sup: '\u2283',
	        nsub: '\u2284',
	        sube: '\u2286',
	        supe: '\u2287',
	        oplus: '\u2295',
	        otimes: '\u2297',
	        perp: '\u22A5',
	        sdot: '\u22C5',
	        lceil: '\u2308',
	        rceil: '\u2309',
	        lfloor: '\u230A',
	        rfloor: '\u230B',
	        lang: '\u2329',
	        rang: '\u232A',
	        loz: '\u25CA',
	        spades: '\u2660',
	        clubs: '\u2663',
	        hearts: '\u2665',
	        diams: '\u2666'
	    };

	    function getQualifiedJSXName(object) {
	        if (object.type === Syntax.JSXIdentifier) {
	            return object.name;
	        }
	        if (object.type === Syntax.JSXNamespacedName) {
	            return object.namespace.name + ':' + object.name.name;
	        }
	        /* istanbul ignore else */
	        if (object.type === Syntax.JSXMemberExpression) {
	            return (
	                getQualifiedJSXName(object.object) + '.' +
	                getQualifiedJSXName(object.property)
	            );
	        }
	        /* istanbul ignore next */
	        throwUnexpected(object);
	    }

	    function isJSXIdentifierStart(ch) {
	        // exclude backslash (\)
	        return (ch !== 92) && isIdentifierStart(ch);
	    }

	    function isJSXIdentifierPart(ch) {
	        // exclude backslash (\) and add hyphen (-)
	        return (ch !== 92) && (ch === 45 || isIdentifierPart(ch));
	    }

	    function scanJSXIdentifier() {
	        var ch, start, value = '';

	        start = index;
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (!isJSXIdentifierPart(ch)) {
	                break;
	            }
	            value += source[index++];
	        }

	        return {
	            type: Token.JSXIdentifier,
	            value: value,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanJSXEntity() {
	        var ch, str = '', start = index, count = 0, code;
	        ch = source[index];
	        assert(ch === '&', 'Entity must start with an ampersand');
	        index++;
	        while (index < length && count++ < 10) {
	            ch = source[index++];
	            if (ch === ';') {
	                break;
	            }
	            str += ch;
	        }

	        // Well-formed entity (ending was found).
	        if (ch === ';') {
	            // Numeric entity.
	            if (str[0] === '#') {
	                if (str[1] === 'x') {
	                    code = +('0' + str.substr(1));
	                } else {
	                    // Removing leading zeros in order to avoid treating as octal in old browsers.
	                    code = +str.substr(1).replace(Regex.LeadingZeros, '');
	                }

	                if (!isNaN(code)) {
	                    return String.fromCharCode(code);
	                }
	            /* istanbul ignore else */
	            } else if (XHTMLEntities[str]) {
	                return XHTMLEntities[str];
	            }
	        }

	        // Treat non-entity sequences as regular text.
	        index = start + 1;
	        return '&';
	    }

	    function scanJSXText(stopChars) {
	        var ch, str = '', start;
	        start = index;
	        while (index < length) {
	            ch = source[index];
	            if (stopChars.indexOf(ch) !== -1) {
	                break;
	            }
	            if (ch === '&') {
	                str += scanJSXEntity();
	            } else {
	                index++;
	                if (ch === '\r' && source[index] === '\n') {
	                    str += ch;
	                    ch = source[index];
	                    index++;
	                }
	                if (isLineTerminator(ch.charCodeAt(0))) {
	                    ++lineNumber;
	                    lineStart = index;
	                }
	                str += ch;
	            }
	        }
	        return {
	            type: Token.JSXText,
	            value: str,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }

	    function scanJSXStringLiteral() {
	        var innerToken, quote, start;

	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');

	        start = index;
	        ++index;

	        innerToken = scanJSXText([quote]);

	        if (quote !== source[index]) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        ++index;

	        innerToken.range = [start, index];

	        return innerToken;
	    }

	    /**
	     * Between JSX opening and closing tags (e.g. <foo>HERE</foo>), anything that
	     * is not another JSX tag and is not an expression wrapped by {} is text.
	     */
	    function advanceJSXChild() {
	        var ch = source.charCodeAt(index);

	        // '<' 60, '>' 62, '{' 123, '}' 125
	        if (ch !== 60 && ch !== 62 && ch !== 123 && ch !== 125) {
	            return scanJSXText(['<', '>', '{', '}']);
	        }

	        return scanPunctuator();
	    }

	    function parseJSXIdentifier() {
	        var token, marker = markerCreate();

	        if (lookahead.type !== Token.JSXIdentifier) {
	            throwUnexpected(lookahead);
	        }

	        token = lex();
	        return markerApply(marker, delegate.createJSXIdentifier(token.value));
	    }

	    function parseJSXNamespacedName() {
	        var namespace, name, marker = markerCreate();

	        namespace = parseJSXIdentifier();
	        expect(':');
	        name = parseJSXIdentifier();

	        return markerApply(marker, delegate.createJSXNamespacedName(namespace, name));
	    }

	    function parseJSXMemberExpression() {
	        var marker = markerCreate(),
	            expr = parseJSXIdentifier();

	        while (match('.')) {
	            lex();
	            expr = markerApply(marker, delegate.createJSXMemberExpression(expr, parseJSXIdentifier()));
	        }

	        return expr;
	    }

	    function parseJSXElementName() {
	        if (lookahead2().value === ':') {
	            return parseJSXNamespacedName();
	        }
	        if (lookahead2().value === '.') {
	            return parseJSXMemberExpression();
	        }

	        return parseJSXIdentifier();
	    }

	    function parseJSXAttributeName() {
	        if (lookahead2().value === ':') {
	            return parseJSXNamespacedName();
	        }

	        return parseJSXIdentifier();
	    }

	    function parseJSXAttributeValue() {
	        var value, marker;
	        if (match('{')) {
	            value = parseJSXExpressionContainer();
	            if (value.expression.type === Syntax.JSXEmptyExpression) {
	                throwError(
	                    value,
	                    'JSX attributes must only be assigned a non-empty ' +
	                        'expression'
	                );
	            }
	        } else if (match('<')) {
	            value = parseJSXElement();
	        } else if (lookahead.type === Token.JSXText) {
	            marker = markerCreate();
	            value = markerApply(marker, delegate.createLiteral(lex()));
	        } else {
	            throwError({}, Messages.InvalidJSXAttributeValue);
	        }
	        return value;
	    }

	    function parseJSXEmptyExpression() {
	        var marker = markerCreatePreserveWhitespace();
	        while (source.charAt(index) !== '}') {
	            index++;
	        }
	        return markerApply(marker, delegate.createJSXEmptyExpression());
	    }

	    function parseJSXExpressionContainer() {
	        var expression, origInJSXChild, origInJSXTag, marker = markerCreate();

	        origInJSXChild = state.inJSXChild;
	        origInJSXTag = state.inJSXTag;
	        state.inJSXChild = false;
	        state.inJSXTag = false;

	        expect('{');

	        if (match('}')) {
	            expression = parseJSXEmptyExpression();
	        } else {
	            expression = parseExpression();
	        }

	        state.inJSXChild = origInJSXChild;
	        state.inJSXTag = origInJSXTag;

	        expect('}');

	        return markerApply(marker, delegate.createJSXExpressionContainer(expression));
	    }

	    function parseJSXSpreadAttribute() {
	        var expression, origInJSXChild, origInJSXTag, marker = markerCreate();

	        origInJSXChild = state.inJSXChild;
	        origInJSXTag = state.inJSXTag;
	        state.inJSXChild = false;
	        state.inJSXTag = false;

	        expect('{');
	        expect('...');

	        expression = parseAssignmentExpression();

	        state.inJSXChild = origInJSXChild;
	        state.inJSXTag = origInJSXTag;

	        expect('}');

	        return markerApply(marker, delegate.createJSXSpreadAttribute(expression));
	    }

	    function parseJSXAttribute() {
	        var name, marker;

	        if (match('{')) {
	            return parseJSXSpreadAttribute();
	        }

	        marker = markerCreate();

	        name = parseJSXAttributeName();

	        // HTML empty attribute
	        if (match('=')) {
	            lex();
	            return markerApply(marker, delegate.createJSXAttribute(name, parseJSXAttributeValue()));
	        }

	        return markerApply(marker, delegate.createJSXAttribute(name));
	    }

	    function parseJSXChild() {
	        var token, marker;
	        if (match('{')) {
	            token = parseJSXExpressionContainer();
	        } else if (lookahead.type === Token.JSXText) {
	            marker = markerCreatePreserveWhitespace();
	            token = markerApply(marker, delegate.createLiteral(lex()));
	        } else if (match('<')) {
	            token = parseJSXElement();
	        } else {
	            throwUnexpected(lookahead);
	        }
	        return token;
	    }

	    function parseJSXClosingElement() {
	        var name, origInJSXChild, origInJSXTag, marker = markerCreate();
	        origInJSXChild = state.inJSXChild;
	        origInJSXTag = state.inJSXTag;
	        state.inJSXChild = false;
	        state.inJSXTag = true;
	        expect('<');
	        expect('/');
	        name = parseJSXElementName();
	        // Because advance() (called by lex() called by expect()) expects there
	        // to be a valid token after >, it needs to know whether to look for a
	        // standard JS token or an JSX text node
	        state.inJSXChild = origInJSXChild;
	        state.inJSXTag = origInJSXTag;
	        expect('>');
	        return markerApply(marker, delegate.createJSXClosingElement(name));
	    }

	    function parseJSXOpeningElement() {
	        var name, attributes = [], selfClosing = false, origInJSXChild, origInJSXTag, marker = markerCreate();

	        origInJSXChild = state.inJSXChild;
	        origInJSXTag = state.inJSXTag;
	        state.inJSXChild = false;
	        state.inJSXTag = true;

	        expect('<');

	        name = parseJSXElementName();

	        while (index < length &&
	                lookahead.value !== '/' &&
	                lookahead.value !== '>') {
	            attributes.push(parseJSXAttribute());
	        }

	        state.inJSXTag = origInJSXTag;

	        if (lookahead.value === '/') {
	            expect('/');
	            // Because advance() (called by lex() called by expect()) expects
	            // there to be a valid token after >, it needs to know whether to
	            // look for a standard JS token or an JSX text node
	            state.inJSXChild = origInJSXChild;
	            expect('>');
	            selfClosing = true;
	        } else {
	            state.inJSXChild = true;
	            expect('>');
	        }
	        return markerApply(marker, delegate.createJSXOpeningElement(name, attributes, selfClosing));
	    }

	    function parseJSXElement() {
	        var openingElement, closingElement = null, children = [], origInJSXChild, origInJSXTag, marker = markerCreate();

	        origInJSXChild = state.inJSXChild;
	        origInJSXTag = state.inJSXTag;
	        openingElement = parseJSXOpeningElement();

	        if (!openingElement.selfClosing) {
	            while (index < length) {
	                state.inJSXChild = false; // Call lookahead2() with inJSXChild = false because </ should not be considered in the child
	                if (lookahead.value === '<' && lookahead2().value === '/') {
	                    break;
	                }
	                state.inJSXChild = true;
	                children.push(parseJSXChild());
	            }
	            state.inJSXChild = origInJSXChild;
	            state.inJSXTag = origInJSXTag;
	            closingElement = parseJSXClosingElement();
	            if (getQualifiedJSXName(closingElement.name) !== getQualifiedJSXName(openingElement.name)) {
	                throwError({}, Messages.ExpectedJSXClosingTag, getQualifiedJSXName(openingElement.name));
	            }
	        }

	        // When (erroneously) writing two adjacent tags like
	        //
	        //     var x = <div>one</div><div>two</div>;
	        //
	        // the default error message is a bit incomprehensible. Since it's
	        // rarely (never?) useful to write a less-than sign after an JSX
	        // element, we disallow it here in the parser in order to provide a
	        // better error message. (In the rare case that the less-than operator
	        // was intended, the left tag can be wrapped in parentheses.)
	        if (!origInJSXChild && match('<')) {
	            throwError(lookahead, Messages.AdjacentJSXElements);
	        }

	        return markerApply(marker, delegate.createJSXElement(openingElement, closingElement, children));
	    }

	    function parseTypeAlias() {
	        var id, marker = markerCreate(), typeParameters = null, right;
	        expectContextualKeyword('type');
	        id = parseVariableIdentifier();
	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }
	        expect('=');
	        right = parseType();
	        consumeSemicolon();
	        return markerApply(marker, delegate.createTypeAlias(id, typeParameters, right));
	    }

	    function parseInterfaceExtends() {
	        var marker = markerCreate(), id, typeParameters = null;

	        id = parseVariableIdentifier();
	        if (match('<')) {
	            typeParameters = parseTypeParameterInstantiation();
	        }

	        return markerApply(marker, delegate.createInterfaceExtends(
	            id,
	            typeParameters
	        ));
	    }

	    function parseInterfaceish(marker, allowStatic) {
	        var body, bodyMarker, extended = [], id,
	            typeParameters = null;

	        id = parseVariableIdentifier();
	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }

	        if (matchKeyword('extends')) {
	            expectKeyword('extends');

	            while (index < length) {
	                extended.push(parseInterfaceExtends());
	                if (!match(',')) {
	                    break;
	                }
	                expect(',');
	            }
	        }

	        bodyMarker = markerCreate();
	        body = markerApply(bodyMarker, parseObjectType(allowStatic));

	        return markerApply(marker, delegate.createInterface(
	            id,
	            typeParameters,
	            body,
	            extended
	        ));
	    }

	    function parseInterface() {
	        var marker = markerCreate();

	        if (strict) {
	            expectKeyword('interface');
	        } else {
	            expectContextualKeyword('interface');
	        }

	        return parseInterfaceish(marker, /* allowStatic */false);
	    }

	    function parseDeclareClass() {
	        var marker = markerCreate(), ret;
	        expectContextualKeyword('declare');
	        expectKeyword('class');

	        ret = parseInterfaceish(marker, /* allowStatic */true);
	        ret.type = Syntax.DeclareClass;
	        return ret;
	    }

	    function parseDeclareFunction() {
	        var id, idMarker,
	            marker = markerCreate(), params, returnType, rest, tmp,
	            typeParameters = null, value, valueMarker;

	        expectContextualKeyword('declare');
	        expectKeyword('function');
	        idMarker = markerCreate();
	        id = parseVariableIdentifier();

	        valueMarker = markerCreate();
	        if (match('<')) {
	            typeParameters = parseTypeParameterDeclaration();
	        }
	        expect('(');
	        tmp = parseFunctionTypeParams();
	        params = tmp.params;
	        rest = tmp.rest;
	        expect(')');

	        expect(':');
	        returnType = parseType();

	        value = markerApply(valueMarker, delegate.createFunctionTypeAnnotation(
	            params,
	            returnType,
	            rest,
	            typeParameters
	        ));

	        id.typeAnnotation = markerApply(valueMarker, delegate.createTypeAnnotation(
	            value
	        ));
	        markerApply(idMarker, id);

	        consumeSemicolon();

	        return markerApply(marker, delegate.createDeclareFunction(
	            id
	        ));
	    }

	    function parseDeclareVariable() {
	        var id, marker = markerCreate();
	        expectContextualKeyword('declare');
	        expectKeyword('var');
	        id = parseTypeAnnotatableIdentifier();

	        consumeSemicolon();

	        return markerApply(marker, delegate.createDeclareVariable(
	            id
	        ));
	    }

	    function parseDeclareModule() {
	        var body = [], bodyMarker, id, idMarker, marker = markerCreate(), token;
	        expectContextualKeyword('declare');
	        expectContextualKeyword('module');

	        if (lookahead.type === Token.StringLiteral) {
	            if (strict && lookahead.octal) {
	                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
	            }
	            idMarker = markerCreate();
	            id = markerApply(idMarker, delegate.createLiteral(lex()));
	        } else {
	            id = parseVariableIdentifier();
	        }

	        bodyMarker = markerCreate();
	        expect('{');
	        while (index < length && !match('}')) {
	            token = lookahead2();
	            switch (token.value) {
	            case 'class':
	                body.push(parseDeclareClass());
	                break;
	            case 'function':
	                body.push(parseDeclareFunction());
	                break;
	            case 'var':
	                body.push(parseDeclareVariable());
	                break;
	            default:
	                throwUnexpected(lookahead);
	            }
	        }
	        expect('}');

	        return markerApply(marker, delegate.createDeclareModule(
	            id,
	            markerApply(bodyMarker, delegate.createBlockStatement(body))
	        ));
	    }

	    function collectToken() {
	        var loc, token, range, value, entry;

	        /* istanbul ignore else */
	        if (!state.inJSXChild) {
	            skipComment();
	        }

	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };

	        token = extra.advance();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };

	        if (token.type !== Token.EOF) {
	            range = [token.range[0], token.range[1]];
	            value = source.slice(token.range[0], token.range[1]);
	            entry = {
	                type: TokenName[token.type],
	                value: value,
	                range: range,
	                loc: loc
	            };
	            if (token.regex) {
	                entry.regex = {
	                    pattern: token.regex.pattern,
	                    flags: token.regex.flags
	                };
	            }
	            extra.tokens.push(entry);
	        }

	        return token;
	    }

	    function collectRegex() {
	        var pos, loc, regex, token;

	        skipComment();

	        pos = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };

	        regex = extra.scanRegExp();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };

	        if (!extra.tokenize) {
	            /* istanbul ignore next */
	            // Pop the previous token, which is likely '/' or '/='
	            if (extra.tokens.length > 0) {
	                token = extra.tokens[extra.tokens.length - 1];
	                if (token.range[0] === pos && token.type === 'Punctuator') {
	                    if (token.value === '/' || token.value === '/=') {
	                        extra.tokens.pop();
	                    }
	                }
	            }

	            extra.tokens.push({
	                type: 'RegularExpression',
	                value: regex.literal,
	                regex: regex.regex,
	                range: [pos, index],
	                loc: loc
	            });
	        }

	        return regex;
	    }

	    function filterTokenLocation() {
	        var i, entry, token, tokens = [];

	        for (i = 0; i < extra.tokens.length; ++i) {
	            entry = extra.tokens[i];
	            token = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (entry.regex) {
	                token.regex = {
	                    pattern: entry.regex.pattern,
	                    flags: entry.regex.flags
	                };
	            }
	            if (extra.range) {
	                token.range = entry.range;
	            }
	            if (extra.loc) {
	                token.loc = entry.loc;
	            }
	            tokens.push(token);
	        }

	        extra.tokens = tokens;
	    }

	    function patch() {
	        if (typeof extra.tokens !== 'undefined') {
	            extra.advance = advance;
	            extra.scanRegExp = scanRegExp;

	            advance = collectToken;
	            scanRegExp = collectRegex;
	        }
	    }

	    function unpatch() {
	        if (typeof extra.scanRegExp === 'function') {
	            advance = extra.advance;
	            scanRegExp = extra.scanRegExp;
	        }
	    }

	    // This is used to modify the delegate.

	    function extend(object, properties) {
	        var entry, result = {};

	        for (entry in object) {
	            /* istanbul ignore else */
	            if (object.hasOwnProperty(entry)) {
	                result[entry] = object[entry];
	            }
	        }

	        for (entry in properties) {
	            /* istanbul ignore else */
	            if (properties.hasOwnProperty(entry)) {
	                result[entry] = properties[entry];
	            }
	        }

	        return result;
	    }

	    function tokenize(code, options) {
	        var toString,
	            token,
	            tokens;

	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }

	        delegate = SyntaxTreeDelegate;
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowKeyword: true,
	            allowIn: true,
	            labelSet: new StringMap(),
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            lastCommentStart: -1
	        };

	        extra = {};

	        // Options matching.
	        options = options || {};

	        // Of course we collect tokens here.
	        options.tokens = true;
	        extra.tokens = [];
	        extra.tokenize = true;
	        // The following two fields are necessary to compute the Regex tokens.
	        extra.openParenToken = -1;
	        extra.openCurlyToken = -1;

	        extra.range = (typeof options.range === 'boolean') && options.range;
	        extra.loc = (typeof options.loc === 'boolean') && options.loc;

	        if (typeof options.comment === 'boolean' && options.comment) {
	            extra.comments = [];
	        }
	        if (typeof options.tolerant === 'boolean' && options.tolerant) {
	            extra.errors = [];
	        }

	        patch();

	        try {
	            peek();
	            if (lookahead.type === Token.EOF) {
	                return extra.tokens;
	            }

	            token = lex();
	            while (lookahead.type !== Token.EOF) {
	                try {
	                    token = lex();
	                } catch (lexError) {
	                    token = lookahead;
	                    if (extra.errors) {
	                        extra.errors.push(lexError);
	                        // We have to break on the first error
	                        // to avoid infinite loops.
	                        break;
	                    } else {
	                        throw lexError;
	                    }
	                }
	            }

	            filterTokenLocation();
	            tokens = extra.tokens;
	            if (typeof extra.comments !== 'undefined') {
	                tokens.comments = extra.comments;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                tokens.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            unpatch();
	            extra = {};
	        }
	        return tokens;
	    }

	    function parse(code, options) {
	        var program, toString;

	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }

	        delegate = SyntaxTreeDelegate;
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowKeyword: false,
	            allowIn: true,
	            labelSet: new StringMap(),
	            parenthesizedCount: 0,
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            inJSXChild: false,
	            inJSXTag: false,
	            inType: false,
	            lastCommentStart: -1,
	            yieldAllowed: false,
	            awaitAllowed: false
	        };

	        extra = {};
	        if (typeof options !== 'undefined') {
	            extra.range = (typeof options.range === 'boolean') && options.range;
	            extra.loc = (typeof options.loc === 'boolean') && options.loc;
	            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;

	            if (extra.loc && options.source !== null && options.source !== undefined) {
	                delegate = extend(delegate, {
	                    'postProcess': function (node) {
	                        node.loc.source = toString(options.source);
	                        return node;
	                    }
	                });
	            }

	            extra.sourceType = options.sourceType;
	            if (typeof options.tokens === 'boolean' && options.tokens) {
	                extra.tokens = [];
	            }
	            if (typeof options.comment === 'boolean' && options.comment) {
	                extra.comments = [];
	            }
	            if (typeof options.tolerant === 'boolean' && options.tolerant) {
	                extra.errors = [];
	            }
	            if (extra.attachComment) {
	                extra.range = true;
	                extra.comments = [];
	                extra.bottomRightStack = [];
	                extra.trailingComments = [];
	                extra.leadingComments = [];
	            }
	        }

	        patch();
	        try {
	            program = parseProgram();
	            if (typeof extra.comments !== 'undefined') {
	                program.comments = extra.comments;
	            }
	            if (typeof extra.tokens !== 'undefined') {
	                filterTokenLocation();
	                program.tokens = extra.tokens;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                program.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            unpatch();
	            extra = {};
	        }

	        return program;
	    }

	    // Sync with *.json manifests.
	    exports.version = '13001.1001.0-dev-harmony-fb';

	    exports.tokenize = tokenize;

	    exports.parse = parse;

	    // Deep copy.
	   /* istanbul ignore next */
	    exports.Syntax = (function () {
	        var name, types = {};

	        if (typeof Object.create === 'function') {
	            types = Object.create(null);
	        }

	        for (name in Syntax) {
	            if (Syntax.hasOwnProperty(name)) {
	                types[name] = Syntax[name];
	            }
	        }

	        if (typeof Object.freeze === 'function') {
	            Object.freeze(types);
	        }

	        return types;
	    }());

	}));
	/* vim: set sw=4 ts=4 et tw=80 : */


/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	var docblockRe = /^\s*(\/\*\*(.|\r?\n)*?\*\/)/;
	var ltrimRe = /^\s*/;
	/**
	 * @param {String} contents
	 * @return {String}
	 */
	function extract(contents) {
	  var match = contents.match(docblockRe);
	  if (match) {
	    return match[0].replace(ltrimRe, '') || '';
	  }
	  return '';
	}


	var commentStartRe = /^\/\*\*?/;
	var commentEndRe = /\*+\/$/;
	var wsRe = /[\t ]+/g;
	var stringStartRe = /(\r?\n|^) *\*/g;
	var multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
	var propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;

	/**
	 * @param {String} contents
	 * @return {Array}
	 */
	function parse(docblock) {
	  docblock = docblock
	    .replace(commentStartRe, '')
	    .replace(commentEndRe, '')
	    .replace(wsRe, ' ')
	    .replace(stringStartRe, '$1');

	  // Normalize multi-line directives
	  var prev = '';
	  while (prev != docblock) {
	    prev = docblock;
	    docblock = docblock.replace(multilineRe, "\n$1 $2\n");
	  }
	  docblock = docblock.trim();

	  var result = [];
	  var match;
	  while (match = propertyRe.exec(docblock)) {
	    result.push([match[1], match[2]]);
	  }

	  return result;
	}

	/**
	 * Same as parse but returns an object of prop: value instead of array of paris
	 * If a property appers more than once the last one will be returned
	 *
	 * @param {String} contents
	 * @return {Object}
	 */
	function parseAsObject(docblock) {
	  var pairs = parse(docblock);
	  var result = {};
	  for (var i = 0; i < pairs.length; i++) {
	    result[pairs[i][0]] = pairs[i][1];
	  }
	  return result;
	}


	exports.extract = extract;
	exports.parse = parse;
	exports.parseAsObject = parseAsObject;


/***/ },
/* 264 */,
/* 265 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Utils = __webpack_require__(274);


	// Declare internals

	var internals = {
	    delimiter: '&',
	    arrayPrefixGenerators: {
	        brackets: function (prefix, key) {
	            return prefix + '[]';
	        },
	        indices: function (prefix, key) {
	            return prefix + '[' + key + ']';
	        },
	        repeat: function (prefix, key) {
	            return prefix;
	        }
	    }
	};


	internals.stringify = function (obj, prefix, generateArrayPrefix) {

	    if (Utils.isBuffer(obj)) {
	        obj = obj.toString();
	    }
	    else if (obj instanceof Date) {
	        obj = obj.toISOString();
	    }
	    else if (obj === null) {
	        obj = '';
	    }

	    if (typeof obj === 'string' ||
	        typeof obj === 'number' ||
	        typeof obj === 'boolean') {

	        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
	    }

	    var values = [];

	    if (typeof obj === 'undefined') {
	        return values;
	    }

	    var objKeys = Object.keys(obj);
	    for (var i = 0, il = objKeys.length; i < il; ++i) {
	        var key = objKeys[i];
	        if (Array.isArray(obj)) {
	            values = values.concat(internals.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix));
	        }
	        else {
	            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix));
	        }
	    }

	    return values;
	};


	module.exports = function (obj, options) {

	    options = options || {};
	    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;

	    var keys = [];

	    if (typeof obj !== 'object' ||
	        obj === null) {

	        return '';
	    }

	    var arrayFormat;
	    if (options.arrayFormat in internals.arrayPrefixGenerators) {
	        arrayFormat = options.arrayFormat;
	    }
	    else if ('indices' in options) {
	        arrayFormat = options.indices ? 'indices' : 'repeat';
	    }
	    else {
	        arrayFormat = 'indices';
	    }

	    var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

	    var objKeys = Object.keys(obj);
	    for (var i = 0, il = objKeys.length; i < il; ++i) {
	        var key = objKeys[i];
	        keys = keys.concat(internals.stringify(obj[key], key, generateArrayPrefix));
	    }

	    return keys.join(delimiter);
	};


/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Utils = __webpack_require__(274);


	// Declare internals

	var internals = {
	    delimiter: '&',
	    depth: 5,
	    arrayLimit: 20,
	    parameterLimit: 1000
	};


	internals.parseValues = function (str, options) {

	    var obj = {};
	    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

	    for (var i = 0, il = parts.length; i < il; ++i) {
	        var part = parts[i];
	        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

	        if (pos === -1) {
	            obj[Utils.decode(part)] = '';
	        }
	        else {
	            var key = Utils.decode(part.slice(0, pos));
	            var val = Utils.decode(part.slice(pos + 1));

	            if (Object.prototype.hasOwnProperty(key)) {
	                continue;
	            }

	            if (!obj.hasOwnProperty(key)) {
	                obj[key] = val;
	            }
	            else {
	                obj[key] = [].concat(obj[key]).concat(val);
	            }
	        }
	    }

	    return obj;
	};


	internals.parseObject = function (chain, val, options) {

	    if (!chain.length) {
	        return val;
	    }

	    var root = chain.shift();

	    var obj = {};
	    if (root === '[]') {
	        obj = [];
	        obj = obj.concat(internals.parseObject(chain, val, options));
	    }
	    else {
	        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
	        var index = parseInt(cleanRoot, 10);
	        var indexString = '' + index;
	        if (!isNaN(index) &&
	            root !== cleanRoot &&
	            indexString === cleanRoot &&
	            index >= 0 &&
	            index <= options.arrayLimit) {

	            obj = [];
	            obj[index] = internals.parseObject(chain, val, options);
	        }
	        else {
	            obj[cleanRoot] = internals.parseObject(chain, val, options);
	        }
	    }

	    return obj;
	};


	internals.parseKeys = function (key, val, options) {

	    if (!key) {
	        return;
	    }

	    // The regex chunks

	    var parent = /^([^\[\]]*)/;
	    var child = /(\[[^\[\]]*\])/g;

	    // Get the parent

	    var segment = parent.exec(key);

	    // Don't allow them to overwrite object prototype properties

	    if (Object.prototype.hasOwnProperty(segment[1])) {
	        return;
	    }

	    // Stash the parent if it exists

	    var keys = [];
	    if (segment[1]) {
	        keys.push(segment[1]);
	    }

	    // Loop through children appending to the array until we hit depth

	    var i = 0;
	    while ((segment = child.exec(key)) !== null && i < options.depth) {

	        ++i;
	        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
	            keys.push(segment[1]);
	        }
	    }

	    // If there's a remainder, just add whatever is left

	    if (segment) {
	        keys.push('[' + key.slice(segment.index) + ']');
	    }

	    return internals.parseObject(keys, val, options);
	};


	module.exports = function (str, options) {

	    if (str === '' ||
	        str === null ||
	        typeof str === 'undefined') {

	        return {};
	    }

	    options = options || {};
	    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
	    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
	    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
	    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

	    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
	    var obj = {};

	    // Iterate over the keys and setup the new object

	    var keys = Object.keys(tempObj);
	    for (var i = 0, il = keys.length; i < il; ++i) {
	        var key = keys[i];
	        var newObj = internals.parseKeys(key, tempObj[key], options);
	        obj = Utils.merge(obj, newObj);
	    }

	    return Utils.compact(obj);
	};


/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Copyright 2009-2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE.txt or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	exports.SourceMapGenerator = __webpack_require__(275).SourceMapGenerator;
	exports.SourceMapConsumer = __webpack_require__(276).SourceMapConsumer;
	exports.SourceNode = __webpack_require__(277).SourceNode;


/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

	var Base62 = (function (my) {
	  my.chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

	  my.encode = function(i){
	    if (i === 0) {return '0'}
	    var s = ''
	    while (i > 0) {
	      s = this.chars[i % 62] + s
	      i = Math.floor(i/62)
	    }
	    return s
	  };
	  my.decode = function(a,b,c,d){
	    for (
	      b = c = (
	        a === (/\W|_|^$/.test(a += "") || a)
	      ) - 1;
	      d = a.charCodeAt(c++);
	    )
	    b = b * 62 + d - [, 48, 29, 87][d >> 5];
	    return b
	  };

	  return my;
	}({}));

	module.exports = Base62

/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

	exports.read = function(buffer, offset, isLE, mLen, nBytes) {
	  var e, m,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      nBits = -7,
	      i = isLE ? (nBytes - 1) : 0,
	      d = isLE ? -1 : 1,
	      s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity);
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};

	exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
	      i = isLE ? 0 : (nBytes - 1),
	      d = isLE ? 1 : -1,
	      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

	  buffer[offset + i - d] |= s * 128;
	};


/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * isArray
	 */

	var isArray = Array.isArray;

	/**
	 * toString
	 */

	var str = Object.prototype.toString;

	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */

	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 271 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}(false ? (this.base64js = {}) : exports))


/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
	  Copyright (C) 2013 Mathias Bynens <mathias@qiwi.be>
	  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
	  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
	  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
	  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
	  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
	  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:

	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.

	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	(function (root, factory) {
	    'use strict';

	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	    // Rhino, and plain browser loading.

	    /* istanbul ignore next */
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== 'undefined') {
	        factory(exports);
	    } else {
	        factory((root.esprima = {}));
	    }
	}(this, function (exports) {
	    'use strict';

	    var Token,
	        TokenName,
	        FnExprTokens,
	        Syntax,
	        PlaceHolders,
	        PropertyKind,
	        Messages,
	        Regex,
	        source,
	        strict,
	        index,
	        lineNumber,
	        lineStart,
	        length,
	        lookahead,
	        state,
	        extra;

	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8,
	        RegularExpression: 9
	    };

	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';
	    TokenName[Token.RegularExpression] = 'RegularExpression';

	    // A function following one of those tokens is an expression.
	    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
	                    'return', 'case', 'delete', 'throw', 'void',
	                    // assignment operators
	                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
	                    '&=', '|=', '^=', ',',
	                    // binary/unary operators
	                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
	                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
	                    '<=', '<', '>', '!=', '!=='];

	    Syntax = {
	        AssignmentExpression: 'AssignmentExpression',
	        ArrayExpression: 'ArrayExpression',
	        ArrowFunctionExpression: 'ArrowFunctionExpression',
	        BlockStatement: 'BlockStatement',
	        BinaryExpression: 'BinaryExpression',
	        BreakStatement: 'BreakStatement',
	        CallExpression: 'CallExpression',
	        CatchClause: 'CatchClause',
	        ConditionalExpression: 'ConditionalExpression',
	        ContinueStatement: 'ContinueStatement',
	        DoWhileStatement: 'DoWhileStatement',
	        DebuggerStatement: 'DebuggerStatement',
	        EmptyStatement: 'EmptyStatement',
	        ExpressionStatement: 'ExpressionStatement',
	        ForStatement: 'ForStatement',
	        ForInStatement: 'ForInStatement',
	        FunctionDeclaration: 'FunctionDeclaration',
	        FunctionExpression: 'FunctionExpression',
	        Identifier: 'Identifier',
	        IfStatement: 'IfStatement',
	        Literal: 'Literal',
	        LabeledStatement: 'LabeledStatement',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        NewExpression: 'NewExpression',
	        ObjectExpression: 'ObjectExpression',
	        Program: 'Program',
	        Property: 'Property',
	        ReturnStatement: 'ReturnStatement',
	        SequenceExpression: 'SequenceExpression',
	        SwitchStatement: 'SwitchStatement',
	        SwitchCase: 'SwitchCase',
	        ThisExpression: 'ThisExpression',
	        ThrowStatement: 'ThrowStatement',
	        TryStatement: 'TryStatement',
	        UnaryExpression: 'UnaryExpression',
	        UpdateExpression: 'UpdateExpression',
	        VariableDeclaration: 'VariableDeclaration',
	        VariableDeclarator: 'VariableDeclarator',
	        WhileStatement: 'WhileStatement',
	        WithStatement: 'WithStatement'
	    };

	    PlaceHolders = {
	        ArrowParameterPlaceHolder: {
	            type: 'ArrowParameterPlaceHolder'
	        }
	    };

	    PropertyKind = {
	        Data: 1,
	        Get: 2,
	        Set: 4
	    };

	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken: 'Unexpected token %0',
	        UnexpectedNumber: 'Unexpected number',
	        UnexpectedString: 'Unexpected string',
	        UnexpectedIdentifier: 'Unexpected identifier',
	        UnexpectedReserved: 'Unexpected reserved word',
	        UnexpectedEOS: 'Unexpected end of input',
	        NewlineAfterThrow: 'Illegal newline after throw',
	        InvalidRegExp: 'Invalid regular expression',
	        UnterminatedRegExp: 'Invalid regular expression: missing /',
	        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
	        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
	        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
	        NoCatchOrFinally: 'Missing catch or finally after try',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared',
	        IllegalContinue: 'Illegal continue statement',
	        IllegalBreak: 'Illegal break statement',
	        IllegalReturn: 'Illegal return statement',
	        StrictModeWith: 'Strict mode code may not include a with statement',
	        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
	        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
	        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
	        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
	        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
	        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
	        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
	        StrictDuplicateProperty: 'Duplicate data property in object literal not allowed in strict mode',
	        AccessorDataProperty: 'Object literal may not have data and accessor property with the same name',
	        AccessorGetSet: 'Object literal may not have multiple get/set accessors with the same name',
	        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
	        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictReservedWord: 'Use of future reserved word in strict mode'
	    };

	    // See also tools/generate-unicode-regex.py.
	    Regex = {
	        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
	        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
	    };

	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.

	    function assert(condition, message) {
	        /* istanbul ignore if */
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }

	    function isDecimalDigit(ch) {
	        return (ch >= 0x30 && ch <= 0x39);   // 0..9
	    }

	    function isHexDigit(ch) {
	        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
	    }

	    function isOctalDigit(ch) {
	        return '01234567'.indexOf(ch) >= 0;
	    }


	    // 7.2 White Space

	    function isWhiteSpace(ch) {
	        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
	            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
	    }

	    // 7.3 Line Terminators

	    function isLineTerminator(ch) {
	        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
	    }

	    // 7.6 Identifier Names and Identifiers

	    function isIdentifierStart(ch) {
	        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
	            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
	            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
	            (ch === 0x5C) ||                      // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
	    }

	    function isIdentifierPart(ch) {
	        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
	            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
	            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
	            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
	            (ch === 0x5C) ||                      // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
	    }

	    // 7.6.1.2 Future Reserved Words

	    function isFutureReservedWord(id) {
	        switch (id) {
	        case 'class':
	        case 'enum':
	        case 'export':
	        case 'extends':
	        case 'import':
	        case 'super':
	            return true;
	        default:
	            return false;
	        }
	    }

	    function isStrictModeReservedWord(id) {
	        switch (id) {
	        case 'implements':
	        case 'interface':
	        case 'package':
	        case 'private':
	        case 'protected':
	        case 'public':
	        case 'static':
	        case 'yield':
	        case 'let':
	            return true;
	        default:
	            return false;
	        }
	    }

	    function isRestrictedWord(id) {
	        return id === 'eval' || id === 'arguments';
	    }

	    // 7.6.1.1 Keywords

	    function isKeyword(id) {
	        if (strict && isStrictModeReservedWord(id)) {
	            return true;
	        }

	        // 'const' is specialized as Keyword in V8.
	        // 'yield' and 'let' are for compatibility with SpiderMonkey and ES.next.
	        // Some others are from future reserved words.

	        switch (id.length) {
	        case 2:
	            return (id === 'if') || (id === 'in') || (id === 'do');
	        case 3:
	            return (id === 'var') || (id === 'for') || (id === 'new') ||
	                (id === 'try') || (id === 'let');
	        case 4:
	            return (id === 'this') || (id === 'else') || (id === 'case') ||
	                (id === 'void') || (id === 'with') || (id === 'enum');
	        case 5:
	            return (id === 'while') || (id === 'break') || (id === 'catch') ||
	                (id === 'throw') || (id === 'const') || (id === 'yield') ||
	                (id === 'class') || (id === 'super');
	        case 6:
	            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
	                (id === 'switch') || (id === 'export') || (id === 'import');
	        case 7:
	            return (id === 'default') || (id === 'finally') || (id === 'extends');
	        case 8:
	            return (id === 'function') || (id === 'continue') || (id === 'debugger');
	        case 10:
	            return (id === 'instanceof');
	        default:
	            return false;
	        }
	    }

	    // 7.4 Comments

	    function addComment(type, value, start, end, loc) {
	        var comment;

	        assert(typeof start === 'number', 'Comment must have valid position');

	        // Because the way the actual token is scanned, often the comments
	        // (if any) are skipped twice during the lexical analysis.
	        // Thus, we need to skip adding a comment if the comment array already
	        // handled it.
	        if (state.lastCommentStart >= start) {
	            return;
	        }
	        state.lastCommentStart = start;

	        comment = {
	            type: type,
	            value: value
	        };
	        if (extra.range) {
	            comment.range = [start, end];
	        }
	        if (extra.loc) {
	            comment.loc = loc;
	        }
	        extra.comments.push(comment);
	        if (extra.attachComment) {
	            extra.leadingComments.push(comment);
	            extra.trailingComments.push(comment);
	        }
	    }

	    function skipSingleLineComment(offset) {
	        var start, loc, ch, comment;

	        start = index - offset;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart - offset
	            }
	        };

	        while (index < length) {
	            ch = source.charCodeAt(index);
	            ++index;
	            if (isLineTerminator(ch)) {
	                if (extra.comments) {
	                    comment = source.slice(start + offset, index - 1);
	                    loc.end = {
	                        line: lineNumber,
	                        column: index - lineStart - 1
	                    };
	                    addComment('Line', comment, start, index - 1, loc);
	                }
	                if (ch === 13 && source.charCodeAt(index) === 10) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	                return;
	            }
	        }

	        if (extra.comments) {
	            comment = source.slice(start + offset, index);
	            loc.end = {
	                line: lineNumber,
	                column: index - lineStart
	            };
	            addComment('Line', comment, start, index, loc);
	        }
	    }

	    function skipMultiLineComment() {
	        var start, loc, ch, comment;

	        if (extra.comments) {
	            start = index - 2;
	            loc = {
	                start: {
	                    line: lineNumber,
	                    column: index - lineStart - 2
	                }
	            };
	        }

	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (isLineTerminator(ch)) {
	                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
	                    ++index;
	                }
	                ++lineNumber;
	                ++index;
	                lineStart = index;
	                if (index >= length) {
	                    throwUnexpectedToken();
	                }
	            } else if (ch === 0x2A) {
	                // Block comment ends with '*/'.
	                if (source.charCodeAt(index + 1) === 0x2F) {
	                    ++index;
	                    ++index;
	                    if (extra.comments) {
	                        comment = source.slice(start + 2, index - 2);
	                        loc.end = {
	                            line: lineNumber,
	                            column: index - lineStart
	                        };
	                        addComment('Block', comment, start, index, loc);
	                    }
	                    return;
	                }
	                ++index;
	            } else {
	                ++index;
	            }
	        }

	        throwUnexpectedToken();
	    }

	    function skipComment() {
	        var ch, start;

	        start = (index === 0);
	        while (index < length) {
	            ch = source.charCodeAt(index);

	            if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	                start = true;
	            } else if (ch === 0x2F) { // U+002F is '/'
	                ch = source.charCodeAt(index + 1);
	                if (ch === 0x2F) {
	                    ++index;
	                    ++index;
	                    skipSingleLineComment(2);
	                    start = true;
	                } else if (ch === 0x2A) {  // U+002A is '*'
	                    ++index;
	                    ++index;
	                    skipMultiLineComment();
	                } else {
	                    break;
	                }
	            } else if (start && ch === 0x2D) { // U+002D is '-'
	                // U+003E is '>'
	                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
	                    // '-->' is a single-line comment
	                    index += 3;
	                    skipSingleLineComment(3);
	                } else {
	                    break;
	                }
	            } else if (ch === 0x3C) { // U+003C is '<'
	                if (source.slice(index + 1, index + 4) === '!--') {
	                    ++index; // `<`
	                    ++index; // `!`
	                    ++index; // `-`
	                    ++index; // `-`
	                    skipSingleLineComment(4);
	                } else {
	                    break;
	                }
	            } else {
	                break;
	            }
	        }
	    }

	    function scanHexEscape(prefix) {
	        var i, len, ch, code = 0;

	        len = (prefix === 'u') ? 4 : 2;
	        for (i = 0; i < len; ++i) {
	            if (index < length && isHexDigit(source[index])) {
	                ch = source[index++];
	                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	            } else {
	                return '';
	            }
	        }
	        return String.fromCharCode(code);
	    }

	    function scanUnicodeCodePointEscape() {
	        var ch, code, cu1, cu2;

	        ch = source[index];
	        code = 0;

	        // At least, one hex digit is required.
	        if (ch === '}') {
	            throwUnexpectedToken();
	        }

	        while (index < length) {
	            ch = source[index++];
	            if (!isHexDigit(ch)) {
	                break;
	            }
	            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	        }

	        if (code > 0x10FFFF || ch !== '}') {
	            throwUnexpectedToken();
	        }

	        // UTF-16 Encoding
	        if (code <= 0xFFFF) {
	            return String.fromCharCode(code);
	        }
	        cu1 = ((code - 0x10000) >> 10) + 0xD800;
	        cu2 = ((code - 0x10000) & 1023) + 0xDC00;
	        return String.fromCharCode(cu1, cu2);
	    }

	    function getEscapedIdentifier() {
	        var ch, id;

	        ch = source.charCodeAt(index++);
	        id = String.fromCharCode(ch);

	        // '\u' (U+005C, U+0075) denotes an escaped character.
	        if (ch === 0x5C) {
	            if (source.charCodeAt(index) !== 0x75) {
	                throwUnexpectedToken();
	            }
	            ++index;
	            ch = scanHexEscape('u');
	            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
	                throwUnexpectedToken();
	            }
	            id = ch;
	        }

	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (!isIdentifierPart(ch)) {
	                break;
	            }
	            ++index;
	            id += String.fromCharCode(ch);

	            // '\u' (U+005C, U+0075) denotes an escaped character.
	            if (ch === 0x5C) {
	                id = id.substr(0, id.length - 1);
	                if (source.charCodeAt(index) !== 0x75) {
	                    throwUnexpectedToken();
	                }
	                ++index;
	                ch = scanHexEscape('u');
	                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
	                    throwUnexpectedToken();
	                }
	                id += ch;
	            }
	        }

	        return id;
	    }

	    function getIdentifier() {
	        var start, ch;

	        start = index++;
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (ch === 0x5C) {
	                // Blackslash (U+005C) marks Unicode escape sequence.
	                index = start;
	                return getEscapedIdentifier();
	            }
	            if (isIdentifierPart(ch)) {
	                ++index;
	            } else {
	                break;
	            }
	        }

	        return source.slice(start, index);
	    }

	    function scanIdentifier() {
	        var start, id, type;

	        start = index;

	        // Backslash (U+005C) starts an escaped character.
	        id = (source.charCodeAt(index) === 0x5C) ? getEscapedIdentifier() : getIdentifier();

	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            type = Token.Identifier;
	        } else if (isKeyword(id)) {
	            type = Token.Keyword;
	        } else if (id === 'null') {
	            type = Token.NullLiteral;
	        } else if (id === 'true' || id === 'false') {
	            type = Token.BooleanLiteral;
	        } else {
	            type = Token.Identifier;
	        }

	        return {
	            type: type,
	            value: id,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }


	    // 7.7 Punctuators

	    function scanPunctuator() {
	        var start = index,
	            code = source.charCodeAt(index),
	            code2,
	            ch1 = source[index],
	            ch2,
	            ch3,
	            ch4;

	        switch (code) {

	        // Check for most common single-character punctuators.
	        case 0x2E:  // . dot
	        case 0x28:  // ( open bracket
	        case 0x29:  // ) close bracket
	        case 0x3B:  // ; semicolon
	        case 0x2C:  // , comma
	        case 0x7B:  // { open curly brace
	        case 0x7D:  // } close curly brace
	        case 0x5B:  // [
	        case 0x5D:  // ]
	        case 0x3A:  // :
	        case 0x3F:  // ?
	        case 0x7E:  // ~
	            ++index;
	            if (extra.tokenize) {
	                if (code === 0x28) {
	                    extra.openParenToken = extra.tokens.length;
	                } else if (code === 0x7B) {
	                    extra.openCurlyToken = extra.tokens.length;
	                }
	            }
	            return {
	                type: Token.Punctuator,
	                value: String.fromCharCode(code),
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };

	        default:
	            code2 = source.charCodeAt(index + 1);

	            // '=' (U+003D) marks an assignment or comparison operator.
	            if (code2 === 0x3D) {
	                switch (code) {
	                case 0x2B:  // +
	                case 0x2D:  // -
	                case 0x2F:  // /
	                case 0x3C:  // <
	                case 0x3E:  // >
	                case 0x5E:  // ^
	                case 0x7C:  // |
	                case 0x25:  // %
	                case 0x26:  // &
	                case 0x2A:  // *
	                    index += 2;
	                    return {
	                        type: Token.Punctuator,
	                        value: String.fromCharCode(code) + String.fromCharCode(code2),
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        start: start,
	                        end: index
	                    };

	                case 0x21: // !
	                case 0x3D: // =
	                    index += 2;

	                    // !== and ===
	                    if (source.charCodeAt(index) === 0x3D) {
	                        ++index;
	                    }
	                    return {
	                        type: Token.Punctuator,
	                        value: source.slice(start, index),
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        start: start,
	                        end: index
	                    };
	                }
	            }
	        }

	        // 4-character punctuator: >>>=

	        ch4 = source.substr(index, 4);

	        if (ch4 === '>>>=') {
	            index += 4;
	            return {
	                type: Token.Punctuator,
	                value: ch4,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };
	        }

	        // 3-character punctuators: === !== >>> <<= >>=

	        ch3 = ch4.substr(0, 3);

	        if (ch3 === '>>>' || ch3 === '<<=' || ch3 === '>>=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: ch3,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };
	        }

	        // Other 2-character punctuators: ++ -- << >> && ||
	        ch2 = ch3.substr(0, 2);

	        if ((ch1 === ch2[1] && ('+-<>&|'.indexOf(ch1) >= 0)) || ch2 === '=>') {
	            index += 2;
	            return {
	                type: Token.Punctuator,
	                value: ch2,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };
	        }

	        // 1-character punctuators: < > = ! + - * % & | ^ /

	        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };
	        }

	        throwUnexpectedToken();
	    }

	    // 7.8.3 Numeric Literals

	    function scanHexLiteral(start) {
	        var number = '';

	        while (index < length) {
	            if (!isHexDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }

	        if (number.length === 0) {
	            throwUnexpectedToken();
	        }

	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseInt('0x' + number, 16),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }

	    function scanBinaryLiteral(start) {
	        var ch, number;

	        number = '';

	        while (index < length) {
	            ch = source[index];
	            if (ch !== '0' && ch !== '1') {
	                break;
	            }
	            number += source[index++];
	        }

	        if (number.length === 0) {
	            // only 0b or 0B
	            throwUnexpectedToken();
	        }

	        if (index < length) {
	            ch = source.charCodeAt(index);
	            /* istanbul ignore else */
	            if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
	                throwUnexpectedToken();
	            }
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 2),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }

	    function scanOctalLiteral(prefix, start) {
	        var number, octal;

	        if (isOctalDigit(prefix)) {
	            octal = true;
	            number = '0' + source[index++];
	        } else {
	            octal = false;
	            ++index;
	            number = '';
	        }

	        while (index < length) {
	            if (!isOctalDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }

	        if (!octal && number.length === 0) {
	            // only 0o or 0O
	            throwUnexpectedToken();
	        }

	        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 8),
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }

	    function isImplicitOctalLiteral() {
	        var i, ch;

	        // Implicit octal, unless there is a non-octal digit.
	        // (Annex B.1.1 on Numeric Literals)
	        for (i = index + 1; i < length; ++i) {
	            ch = source[i];
	            if (ch === '8' || ch === '9') {
	                return false;
	            }
	            if (!isOctalDigit(ch)) {
	                return true;
	            }
	        }

	        return true;
	    }

	    function scanNumericLiteral() {
	        var number, start, ch;

	        ch = source[index];
	        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');

	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];

	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            // Octal number in ES6 starts with '0o'.
	            // Binary number in ES6 starts with '0b'.
	            if (number === '0') {
	                if (ch === 'x' || ch === 'X') {
	                    ++index;
	                    return scanHexLiteral(start);
	                }
	                if (ch === 'b' || ch === 'B') {
	                    ++index;
	                    return scanBinaryLiteral(start);
	                }
	                if (ch === 'o' || ch === 'O') {
	                    return scanOctalLiteral(ch, start);
	                }

	                if (isOctalDigit(ch)) {
	                    if (isImplicitOctalLiteral()) {
	                        return scanOctalLiteral(ch, start);
	                    }
	                }
	            }

	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }

	        if (ch === '.') {
	            number += source[index++];
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }

	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];

	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	            if (isDecimalDigit(source.charCodeAt(index))) {
	                while (isDecimalDigit(source.charCodeAt(index))) {
	                    number += source[index++];
	                }
	            } else {
	                throwUnexpectedToken();
	            }
	        }

	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }

	    // 7.8.4 String Literals

	    function scanStringLiteral() {
	        var str = '', quote, start, ch, code, unescaped, restore, octal = false, startLineNumber, startLineStart;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;

	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');

	        start = index;
	        ++index;

	        while (index < length) {
	            ch = source[index++];

	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'u':
	                    case 'x':
	                        if (source[index] === '{') {
	                            ++index;
	                            str += scanUnicodeCodePointEscape();
	                        } else {
	                            restore = index;
	                            unescaped = scanHexEscape(ch);
	                            if (unescaped) {
	                                str += unescaped;
	                            } else {
	                                index = restore;
	                                str += ch;
	                            }
	                        }
	                        break;
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;

	                    default:
	                        if (isOctalDigit(ch)) {
	                            code = '01234567'.indexOf(ch);

	                            // \0 is not octal escape sequence
	                            if (code !== 0) {
	                                octal = true;
	                            }

	                            if (index < length && isOctalDigit(source[index])) {
	                                octal = true;
	                                code = code * 8 + '01234567'.indexOf(source[index++]);

	                                // 3 digits are only allowed when string starts
	                                // with 0, 1, 2, 3
	                                if ('0123'.indexOf(ch) >= 0 &&
	                                        index < length &&
	                                        isOctalDigit(source[index])) {
	                                    code = code * 8 + '01234567'.indexOf(source[index++]);
	                                }
	                            }
	                            str += String.fromCharCode(code);
	                        } else {
	                            str += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    lineStart = index;
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                break;
	            } else {
	                str += ch;
	            }
	        }

	        if (quote !== '') {
	            throwUnexpectedToken();
	        }

	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            startLineNumber: startLineNumber,
	            startLineStart: startLineStart,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }

	    function testRegExp(pattern, flags) {
	        var tmp = pattern,
	            value;

	        if (flags.indexOf('u') >= 0) {
	            // Replace each astral symbol and every Unicode code point
	            // escape sequence with a single ASCII symbol to avoid throwing on
	            // regular expressions that are only valid in combination with the
	            // `/u` flag.
	            // Note: replacing with the ASCII symbol `x` might cause false
	            // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
	            // perfectly valid pattern that is equivalent to `[a-b]`, but it
	            // would be replaced by `[x-b]` which throws an error.
	            tmp = tmp
	                .replace(/\\u\{([0-9a-fA-F]+)\}/g, function ($0, $1) {
	                    if (parseInt($1, 16) <= 0x10FFFF) {
	                        return 'x';
	                    }
	                    throwError(Messages.InvalidRegExp);
	                })
	                .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, 'x');
	        }

	        // First, detect invalid regular expressions.
	        try {
	            value = new RegExp(tmp);
	        } catch (e) {
	            throwError(Messages.InvalidRegExp);
	        }

	        // Return a regular expression object for this pattern-flag pair, or
	        // `null` in case the current environment doesn't support the flags it
	        // uses.
	        try {
	            return new RegExp(pattern, flags);
	        } catch (exception) {
	            return null;
	        }
	    }

	    function scanRegExpBody() {
	        var ch, str, classMarker, terminated, body;

	        ch = source[index];
	        assert(ch === '/', 'Regular expression literal must start with a slash');
	        str = source[index++];

	        classMarker = false;
	        terminated = false;
	        while (index < length) {
	            ch = source[index++];
	            str += ch;
	            if (ch === '\\') {
	                ch = source[index++];
	                // ECMA-262 7.8.5
	                if (isLineTerminator(ch.charCodeAt(0))) {
	                    throwError(Messages.UnterminatedRegExp);
	                }
	                str += ch;
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                throwError(Messages.UnterminatedRegExp);
	            } else if (classMarker) {
	                if (ch === ']') {
	                    classMarker = false;
	                }
	            } else {
	                if (ch === '/') {
	                    terminated = true;
	                    break;
	                } else if (ch === '[') {
	                    classMarker = true;
	                }
	            }
	        }

	        if (!terminated) {
	            throwError(Messages.UnterminatedRegExp);
	        }

	        // Exclude leading and trailing slash.
	        body = str.substr(1, str.length - 2);
	        return {
	            value: body,
	            literal: str
	        };
	    }

	    function scanRegExpFlags() {
	        var ch, str, flags, restore;

	        str = '';
	        flags = '';
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch.charCodeAt(0))) {
	                break;
	            }

	            ++index;
	            if (ch === '\\' && index < length) {
	                ch = source[index];
	                if (ch === 'u') {
	                    ++index;
	                    restore = index;
	                    ch = scanHexEscape('u');
	                    if (ch) {
	                        flags += ch;
	                        for (str += '\\u'; restore < index; ++restore) {
	                            str += source[restore];
	                        }
	                    } else {
	                        index = restore;
	                        flags += 'u';
	                        str += '\\u';
	                    }
	                    tolerateUnexpectedToken();
	                } else {
	                    str += '\\';
	                    tolerateUnexpectedToken();
	                }
	            } else {
	                flags += ch;
	                str += ch;
	            }
	        }

	        return {
	            value: flags,
	            literal: str
	        };
	    }

	    function scanRegExp() {
	        var start, body, flags, value;

	        lookahead = null;
	        skipComment();
	        start = index;

	        body = scanRegExpBody();
	        flags = scanRegExpFlags();
	        value = testRegExp(body.value, flags.value);

	        if (extra.tokenize) {
	            return {
	                type: Token.RegularExpression,
	                value: value,
	                regex: {
	                    pattern: body.value,
	                    flags: flags.value
	                },
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };
	        }

	        return {
	            literal: body.literal + flags.literal,
	            value: value,
	            regex: {
	                pattern: body.value,
	                flags: flags.value
	            },
	            start: start,
	            end: index
	        };
	    }

	    function collectRegex() {
	        var pos, loc, regex, token;

	        skipComment();

	        pos = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };

	        regex = scanRegExp();

	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };

	        /* istanbul ignore next */
	        if (!extra.tokenize) {
	            // Pop the previous token, which is likely '/' or '/='
	            if (extra.tokens.length > 0) {
	                token = extra.tokens[extra.tokens.length - 1];
	                if (token.range[0] === pos && token.type === 'Punctuator') {
	                    if (token.value === '/' || token.value === '/=') {
	                        extra.tokens.pop();
	                    }
	                }
	            }

	            extra.tokens.push({
	                type: 'RegularExpression',
	                value: regex.literal,
	                regex: regex.regex,
	                range: [pos, index],
	                loc: loc
	            });
	        }

	        return regex;
	    }

	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }

	    function advanceSlash() {
	        var prevToken,
	            checkToken;
	        // Using the following algorithm:
	        // https://github.com/mozilla/sweet.js/wiki/design
	        prevToken = extra.tokens[extra.tokens.length - 1];
	        if (!prevToken) {
	            // Nothing before that: it cannot be a division.
	            return collectRegex();
	        }
	        if (prevToken.type === 'Punctuator') {
	            if (prevToken.value === ']') {
	                return scanPunctuator();
	            }
	            if (prevToken.value === ')') {
	                checkToken = extra.tokens[extra.openParenToken - 1];
	                if (checkToken &&
	                        checkToken.type === 'Keyword' &&
	                        (checkToken.value === 'if' ||
	                         checkToken.value === 'while' ||
	                         checkToken.value === 'for' ||
	                         checkToken.value === 'with')) {
	                    return collectRegex();
	                }
	                return scanPunctuator();
	            }
	            if (prevToken.value === '}') {
	                // Dividing a function by anything makes little sense,
	                // but we have to check for that.
	                if (extra.tokens[extra.openCurlyToken - 3] &&
	                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
	                    // Anonymous function.
	                    checkToken = extra.tokens[extra.openCurlyToken - 4];
	                    if (!checkToken) {
	                        return scanPunctuator();
	                    }
	                } else if (extra.tokens[extra.openCurlyToken - 4] &&
	                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
	                    // Named function.
	                    checkToken = extra.tokens[extra.openCurlyToken - 5];
	                    if (!checkToken) {
	                        return collectRegex();
	                    }
	                } else {
	                    return scanPunctuator();
	                }
	                // checkToken determines whether the function is
	                // a declaration or an expression.
	                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
	                    // It is an expression.
	                    return scanPunctuator();
	                }
	                // It is a declaration.
	                return collectRegex();
	            }
	            return collectRegex();
	        }
	        if (prevToken.type === 'Keyword' && prevToken.value !== 'this') {
	            return collectRegex();
	        }
	        return scanPunctuator();
	    }

	    function advance() {
	        var ch;

	        skipComment();

	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: index,
	                end: index
	            };
	        }

	        ch = source.charCodeAt(index);

	        if (isIdentifierStart(ch)) {
	            return scanIdentifier();
	        }

	        // Very common: ( and ) and ;
	        if (ch === 0x28 || ch === 0x29 || ch === 0x3B) {
	            return scanPunctuator();
	        }

	        // String literal starts with single quote (U+0027) or double quote (U+0022).
	        if (ch === 0x27 || ch === 0x22) {
	            return scanStringLiteral();
	        }


	        // Dot (.) U+002E can also start a floating-point number, hence the need
	        // to check the next character.
	        if (ch === 0x2E) {
	            if (isDecimalDigit(source.charCodeAt(index + 1))) {
	                return scanNumericLiteral();
	            }
	            return scanPunctuator();
	        }

	        if (isDecimalDigit(ch)) {
	            return scanNumericLiteral();
	        }

	        // Slash (/) U+002F can also start a regex.
	        if (extra.tokenize && ch === 0x2F) {
	            return advanceSlash();
	        }

	        return scanPunctuator();
	    }

	    function collectToken() {
	        var loc, token, value, entry;

	        skipComment();
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };

	        token = advance();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };

	        if (token.type !== Token.EOF) {
	            value = source.slice(token.start, token.end);
	            entry = {
	                type: TokenName[token.type],
	                value: value,
	                range: [token.start, token.end],
	                loc: loc
	            };
	            if (token.regex) {
	                entry.regex = {
	                    pattern: token.regex.pattern,
	                    flags: token.regex.flags
	                };
	            }
	            extra.tokens.push(entry);
	        }

	        return token;
	    }

	    function lex() {
	        var token;

	        token = lookahead;
	        index = token.end;
	        lineNumber = token.lineNumber;
	        lineStart = token.lineStart;

	        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();

	        index = token.end;
	        lineNumber = token.lineNumber;
	        lineStart = token.lineStart;

	        return token;
	    }

	    function peek() {
	        var pos, line, start;

	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
	        index = pos;
	        lineNumber = line;
	        lineStart = start;
	    }

	    function Position() {
	        this.line = lineNumber;
	        this.column = index - lineStart;
	    }

	    function SourceLocation() {
	        this.start = new Position();
	        this.end = null;
	    }

	    function WrappingSourceLocation(startToken) {
	        if (startToken.type === Token.StringLiteral) {
	            this.start = {
	                line: startToken.startLineNumber,
	                column: startToken.start - startToken.startLineStart
	            };
	        } else {
	            this.start = {
	                line: startToken.lineNumber,
	                column: startToken.start - startToken.lineStart
	            };
	        }
	        this.end = null;
	    }

	    function Node() {
	        // Skip comment.
	        index = lookahead.start;
	        if (lookahead.type === Token.StringLiteral) {
	            lineNumber = lookahead.startLineNumber;
	            lineStart = lookahead.startLineStart;
	        } else {
	            lineNumber = lookahead.lineNumber;
	            lineStart = lookahead.lineStart;
	        }
	        if (extra.range) {
	            this.range = [index, 0];
	        }
	        if (extra.loc) {
	            this.loc = new SourceLocation();
	        }
	    }

	    function WrappingNode(startToken) {
	        if (extra.range) {
	            this.range = [startToken.start, 0];
	        }
	        if (extra.loc) {
	            this.loc = new WrappingSourceLocation(startToken);
	        }
	    }

	    WrappingNode.prototype = Node.prototype = {

	        processComment: function () {
	            var lastChild,
	                leadingComments,
	                trailingComments,
	                bottomRight = extra.bottomRightStack,
	                i,
	                comment,
	                last = bottomRight[bottomRight.length - 1];

	            if (this.type === Syntax.Program) {
	                if (this.body.length > 0) {
	                    return;
	                }
	            }

	            if (extra.trailingComments.length > 0) {
	                trailingComments = [];
	                for (i = extra.trailingComments.length - 1; i >= 0; --i) {
	                    comment = extra.trailingComments[i];
	                    if (comment.range[0] >= this.range[1]) {
	                        trailingComments.unshift(comment);
	                        extra.trailingComments.splice(i, 1);
	                    }
	                }
	                extra.trailingComments = [];
	            } else {
	                if (last && last.trailingComments && last.trailingComments[0].range[0] >= this.range[1]) {
	                    trailingComments = last.trailingComments;
	                    delete last.trailingComments;
	                }
	            }

	            // Eating the stack.
	            if (last) {
	                while (last && last.range[0] >= this.range[0]) {
	                    lastChild = last;
	                    last = bottomRight.pop();
	                }
	            }

	            if (lastChild) {
	                if (lastChild.leadingComments && lastChild.leadingComments[lastChild.leadingComments.length - 1].range[1] <= this.range[0]) {
	                    this.leadingComments = lastChild.leadingComments;
	                    lastChild.leadingComments = undefined;
	                }
	            } else if (extra.leadingComments.length > 0) {
	                leadingComments = [];
	                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
	                    comment = extra.leadingComments[i];
	                    if (comment.range[1] <= this.range[0]) {
	                        leadingComments.unshift(comment);
	                        extra.leadingComments.splice(i, 1);
	                    }
	                }
	            }


	            if (leadingComments && leadingComments.length > 0) {
	                this.leadingComments = leadingComments;
	            }
	            if (trailingComments && trailingComments.length > 0) {
	                this.trailingComments = trailingComments;
	            }

	            bottomRight.push(this);
	        },

	        finish: function () {
	            if (extra.range) {
	                this.range[1] = index;
	            }
	            if (extra.loc) {
	                this.loc.end = new Position();
	                if (extra.source) {
	                    this.loc.source = extra.source;
	                }
	            }

	            if (extra.attachComment) {
	                this.processComment();
	            }
	        },

	        finishArrayExpression: function (elements) {
	            this.type = Syntax.ArrayExpression;
	            this.elements = elements;
	            this.finish();
	            return this;
	        },

	        finishArrowFunctionExpression: function (params, defaults, body, expression) {
	            this.type = Syntax.ArrowFunctionExpression;
	            this.id = null;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.rest = null;
	            this.generator = false;
	            this.expression = expression;
	            this.finish();
	            return this;
	        },

	        finishAssignmentExpression: function (operator, left, right) {
	            this.type = Syntax.AssignmentExpression;
	            this.operator = operator;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },

	        finishBinaryExpression: function (operator, left, right) {
	            this.type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression : Syntax.BinaryExpression;
	            this.operator = operator;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },

	        finishBlockStatement: function (body) {
	            this.type = Syntax.BlockStatement;
	            this.body = body;
	            this.finish();
	            return this;
	        },

	        finishBreakStatement: function (label) {
	            this.type = Syntax.BreakStatement;
	            this.label = label;
	            this.finish();
	            return this;
	        },

	        finishCallExpression: function (callee, args) {
	            this.type = Syntax.CallExpression;
	            this.callee = callee;
	            this.arguments = args;
	            this.finish();
	            return this;
	        },

	        finishCatchClause: function (param, body) {
	            this.type = Syntax.CatchClause;
	            this.param = param;
	            this.body = body;
	            this.finish();
	            return this;
	        },

	        finishConditionalExpression: function (test, consequent, alternate) {
	            this.type = Syntax.ConditionalExpression;
	            this.test = test;
	            this.consequent = consequent;
	            this.alternate = alternate;
	            this.finish();
	            return this;
	        },

	        finishContinueStatement: function (label) {
	            this.type = Syntax.ContinueStatement;
	            this.label = label;
	            this.finish();
	            return this;
	        },

	        finishDebuggerStatement: function () {
	            this.type = Syntax.DebuggerStatement;
	            this.finish();
	            return this;
	        },

	        finishDoWhileStatement: function (body, test) {
	            this.type = Syntax.DoWhileStatement;
	            this.body = body;
	            this.test = test;
	            this.finish();
	            return this;
	        },

	        finishEmptyStatement: function () {
	            this.type = Syntax.EmptyStatement;
	            this.finish();
	            return this;
	        },

	        finishExpressionStatement: function (expression) {
	            this.type = Syntax.ExpressionStatement;
	            this.expression = expression;
	            this.finish();
	            return this;
	        },

	        finishForStatement: function (init, test, update, body) {
	            this.type = Syntax.ForStatement;
	            this.init = init;
	            this.test = test;
	            this.update = update;
	            this.body = body;
	            this.finish();
	            return this;
	        },

	        finishForInStatement: function (left, right, body) {
	            this.type = Syntax.ForInStatement;
	            this.left = left;
	            this.right = right;
	            this.body = body;
	            this.each = false;
	            this.finish();
	            return this;
	        },

	        finishFunctionDeclaration: function (id, params, defaults, body) {
	            this.type = Syntax.FunctionDeclaration;
	            this.id = id;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.rest = null;
	            this.generator = false;
	            this.expression = false;
	            this.finish();
	            return this;
	        },

	        finishFunctionExpression: function (id, params, defaults, body) {
	            this.type = Syntax.FunctionExpression;
	            this.id = id;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.rest = null;
	            this.generator = false;
	            this.expression = false;
	            this.finish();
	            return this;
	        },

	        finishIdentifier: function (name) {
	            this.type = Syntax.Identifier;
	            this.name = name;
	            this.finish();
	            return this;
	        },

	        finishIfStatement: function (test, consequent, alternate) {
	            this.type = Syntax.IfStatement;
	            this.test = test;
	            this.consequent = consequent;
	            this.alternate = alternate;
	            this.finish();
	            return this;
	        },

	        finishLabeledStatement: function (label, body) {
	            this.type = Syntax.LabeledStatement;
	            this.label = label;
	            this.body = body;
	            this.finish();
	            return this;
	        },

	        finishLiteral: function (token) {
	            this.type = Syntax.Literal;
	            this.value = token.value;
	            this.raw = source.slice(token.start, token.end);
	            if (token.regex) {
	                this.regex = token.regex;
	            }
	            this.finish();
	            return this;
	        },

	        finishMemberExpression: function (accessor, object, property) {
	            this.type = Syntax.MemberExpression;
	            this.computed = accessor === '[';
	            this.object = object;
	            this.property = property;
	            this.finish();
	            return this;
	        },

	        finishNewExpression: function (callee, args) {
	            this.type = Syntax.NewExpression;
	            this.callee = callee;
	            this.arguments = args;
	            this.finish();
	            return this;
	        },

	        finishObjectExpression: function (properties) {
	            this.type = Syntax.ObjectExpression;
	            this.properties = properties;
	            this.finish();
	            return this;
	        },

	        finishPostfixExpression: function (operator, argument) {
	            this.type = Syntax.UpdateExpression;
	            this.operator = operator;
	            this.argument = argument;
	            this.prefix = false;
	            this.finish();
	            return this;
	        },

	        finishProgram: function (body) {
	            this.type = Syntax.Program;
	            this.body = body;
	            this.finish();
	            return this;
	        },

	        finishProperty: function (kind, key, value, method, shorthand) {
	            this.type = Syntax.Property;
	            this.key = key;
	            this.value = value;
	            this.kind = kind;
	            this.method = method;
	            this.shorthand = shorthand;
	            this.finish();
	            return this;
	        },

	        finishReturnStatement: function (argument) {
	            this.type = Syntax.ReturnStatement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },

	        finishSequenceExpression: function (expressions) {
	            this.type = Syntax.SequenceExpression;
	            this.expressions = expressions;
	            this.finish();
	            return this;
	        },

	        finishSwitchCase: function (test, consequent) {
	            this.type = Syntax.SwitchCase;
	            this.test = test;
	            this.consequent = consequent;
	            this.finish();
	            return this;
	        },

	        finishSwitchStatement: function (discriminant, cases) {
	            this.type = Syntax.SwitchStatement;
	            this.discriminant = discriminant;
	            this.cases = cases;
	            this.finish();
	            return this;
	        },

	        finishThisExpression: function () {
	            this.type = Syntax.ThisExpression;
	            this.finish();
	            return this;
	        },

	        finishThrowStatement: function (argument) {
	            this.type = Syntax.ThrowStatement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },

	        finishTryStatement: function (block, guardedHandlers, handlers, finalizer) {
	            this.type = Syntax.TryStatement;
	            this.block = block;
	            this.guardedHandlers = guardedHandlers;
	            this.handlers = handlers;
	            this.finalizer = finalizer;
	            this.finish();
	            return this;
	        },

	        finishUnaryExpression: function (operator, argument) {
	            this.type = (operator === '++' || operator === '--') ? Syntax.UpdateExpression : Syntax.UnaryExpression;
	            this.operator = operator;
	            this.argument = argument;
	            this.prefix = true;
	            this.finish();
	            return this;
	        },

	        finishVariableDeclaration: function (declarations, kind) {
	            this.type = Syntax.VariableDeclaration;
	            this.declarations = declarations;
	            this.kind = kind;
	            this.finish();
	            return this;
	        },

	        finishVariableDeclarator: function (id, init) {
	            this.type = Syntax.VariableDeclarator;
	            this.id = id;
	            this.init = init;
	            this.finish();
	            return this;
	        },

	        finishWhileStatement: function (test, body) {
	            this.type = Syntax.WhileStatement;
	            this.test = test;
	            this.body = body;
	            this.finish();
	            return this;
	        },

	        finishWithStatement: function (object, body) {
	            this.type = Syntax.WithStatement;
	            this.object = object;
	            this.body = body;
	            this.finish();
	            return this;
	        }
	    };

	    // Return true if there is a line terminator before the next token.

	    function peekLineTerminator() {
	        var pos, line, start, found;

	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        skipComment();
	        found = lineNumber !== line;
	        index = pos;
	        lineNumber = line;
	        lineStart = start;

	        return found;
	    }

	    function createError(line, pos, description) {
	        var error = new Error('Line ' + line + ': ' + description);
	        error.index = pos;
	        error.lineNumber = line;
	        error.column = pos - lineStart + 1;
	        error.description = description;
	        return error;
	    }

	    // Throw an exception

	    function throwError(messageFormat) {
	        var args, msg;

	        args = Array.prototype.slice.call(arguments, 1);
	        msg = messageFormat.replace(/%(\d)/g,
	            function (whole, idx) {
	                assert(idx < args.length, 'Message reference must be in range');
	                return args[idx];
	            }
	        );

	        throw createError(lineNumber, index, msg);
	    }

	    function tolerateError(messageFormat) {
	        var args, msg, error;

	        args = Array.prototype.slice.call(arguments, 1);
	        /* istanbul ignore next */
	        msg = messageFormat.replace(/%(\d)/g,
	            function (whole, idx) {
	                assert(idx < args.length, 'Message reference must be in range');
	                return args[idx];
	            }
	        );

	        error = createError(lineNumber, index, msg);
	        if (extra.errors) {
	            extra.errors.push(error);
	        } else {
	            throw error;
	        }
	    }

	    // Throw an exception because of the token.

	    function unexpectedTokenError(token, message) {
	        var msg = Messages.UnexpectedToken;

	        if (token) {
	            msg = message ? message :
	                (token.type === Token.EOF) ? Messages.UnexpectedEOS :
	                (token.type === Token.Identifier) ? Messages.UnexpectedIdentifier :
	                (token.type === Token.NumericLiteral) ? Messages.UnexpectedNumber :
	                (token.type === Token.StringLiteral) ? Messages.UnexpectedString :
	                Messages.UnexpectedToken;

	            if (token.type === Token.Keyword) {
	                if (isFutureReservedWord(token.value)) {
	                    msg = Messages.UnexpectedReserved;
	                } else if (strict && isStrictModeReservedWord(token.value)) {
	                    msg = Messages.StrictReservedWord;
	                }
	            }
	        }

	        msg = msg.replace('%0', token ? token.value : 'ILLEGAL');

	        return (token && typeof token.lineNumber === 'number') ?
	            createError(token.lineNumber, token.start, msg) :
	            createError(lineNumber, index, msg);
	    }

	    function throwUnexpectedToken(token, message) {
	        throw unexpectedTokenError(token, message);
	    }

	    function tolerateUnexpectedToken(token, message) {
	        var error = unexpectedTokenError(token, message);
	        if (extra.errors) {
	            extra.errors.push(error);
	        } else {
	            throw error;
	        }
	    }

	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.

	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpectedToken(token);
	        }
	    }

	    /**
	     * @name expectCommaSeparator
	     * @description Quietly expect a comma when in tolerant mode, otherwise delegates
	     * to <code>expect(value)</code>
	     * @since 2.0
	     */
	    function expectCommaSeparator() {
	        var token;

	        if (extra.errors) {
	            token = lookahead;
	            if (token.type === Token.Punctuator && token.value === ',') {
	                lex();
	            } else if (token.type === Token.Punctuator && token.value === ';') {
	                lex();
	                tolerateUnexpectedToken(token);
	            } else {
	                tolerateUnexpectedToken(token, Messages.UnexpectedToken);
	            }
	        } else {
	            expect(',');
	        }
	    }

	    // Expect the next token to match the specified keyword.
	    // If not, an exception will be thrown.

	    function expectKeyword(keyword) {
	        var token = lex();
	        if (token.type !== Token.Keyword || token.value !== keyword) {
	            throwUnexpectedToken(token);
	        }
	    }

	    // Return true if the next token matches the specified punctuator.

	    function match(value) {
	        return lookahead.type === Token.Punctuator && lookahead.value === value;
	    }

	    // Return true if the next token matches the specified keyword

	    function matchKeyword(keyword) {
	        return lookahead.type === Token.Keyword && lookahead.value === keyword;
	    }

	    // Return true if the next token is an assignment operator

	    function matchAssign() {
	        var op;

	        if (lookahead.type !== Token.Punctuator) {
	            return false;
	        }
	        op = lookahead.value;
	        return op === '=' ||
	            op === '*=' ||
	            op === '/=' ||
	            op === '%=' ||
	            op === '+=' ||
	            op === '-=' ||
	            op === '<<=' ||
	            op === '>>=' ||
	            op === '>>>=' ||
	            op === '&=' ||
	            op === '^=' ||
	            op === '|=';
	    }

	    function consumeSemicolon() {
	        var line, oldIndex = index, oldLineNumber = lineNumber,
	            oldLineStart = lineStart, oldLookahead = lookahead;

	        // Catch the very common case first: immediately a semicolon (U+003B).
	        if (source.charCodeAt(index) === 0x3B || match(';')) {
	            lex();
	            return;
	        }

	        line = lineNumber;
	        skipComment();
	        if (lineNumber !== line) {
	            index = oldIndex;
	            lineNumber = oldLineNumber;
	            lineStart = oldLineStart;
	            lookahead = oldLookahead;
	            return;
	        }

	        if (lookahead.type !== Token.EOF && !match('}')) {
	            throwUnexpectedToken(lookahead);
	        }
	    }

	    // Return true if provided expression is LeftHandSideExpression

	    function isLeftHandSide(expr) {
	        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
	    }

	    // 11.1.4 Array Initialiser

	    function parseArrayInitialiser() {
	        var elements = [], node = new Node();

	        expect('[');

	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else {
	                elements.push(parseAssignmentExpression());

	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	        }

	        lex();

	        return node.finishArrayExpression(elements);
	    }

	    // 11.1.5 Object Initialiser

	    function parsePropertyFunction(param, first) {
	        var previousStrict, body, node = new Node();

	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (first && strict && isRestrictedWord(param[0].name)) {
	            tolerateUnexpectedToken(first, Messages.StrictParamName);
	        }
	        strict = previousStrict;
	        return node.finishFunctionExpression(null, param, [], body);
	    }

	    function parsePropertyMethodFunction() {
	        var previousStrict, param, method;

	        previousStrict = strict;
	        strict = true;
	        param = parseParams();
	        method = parsePropertyFunction(param.params);
	        strict = previousStrict;

	        return method;
	    }

	    function parseObjectPropertyKey() {
	        var token, node = new Node();

	        token = lex();

	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.

	        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                tolerateUnexpectedToken(token, Messages.StrictOctalLiteral);
	            }
	            return node.finishLiteral(token);
	        }

	        return node.finishIdentifier(token.value);
	    }

	    function parseObjectProperty() {
	        var token, key, id, value, param, node = new Node();

	        token = lookahead;

	        if (token.type === Token.Identifier) {

	            id = parseObjectPropertyKey();

	            // Property Assignment: Getter and Setter.

	            if (token.value === 'get' && !(match(':') || match('('))) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                expect(')');
	                value = parsePropertyFunction([]);
	                return node.finishProperty('get', key, value, false, false);
	            }
	            if (token.value === 'set' && !(match(':') || match('('))) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                token = lookahead;
	                if (token.type !== Token.Identifier) {
	                    expect(')');
	                    tolerateUnexpectedToken(token);
	                    value = parsePropertyFunction([]);
	                } else {
	                    param = [ parseVariableIdentifier() ];
	                    expect(')');
	                    value = parsePropertyFunction(param, token);
	                }
	                return node.finishProperty('set', key, value, false, false);
	            }
	            if (match(':')) {
	                lex();
	                value = parseAssignmentExpression();
	                return node.finishProperty('init', id, value, false, false);
	            }
	            if (match('(')) {
	                value = parsePropertyMethodFunction();
	                return node.finishProperty('init', id, value, true, false);
	            }

	            value = id;
	            return node.finishProperty('init', id, value, false, true);
	        }
	        if (token.type === Token.EOF || token.type === Token.Punctuator) {
	            throwUnexpectedToken(token);
	        } else {
	            key = parseObjectPropertyKey();
	            if (match(':')) {
	                lex();
	                value = parseAssignmentExpression();
	                return node.finishProperty('init', key, value, false, false);
	            }
	            if (match('(')) {
	                value = parsePropertyMethodFunction();
	                return node.finishProperty('init', key, value, true, false);
	            }
	            throwUnexpectedToken(lex());
	        }
	    }

	    function parseObjectInitialiser() {
	        var properties = [], property, name, key, kind, map = {}, toString = String, node = new Node();

	        expect('{');

	        while (!match('}')) {
	            property = parseObjectProperty();

	            if (property.key.type === Syntax.Identifier) {
	                name = property.key.name;
	            } else {
	                name = toString(property.key.value);
	            }
	            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;

	            key = '$' + name;
	            if (Object.prototype.hasOwnProperty.call(map, key)) {
	                if (map[key] === PropertyKind.Data) {
	                    if (strict && kind === PropertyKind.Data) {
	                        tolerateError(Messages.StrictDuplicateProperty);
	                    } else if (kind !== PropertyKind.Data) {
	                        tolerateError(Messages.AccessorDataProperty);
	                    }
	                } else {
	                    if (kind === PropertyKind.Data) {
	                        tolerateError(Messages.AccessorDataProperty);
	                    } else if (map[key] & kind) {
	                        tolerateError(Messages.AccessorGetSet);
	                    }
	                }
	                map[key] |= kind;
	            } else {
	                map[key] = kind;
	            }

	            properties.push(property);

	            if (!match('}')) {
	                expectCommaSeparator();
	            }
	        }

	        expect('}');

	        return node.finishObjectExpression(properties);
	    }

	    // 11.1.6 The Grouping Operator

	    function parseGroupExpression() {
	        var expr;

	        expect('(');

	        if (match(')')) {
	            lex();
	            return PlaceHolders.ArrowParameterPlaceHolder;
	        }

	        ++state.parenthesisCount;

	        expr = parseExpression();

	        expect(')');

	        return expr;
	    }


	    // 11.1 Primary Expressions

	    function parsePrimaryExpression() {
	        var type, token, expr, node;

	        if (match('(')) {
	            return parseGroupExpression();
	        }

	        if (match('[')) {
	            return parseArrayInitialiser();
	        }

	        if (match('{')) {
	            return parseObjectInitialiser();
	        }

	        type = lookahead.type;
	        node = new Node();

	        if (type === Token.Identifier) {
	            expr = node.finishIdentifier(lex().value);
	        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            if (strict && lookahead.octal) {
	                tolerateUnexpectedToken(lookahead, Messages.StrictOctalLiteral);
	            }
	            expr = node.finishLiteral(lex());
	        } else if (type === Token.Keyword) {
	            if (matchKeyword('function')) {
	                return parseFunctionExpression();
	            }
	            if (matchKeyword('this')) {
	                lex();
	                expr = node.finishThisExpression();
	            } else {
	                throwUnexpectedToken(lex());
	            }
	        } else if (type === Token.BooleanLiteral) {
	            token = lex();
	            token.value = (token.value === 'true');
	            expr = node.finishLiteral(token);
	        } else if (type === Token.NullLiteral) {
	            token = lex();
	            token.value = null;
	            expr = node.finishLiteral(token);
	        } else if (match('/') || match('/=')) {
	            if (typeof extra.tokens !== 'undefined') {
	                expr = node.finishLiteral(collectRegex());
	            } else {
	                expr = node.finishLiteral(scanRegExp());
	            }
	            peek();
	        } else {
	            throwUnexpectedToken(lex());
	        }

	        return expr;
	    }

	    // 11.2 Left-Hand-Side Expressions

	    function parseArguments() {
	        var args = [];

	        expect('(');

	        if (!match(')')) {
	            while (index < length) {
	                args.push(parseAssignmentExpression());
	                if (match(')')) {
	                    break;
	                }
	                expectCommaSeparator();
	            }
	        }

	        expect(')');

	        return args;
	    }

	    function parseNonComputedProperty() {
	        var token, node = new Node();

	        token = lex();

	        if (!isIdentifierName(token)) {
	            throwUnexpectedToken(token);
	        }

	        return node.finishIdentifier(token.value);
	    }

	    function parseNonComputedMember() {
	        expect('.');

	        return parseNonComputedProperty();
	    }

	    function parseComputedMember() {
	        var expr;

	        expect('[');

	        expr = parseExpression();

	        expect(']');

	        return expr;
	    }

	    function parseNewExpression() {
	        var callee, args, node = new Node();

	        expectKeyword('new');
	        callee = parseLeftHandSideExpression();
	        args = match('(') ? parseArguments() : [];

	        return node.finishNewExpression(callee, args);
	    }

	    function parseLeftHandSideExpressionAllowCall() {
	        var expr, args, property, startToken, previousAllowIn = state.allowIn;

	        startToken = lookahead;
	        state.allowIn = true;
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        for (;;) {
	            if (match('.')) {
	                property = parseNonComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
	            } else if (match('(')) {
	                args = parseArguments();
	                expr = new WrappingNode(startToken).finishCallExpression(expr, args);
	            } else if (match('[')) {
	                property = parseComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
	            } else {
	                break;
	            }
	        }
	        state.allowIn = previousAllowIn;

	        return expr;
	    }

	    function parseLeftHandSideExpression() {
	        var expr, property, startToken;
	        assert(state.allowIn, 'callee of new expression always allow in keyword.');

	        startToken = lookahead;

	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

	        for (;;) {
	            if (match('[')) {
	                property = parseComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
	            } else if (match('.')) {
	                property = parseNonComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
	            } else {
	                break;
	            }
	        }
	        return expr;
	    }

	    // 11.3 Postfix Expressions

	    function parsePostfixExpression() {
	        var expr, token, startToken = lookahead;

	        expr = parseLeftHandSideExpressionAllowCall();

	        if (lookahead.type === Token.Punctuator) {
	            if ((match('++') || match('--')) && !peekLineTerminator()) {
	                // 11.3.1, 11.3.2
	                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                    tolerateError(Messages.StrictLHSPostfix);
	                }

	                if (!isLeftHandSide(expr)) {
	                    tolerateError(Messages.InvalidLHSInAssignment);
	                }

	                token = lex();
	                expr = new WrappingNode(startToken).finishPostfixExpression(token.value, expr);
	            }
	        }

	        return expr;
	    }

	    // 11.4 Unary Operators

	    function parseUnaryExpression() {
	        var token, expr, startToken;

	        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
	            expr = parsePostfixExpression();
	        } else if (match('++') || match('--')) {
	            startToken = lookahead;
	            token = lex();
	            expr = parseUnaryExpression();
	            // 11.4.4, 11.4.5
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                tolerateError(Messages.StrictLHSPrefix);
	            }

	            if (!isLeftHandSide(expr)) {
	                tolerateError(Messages.InvalidLHSInAssignment);
	            }

	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	        } else if (match('+') || match('-') || match('~') || match('!')) {
	            startToken = lookahead;
	            token = lex();
	            expr = parseUnaryExpression();
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            startToken = lookahead;
	            token = lex();
	            expr = parseUnaryExpression();
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
	                tolerateError(Messages.StrictDelete);
	            }
	        } else {
	            expr = parsePostfixExpression();
	        }

	        return expr;
	    }

	    function binaryPrecedence(token, allowIn) {
	        var prec = 0;

	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return 0;
	        }

	        switch (token.value) {
	        case '||':
	            prec = 1;
	            break;

	        case '&&':
	            prec = 2;
	            break;

	        case '|':
	            prec = 3;
	            break;

	        case '^':
	            prec = 4;
	            break;

	        case '&':
	            prec = 5;
	            break;

	        case '==':
	        case '!=':
	        case '===':
	        case '!==':
	            prec = 6;
	            break;

	        case '<':
	        case '>':
	        case '<=':
	        case '>=':
	        case 'instanceof':
	            prec = 7;
	            break;

	        case 'in':
	            prec = allowIn ? 7 : 0;
	            break;

	        case '<<':
	        case '>>':
	        case '>>>':
	            prec = 8;
	            break;

	        case '+':
	        case '-':
	            prec = 9;
	            break;

	        case '*':
	        case '/':
	        case '%':
	            prec = 11;
	            break;

	        default:
	            break;
	        }

	        return prec;
	    }

	    // 11.5 Multiplicative Operators
	    // 11.6 Additive Operators
	    // 11.7 Bitwise Shift Operators
	    // 11.8 Relational Operators
	    // 11.9 Equality Operators
	    // 11.10 Binary Bitwise Operators
	    // 11.11 Binary Logical Operators

	    function parseBinaryExpression() {
	        var marker, markers, expr, token, prec, stack, right, operator, left, i;

	        marker = lookahead;
	        left = parseUnaryExpression();
	        if (left === PlaceHolders.ArrowParameterPlaceHolder) {
	            return left;
	        }

	        token = lookahead;
	        prec = binaryPrecedence(token, state.allowIn);
	        if (prec === 0) {
	            return left;
	        }
	        token.prec = prec;
	        lex();

	        markers = [marker, lookahead];
	        right = parseUnaryExpression();

	        stack = [left, token, right];

	        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {

	            // Reduce: make a binary expression from the three topmost entries.
	            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
	                right = stack.pop();
	                operator = stack.pop().value;
	                left = stack.pop();
	                markers.pop();
	                expr = new WrappingNode(markers[markers.length - 1]).finishBinaryExpression(operator, left, right);
	                stack.push(expr);
	            }

	            // Shift.
	            token = lex();
	            token.prec = prec;
	            stack.push(token);
	            markers.push(lookahead);
	            expr = parseUnaryExpression();
	            stack.push(expr);
	        }

	        // Final reduce to clean-up the stack.
	        i = stack.length - 1;
	        expr = stack[i];
	        markers.pop();
	        while (i > 1) {
	            expr = new WrappingNode(markers.pop()).finishBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
	            i -= 2;
	        }

	        return expr;
	    }


	    // 11.12 Conditional Operator

	    function parseConditionalExpression() {
	        var expr, previousAllowIn, consequent, alternate, startToken;

	        startToken = lookahead;

	        expr = parseBinaryExpression();
	        if (expr === PlaceHolders.ArrowParameterPlaceHolder) {
	            return expr;
	        }
	        if (match('?')) {
	            lex();
	            previousAllowIn = state.allowIn;
	            state.allowIn = true;
	            consequent = parseAssignmentExpression();
	            state.allowIn = previousAllowIn;
	            expect(':');
	            alternate = parseAssignmentExpression();

	            expr = new WrappingNode(startToken).finishConditionalExpression(expr, consequent, alternate);
	        }

	        return expr;
	    }

	    // [ES6] 14.2 Arrow Function

	    function parseConciseBody() {
	        if (match('{')) {
	            return parseFunctionSourceElements();
	        }
	        return parseAssignmentExpression();
	    }

	    function reinterpretAsCoverFormalsList(expressions) {
	        var i, len, param, params, defaults, defaultCount, options, rest, token;

	        params = [];
	        defaults = [];
	        defaultCount = 0;
	        rest = null;
	        options = {
	            paramSet: {}
	        };

	        for (i = 0, len = expressions.length; i < len; i += 1) {
	            param = expressions[i];
	            if (param.type === Syntax.Identifier) {
	                params.push(param);
	                defaults.push(null);
	                validateParam(options, param, param.name);
	            } else if (param.type === Syntax.AssignmentExpression) {
	                params.push(param.left);
	                defaults.push(param.right);
	                ++defaultCount;
	                validateParam(options, param.left, param.left.name);
	            } else {
	                return null;
	            }
	        }

	        if (options.message === Messages.StrictParamDupe) {
	            token = strict ? options.stricted : options.firstRestricted;
	            throwUnexpectedToken(token, options.message);
	        }

	        if (defaultCount === 0) {
	            defaults = [];
	        }

	        return {
	            params: params,
	            defaults: defaults,
	            rest: rest,
	            stricted: options.stricted,
	            firstRestricted: options.firstRestricted,
	            message: options.message
	        };
	    }

	    function parseArrowFunctionExpression(options, node) {
	        var previousStrict, body;

	        expect('=>');
	        previousStrict = strict;

	        body = parseConciseBody();

	        if (strict && options.firstRestricted) {
	            throwUnexpectedToken(options.firstRestricted, options.message);
	        }
	        if (strict && options.stricted) {
	            tolerateUnexpectedToken(options.stricted, options.message);
	        }

	        strict = previousStrict;

	        return node.finishArrowFunctionExpression(options.params, options.defaults, body, body.type !== Syntax.BlockStatement);
	    }

	    // 11.13 Assignment Operators

	    function parseAssignmentExpression() {
	        var oldParenthesisCount, token, expr, right, list, startToken;

	        oldParenthesisCount = state.parenthesisCount;

	        startToken = lookahead;
	        token = lookahead;

	        expr = parseConditionalExpression();

	        if (expr === PlaceHolders.ArrowParameterPlaceHolder || match('=>')) {
	            if (state.parenthesisCount === oldParenthesisCount ||
	                    state.parenthesisCount === (oldParenthesisCount + 1)) {
	                if (expr.type === Syntax.Identifier) {
	                    list = reinterpretAsCoverFormalsList([ expr ]);
	                } else if (expr.type === Syntax.AssignmentExpression) {
	                    list = reinterpretAsCoverFormalsList([ expr ]);
	                } else if (expr.type === Syntax.SequenceExpression) {
	                    list = reinterpretAsCoverFormalsList(expr.expressions);
	                } else if (expr === PlaceHolders.ArrowParameterPlaceHolder) {
	                    list = reinterpretAsCoverFormalsList([]);
	                }
	                if (list) {
	                    return parseArrowFunctionExpression(list, new WrappingNode(startToken));
	                }
	            }
	        }

	        if (matchAssign()) {
	            // LeftHandSideExpression
	            if (!isLeftHandSide(expr)) {
	                tolerateError(Messages.InvalidLHSInAssignment);
	            }

	            // 11.13.1
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                tolerateUnexpectedToken(token, Messages.StrictLHSAssignment);
	            }

	            token = lex();
	            right = parseAssignmentExpression();
	            expr = new WrappingNode(startToken).finishAssignmentExpression(token.value, expr, right);
	        }

	        return expr;
	    }

	    // 11.14 Comma Operator

	    function parseExpression() {
	        var expr, startToken = lookahead, expressions;

	        expr = parseAssignmentExpression();

	        if (match(',')) {
	            expressions = [expr];

	            while (index < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	                expressions.push(parseAssignmentExpression());
	            }

	            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
	        }

	        return expr;
	    }

	    // 12.1 Block

	    function parseStatementList() {
	        var list = [],
	            statement;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            statement = parseSourceElement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            list.push(statement);
	        }

	        return list;
	    }

	    function parseBlock() {
	        var block, node = new Node();

	        expect('{');

	        block = parseStatementList();

	        expect('}');

	        return node.finishBlockStatement(block);
	    }

	    // 12.2 Variable Statement

	    function parseVariableIdentifier() {
	        var token, node = new Node();

	        token = lex();

	        if (token.type !== Token.Identifier) {
	            if (strict && token.type === Token.Keyword && isStrictModeReservedWord(token.value)) {
	                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
	            } else {
	                throwUnexpectedToken(token);
	            }
	        }

	        return node.finishIdentifier(token.value);
	    }

	    function parseVariableDeclaration(kind) {
	        var init = null, id, node = new Node();

	        id = parseVariableIdentifier();

	        // 12.2.1
	        if (strict && isRestrictedWord(id.name)) {
	            tolerateError(Messages.StrictVarName);
	        }

	        if (kind === 'const') {
	            expect('=');
	            init = parseAssignmentExpression();
	        } else if (match('=')) {
	            lex();
	            init = parseAssignmentExpression();
	        }

	        return node.finishVariableDeclarator(id, init);
	    }

	    function parseVariableDeclarationList(kind) {
	        var list = [];

	        do {
	            list.push(parseVariableDeclaration(kind));
	            if (!match(',')) {
	                break;
	            }
	            lex();
	        } while (index < length);

	        return list;
	    }

	    function parseVariableStatement(node) {
	        var declarations;

	        expectKeyword('var');

	        declarations = parseVariableDeclarationList();

	        consumeSemicolon();

	        return node.finishVariableDeclaration(declarations, 'var');
	    }

	    // kind may be `const` or `let`
	    // Both are experimental and not in the specification yet.
	    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
	    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
	    function parseConstLetDeclaration(kind) {
	        var declarations, node = new Node();

	        expectKeyword(kind);

	        declarations = parseVariableDeclarationList(kind);

	        consumeSemicolon();

	        return node.finishVariableDeclaration(declarations, kind);
	    }

	    // 12.3 Empty Statement

	    function parseEmptyStatement() {
	        var node = new Node();
	        expect(';');
	        return node.finishEmptyStatement();
	    }

	    // 12.4 Expression Statement

	    function parseExpressionStatement(node) {
	        var expr = parseExpression();
	        consumeSemicolon();
	        return node.finishExpressionStatement(expr);
	    }

	    // 12.5 If statement

	    function parseIfStatement(node) {
	        var test, consequent, alternate;

	        expectKeyword('if');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        consequent = parseStatement();

	        if (matchKeyword('else')) {
	            lex();
	            alternate = parseStatement();
	        } else {
	            alternate = null;
	        }

	        return node.finishIfStatement(test, consequent, alternate);
	    }

	    // 12.6 Iteration Statements

	    function parseDoWhileStatement(node) {
	        var body, test, oldInIteration;

	        expectKeyword('do');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        expectKeyword('while');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        if (match(';')) {
	            lex();
	        }

	        return node.finishDoWhileStatement(body, test);
	    }

	    function parseWhileStatement(node) {
	        var test, body, oldInIteration;

	        expectKeyword('while');

	        expect('(');

	        test = parseExpression();

	        expect(')');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        return node.finishWhileStatement(test, body);
	    }

	    function parseForVariableDeclaration() {
	        var token, declarations, node = new Node();

	        token = lex();
	        declarations = parseVariableDeclarationList();

	        return node.finishVariableDeclaration(declarations, token.value);
	    }

	    function parseForStatement(node) {
	        var init, test, update, left, right, body, oldInIteration, previousAllowIn = state.allowIn;

	        init = test = update = null;

	        expectKeyword('for');

	        expect('(');

	        if (match(';')) {
	            lex();
	        } else {
	            if (matchKeyword('var') || matchKeyword('let')) {
	                state.allowIn = false;
	                init = parseForVariableDeclaration();
	                state.allowIn = previousAllowIn;

	                if (init.declarations.length === 1 && matchKeyword('in')) {
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            } else {
	                state.allowIn = false;
	                init = parseExpression();
	                state.allowIn = previousAllowIn;

	                if (matchKeyword('in')) {
	                    // LeftHandSideExpression
	                    if (!isLeftHandSide(init)) {
	                        tolerateError(Messages.InvalidLHSInForIn);
	                    }

	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            }

	            if (typeof left === 'undefined') {
	                expect(';');
	            }
	        }

	        if (typeof left === 'undefined') {

	            if (!match(';')) {
	                test = parseExpression();
	            }
	            expect(';');

	            if (!match(')')) {
	                update = parseExpression();
	            }
	        }

	        expect(')');

	        oldInIteration = state.inIteration;
	        state.inIteration = true;

	        body = parseStatement();

	        state.inIteration = oldInIteration;

	        return (typeof left === 'undefined') ?
	                node.finishForStatement(init, test, update, body) :
	                node.finishForInStatement(left, right, body);
	    }

	    // 12.7 The continue statement

	    function parseContinueStatement(node) {
	        var label = null, key;

	        expectKeyword('continue');

	        // Optimize the most common form: 'continue;'.
	        if (source.charCodeAt(index) === 0x3B) {
	            lex();

	            if (!state.inIteration) {
	                throwError(Messages.IllegalContinue);
	            }

	            return node.finishContinueStatement(null);
	        }

	        if (peekLineTerminator()) {
	            if (!state.inIteration) {
	                throwError(Messages.IllegalContinue);
	            }

	            return node.finishContinueStatement(null);
	        }

	        if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();

	            key = '$' + label.name;
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.UnknownLabel, label.name);
	            }
	        }

	        consumeSemicolon();

	        if (label === null && !state.inIteration) {
	            throwError(Messages.IllegalContinue);
	        }

	        return node.finishContinueStatement(label);
	    }

	    // 12.8 The break statement

	    function parseBreakStatement(node) {
	        var label = null, key;

	        expectKeyword('break');

	        // Catch the very common case first: immediately a semicolon (U+003B).
	        if (source.charCodeAt(index) === 0x3B) {
	            lex();

	            if (!(state.inIteration || state.inSwitch)) {
	                throwError(Messages.IllegalBreak);
	            }

	            return node.finishBreakStatement(null);
	        }

	        if (peekLineTerminator()) {
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError(Messages.IllegalBreak);
	            }

	            return node.finishBreakStatement(null);
	        }

	        if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();

	            key = '$' + label.name;
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.UnknownLabel, label.name);
	            }
	        }

	        consumeSemicolon();

	        if (label === null && !(state.inIteration || state.inSwitch)) {
	            throwError(Messages.IllegalBreak);
	        }

	        return node.finishBreakStatement(label);
	    }

	    // 12.9 The return statement

	    function parseReturnStatement(node) {
	        var argument = null;

	        expectKeyword('return');

	        if (!state.inFunctionBody) {
	            tolerateError(Messages.IllegalReturn);
	        }

	        // 'return' followed by a space and an identifier is very common.
	        if (source.charCodeAt(index) === 0x20) {
	            if (isIdentifierStart(source.charCodeAt(index + 1))) {
	                argument = parseExpression();
	                consumeSemicolon();
	                return node.finishReturnStatement(argument);
	            }
	        }

	        if (peekLineTerminator()) {
	            return node.finishReturnStatement(null);
	        }

	        if (!match(';')) {
	            if (!match('}') && lookahead.type !== Token.EOF) {
	                argument = parseExpression();
	            }
	        }

	        consumeSemicolon();

	        return node.finishReturnStatement(argument);
	    }

	    // 12.10 The with statement

	    function parseWithStatement(node) {
	        var object, body;

	        if (strict) {
	            // TODO(ikarienator): Should we update the test cases instead?
	            skipComment();
	            tolerateError(Messages.StrictModeWith);
	        }

	        expectKeyword('with');

	        expect('(');

	        object = parseExpression();

	        expect(')');

	        body = parseStatement();

	        return node.finishWithStatement(object, body);
	    }

	    // 12.10 The swith statement

	    function parseSwitchCase() {
	        var test, consequent = [], statement, node = new Node();

	        if (matchKeyword('default')) {
	            lex();
	            test = null;
	        } else {
	            expectKeyword('case');
	            test = parseExpression();
	        }
	        expect(':');

	        while (index < length) {
	            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
	                break;
	            }
	            statement = parseStatement();
	            consequent.push(statement);
	        }

	        return node.finishSwitchCase(test, consequent);
	    }

	    function parseSwitchStatement(node) {
	        var discriminant, cases, clause, oldInSwitch, defaultFound;

	        expectKeyword('switch');

	        expect('(');

	        discriminant = parseExpression();

	        expect(')');

	        expect('{');

	        cases = [];

	        if (match('}')) {
	            lex();
	            return node.finishSwitchStatement(discriminant, cases);
	        }

	        oldInSwitch = state.inSwitch;
	        state.inSwitch = true;
	        defaultFound = false;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            clause = parseSwitchCase();
	            if (clause.test === null) {
	                if (defaultFound) {
	                    throwError(Messages.MultipleDefaultsInSwitch);
	                }
	                defaultFound = true;
	            }
	            cases.push(clause);
	        }

	        state.inSwitch = oldInSwitch;

	        expect('}');

	        return node.finishSwitchStatement(discriminant, cases);
	    }

	    // 12.13 The throw statement

	    function parseThrowStatement(node) {
	        var argument;

	        expectKeyword('throw');

	        if (peekLineTerminator()) {
	            throwError(Messages.NewlineAfterThrow);
	        }

	        argument = parseExpression();

	        consumeSemicolon();

	        return node.finishThrowStatement(argument);
	    }

	    // 12.14 The try statement

	    function parseCatchClause() {
	        var param, body, node = new Node();

	        expectKeyword('catch');

	        expect('(');
	        if (match(')')) {
	            throwUnexpectedToken(lookahead);
	        }

	        param = parseVariableIdentifier();
	        // 12.14.1
	        if (strict && isRestrictedWord(param.name)) {
	            tolerateError(Messages.StrictCatchVariable);
	        }

	        expect(')');
	        body = parseBlock();
	        return node.finishCatchClause(param, body);
	    }

	    function parseTryStatement(node) {
	        var block, handlers = [], finalizer = null;

	        expectKeyword('try');

	        block = parseBlock();

	        if (matchKeyword('catch')) {
	            handlers.push(parseCatchClause());
	        }

	        if (matchKeyword('finally')) {
	            lex();
	            finalizer = parseBlock();
	        }

	        if (handlers.length === 0 && !finalizer) {
	            throwError(Messages.NoCatchOrFinally);
	        }

	        return node.finishTryStatement(block, [], handlers, finalizer);
	    }

	    // 12.15 The debugger statement

	    function parseDebuggerStatement(node) {
	        expectKeyword('debugger');

	        consumeSemicolon();

	        return node.finishDebuggerStatement();
	    }

	    // 12 Statements

	    function parseStatement() {
	        var type = lookahead.type,
	            expr,
	            labeledBody,
	            key,
	            node;

	        if (type === Token.EOF) {
	            throwUnexpectedToken(lookahead);
	        }

	        if (type === Token.Punctuator && lookahead.value === '{') {
	            return parseBlock();
	        }

	        node = new Node();

	        if (type === Token.Punctuator) {
	            switch (lookahead.value) {
	            case ';':
	                return parseEmptyStatement(node);
	            case '(':
	                return parseExpressionStatement(node);
	            default:
	                break;
	            }
	        } else if (type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'break':
	                return parseBreakStatement(node);
	            case 'continue':
	                return parseContinueStatement(node);
	            case 'debugger':
	                return parseDebuggerStatement(node);
	            case 'do':
	                return parseDoWhileStatement(node);
	            case 'for':
	                return parseForStatement(node);
	            case 'function':
	                return parseFunctionDeclaration(node);
	            case 'if':
	                return parseIfStatement(node);
	            case 'return':
	                return parseReturnStatement(node);
	            case 'switch':
	                return parseSwitchStatement(node);
	            case 'throw':
	                return parseThrowStatement(node);
	            case 'try':
	                return parseTryStatement(node);
	            case 'var':
	                return parseVariableStatement(node);
	            case 'while':
	                return parseWhileStatement(node);
	            case 'with':
	                return parseWithStatement(node);
	            default:
	                break;
	            }
	        }

	        expr = parseExpression();

	        // 12.12 Labelled Statements
	        if ((expr.type === Syntax.Identifier) && match(':')) {
	            lex();

	            key = '$' + expr.name;
	            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.Redeclaration, 'Label', expr.name);
	            }

	            state.labelSet[key] = true;
	            labeledBody = parseStatement();
	            delete state.labelSet[key];
	            return node.finishLabeledStatement(expr, labeledBody);
	        }

	        consumeSemicolon();

	        return node.finishExpressionStatement(expr);
	    }

	    // 13 Function Definition

	    function parseFunctionSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted,
	            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, oldParenthesisCount,
	            node = new Node();

	        expect('{');

	        while (index < length) {
	            if (lookahead.type !== Token.StringLiteral) {
	                break;
	            }
	            token = lookahead;

	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.start + 1, token.end - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }

	        oldLabelSet = state.labelSet;
	        oldInIteration = state.inIteration;
	        oldInSwitch = state.inSwitch;
	        oldInFunctionBody = state.inFunctionBody;
	        oldParenthesisCount = state.parenthesizedCount;

	        state.labelSet = {};
	        state.inIteration = false;
	        state.inSwitch = false;
	        state.inFunctionBody = true;
	        state.parenthesizedCount = 0;

	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }

	        expect('}');

	        state.labelSet = oldLabelSet;
	        state.inIteration = oldInIteration;
	        state.inSwitch = oldInSwitch;
	        state.inFunctionBody = oldInFunctionBody;
	        state.parenthesizedCount = oldParenthesisCount;

	        return node.finishBlockStatement(sourceElements);
	    }

	    function validateParam(options, param, name) {
	        var key = '$' + name;
	        if (strict) {
	            if (isRestrictedWord(name)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamName;
	            }
	            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        } else if (!options.firstRestricted) {
	            if (isRestrictedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictParamName;
	            } else if (isStrictModeReservedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictReservedWord;
	            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        }
	        options.paramSet[key] = true;
	    }

	    function parseParam(options) {
	        var token, param, def;

	        token = lookahead;
	        param = parseVariableIdentifier();
	        validateParam(options, token, token.value);
	        if (match('=')) {
	            lex();
	            def = parseAssignmentExpression();
	            ++options.defaultCount;
	        }

	        options.params.push(param);
	        options.defaults.push(def);

	        return !match(')');
	    }

	    function parseParams(firstRestricted) {
	        var options;

	        options = {
	            params: [],
	            defaultCount: 0,
	            defaults: [],
	            firstRestricted: firstRestricted
	        };

	        expect('(');

	        if (!match(')')) {
	            options.paramSet = {};
	            while (index < length) {
	                if (!parseParam(options)) {
	                    break;
	                }
	                expect(',');
	            }
	        }

	        expect(')');

	        if (options.defaultCount === 0) {
	            options.defaults = [];
	        }

	        return {
	            params: options.params,
	            defaults: options.defaults,
	            stricted: options.stricted,
	            firstRestricted: options.firstRestricted,
	            message: options.message
	        };
	    }

	    function parseFunctionDeclaration() {
	        var id, params = [], defaults = [], body, token, stricted, tmp, firstRestricted, message, previousStrict, node = new Node();

	        expectKeyword('function');
	        token = lookahead;
	        id = parseVariableIdentifier();
	        if (strict) {
	            if (isRestrictedWord(token.value)) {
	                tolerateUnexpectedToken(token, Messages.StrictFunctionName);
	            }
	        } else {
	            if (isRestrictedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictFunctionName;
	            } else if (isStrictModeReservedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictReservedWord;
	            }
	        }

	        tmp = parseParams(firstRestricted);
	        params = tmp.params;
	        defaults = tmp.defaults;
	        stricted = tmp.stricted;
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }

	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwUnexpectedToken(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            tolerateUnexpectedToken(stricted, message);
	        }
	        strict = previousStrict;

	        return node.finishFunctionDeclaration(id, params, defaults, body);
	    }

	    function parseFunctionExpression() {
	        var token, id = null, stricted, firstRestricted, message, tmp,
	            params = [], defaults = [], body, previousStrict, node = new Node();

	        expectKeyword('function');

	        if (!match('(')) {
	            token = lookahead;
	            id = parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }

	        tmp = parseParams(firstRestricted);
	        params = tmp.params;
	        defaults = tmp.defaults;
	        stricted = tmp.stricted;
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }

	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwUnexpectedToken(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            tolerateUnexpectedToken(stricted, message);
	        }
	        strict = previousStrict;

	        return node.finishFunctionExpression(id, params, defaults, body);
	    }

	    // 14 Program

	    function parseSourceElement() {
	        if (lookahead.type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'const':
	            case 'let':
	                return parseConstLetDeclaration(lookahead.value);
	            case 'function':
	                return parseFunctionDeclaration();
	            default:
	                return parseStatement();
	            }
	        }

	        if (lookahead.type !== Token.EOF) {
	            return parseStatement();
	        }
	    }

	    function parseSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted;

	        while (index < length) {
	            token = lookahead;
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }

	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.start + 1, token.end - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }

	        while (index < length) {
	            sourceElement = parseSourceElement();
	            /* istanbul ignore if */
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }
	        return sourceElements;
	    }

	    function parseProgram() {
	        var body, node;

	        skipComment();
	        peek();
	        node = new Node();
	        strict = false;

	        body = parseSourceElements();
	        return node.finishProgram(body);
	    }

	    function filterTokenLocation() {
	        var i, entry, token, tokens = [];

	        for (i = 0; i < extra.tokens.length; ++i) {
	            entry = extra.tokens[i];
	            token = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (entry.regex) {
	                token.regex = {
	                    pattern: entry.regex.pattern,
	                    flags: entry.regex.flags
	                };
	            }
	            if (extra.range) {
	                token.range = entry.range;
	            }
	            if (extra.loc) {
	                token.loc = entry.loc;
	            }
	            tokens.push(token);
	        }

	        extra.tokens = tokens;
	    }

	    function tokenize(code, options) {
	        var toString,
	            tokens;

	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }

	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowIn: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            lastCommentStart: -1
	        };

	        extra = {};

	        // Options matching.
	        options = options || {};

	        // Of course we collect tokens here.
	        options.tokens = true;
	        extra.tokens = [];
	        extra.tokenize = true;
	        // The following two fields are necessary to compute the Regex tokens.
	        extra.openParenToken = -1;
	        extra.openCurlyToken = -1;

	        extra.range = (typeof options.range === 'boolean') && options.range;
	        extra.loc = (typeof options.loc === 'boolean') && options.loc;

	        if (typeof options.comment === 'boolean' && options.comment) {
	            extra.comments = [];
	        }
	        if (typeof options.tolerant === 'boolean' && options.tolerant) {
	            extra.errors = [];
	        }

	        try {
	            peek();
	            if (lookahead.type === Token.EOF) {
	                return extra.tokens;
	            }

	            lex();
	            while (lookahead.type !== Token.EOF) {
	                try {
	                    lex();
	                } catch (lexError) {
	                    if (extra.errors) {
	                        extra.errors.push(lexError);
	                        // We have to break on the first error
	                        // to avoid infinite loops.
	                        break;
	                    } else {
	                        throw lexError;
	                    }
	                }
	            }

	            filterTokenLocation();
	            tokens = extra.tokens;
	            if (typeof extra.comments !== 'undefined') {
	                tokens.comments = extra.comments;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                tokens.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            extra = {};
	        }
	        return tokens;
	    }

	    function parse(code, options) {
	        var program, toString;

	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }

	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowIn: true,
	            labelSet: {},
	            parenthesisCount: 0,
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            lastCommentStart: -1
	        };

	        extra = {};
	        if (typeof options !== 'undefined') {
	            extra.range = (typeof options.range === 'boolean') && options.range;
	            extra.loc = (typeof options.loc === 'boolean') && options.loc;
	            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;

	            if (extra.loc && options.source !== null && options.source !== undefined) {
	                extra.source = toString(options.source);
	            }

	            if (typeof options.tokens === 'boolean' && options.tokens) {
	                extra.tokens = [];
	            }
	            if (typeof options.comment === 'boolean' && options.comment) {
	                extra.comments = [];
	            }
	            if (typeof options.tolerant === 'boolean' && options.tolerant) {
	                extra.errors = [];
	            }
	            if (extra.attachComment) {
	                extra.range = true;
	                extra.comments = [];
	                extra.bottomRightStack = [];
	                extra.trailingComments = [];
	                extra.leadingComments = [];
	            }
	        }

	        try {
	            program = parseProgram();
	            if (typeof extra.comments !== 'undefined') {
	                program.comments = extra.comments;
	            }
	            if (typeof extra.tokens !== 'undefined') {
	                filterTokenLocation();
	                program.tokens = extra.tokens;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                program.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            extra = {};
	        }

	        return program;
	    }

	    // Sync with *.json manifests.
	    exports.version = '2.0.0';

	    exports.tokenize = tokenize;

	    exports.parse = parse;

	    // Deep copy.
	   /* istanbul ignore next */
	    exports.Syntax = (function () {
	        var name, types = {};

	        if (typeof Object.create === 'function') {
	            types = Object.create(null);
	        }

	        for (name in Syntax) {
	            if (Syntax.hasOwnProperty(name)) {
	                types[name] = Syntax[name];
	            }
	        }

	        if (typeof Object.freeze === 'function') {
	            Object.freeze(types);
	        }

	        return types;
	    }());

	}));
	/* vim: set sw=4 ts=4 et tw=80 : */


/***/ },
/* 273 */,
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules


	// Declare internals

	var internals = {};


	exports.arrayToObject = function (source) {

	    var obj = {};
	    for (var i = 0, il = source.length; i < il; ++i) {
	        if (typeof source[i] !== 'undefined') {

	            obj[i] = source[i];
	        }
	    }

	    return obj;
	};


	exports.merge = function (target, source) {

	    if (!source) {
	        return target;
	    }

	    if (typeof source !== 'object') {
	        if (Array.isArray(target)) {
	            target.push(source);
	        }
	        else {
	            target[source] = true;
	        }

	        return target;
	    }

	    if (typeof target !== 'object') {
	        target = [target].concat(source);
	        return target;
	    }

	    if (Array.isArray(target) &&
	        !Array.isArray(source)) {

	        target = exports.arrayToObject(target);
	    }

	    var keys = Object.keys(source);
	    for (var k = 0, kl = keys.length; k < kl; ++k) {
	        var key = keys[k];
	        var value = source[key];

	        if (!target[key]) {
	            target[key] = value;
	        }
	        else {
	            target[key] = exports.merge(target[key], value);
	        }
	    }

	    return target;
	};


	exports.decode = function (str) {

	    try {
	        return decodeURIComponent(str.replace(/\+/g, ' '));
	    } catch (e) {
	        return str;
	    }
	};


	exports.compact = function (obj, refs) {

	    if (typeof obj !== 'object' ||
	        obj === null) {

	        return obj;
	    }

	    refs = refs || [];
	    var lookup = refs.indexOf(obj);
	    if (lookup !== -1) {
	        return refs[lookup];
	    }

	    refs.push(obj);

	    if (Array.isArray(obj)) {
	        var compacted = [];

	        for (var i = 0, il = obj.length; i < il; ++i) {
	            if (typeof obj[i] !== 'undefined') {
	                compacted.push(obj[i]);
	            }
	        }

	        return compacted;
	    }

	    var keys = Object.keys(obj);
	    for (i = 0, il = keys.length; i < il; ++i) {
	        var key = keys[i];
	        obj[key] = exports.compact(obj[key], refs);
	    }

	    return obj;
	};


	exports.isRegExp = function (obj) {
	    return Object.prototype.toString.call(obj) === '[object RegExp]';
	};


	exports.isBuffer = function (obj) {

	    if (obj === null ||
	        typeof obj === 'undefined') {

	        return false;
	    }

	    return !!(obj.constructor &&
	        obj.constructor.isBuffer &&
	        obj.constructor.isBuffer(obj));
	};


/***/ },
/* 275 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  var base64VLQ = __webpack_require__(278);
	  var util = __webpack_require__(279);
	  var ArraySet = __webpack_require__(280).ArraySet;

	  /**
	   * An instance of the SourceMapGenerator represents a source map which is
	   * being built incrementally. To create a new one, you must pass an object
	   * with the following properties:
	   *
	   *   - file: The filename of the generated source.
	   *   - sourceRoot: An optional root for all URLs in this source map.
	   */
	  function SourceMapGenerator(aArgs) {
	    this._file = util.getArg(aArgs, 'file');
	    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
	    this._sources = new ArraySet();
	    this._names = new ArraySet();
	    this._mappings = [];
	    this._sourcesContents = null;
	  }

	  SourceMapGenerator.prototype._version = 3;

	  /**
	   * Creates a new SourceMapGenerator based on a SourceMapConsumer
	   *
	   * @param aSourceMapConsumer The SourceMap.
	   */
	  SourceMapGenerator.fromSourceMap =
	    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
	      var sourceRoot = aSourceMapConsumer.sourceRoot;
	      var generator = new SourceMapGenerator({
	        file: aSourceMapConsumer.file,
	        sourceRoot: sourceRoot
	      });
	      aSourceMapConsumer.eachMapping(function (mapping) {
	        var newMapping = {
	          generated: {
	            line: mapping.generatedLine,
	            column: mapping.generatedColumn
	          }
	        };

	        if (mapping.source) {
	          newMapping.source = mapping.source;
	          if (sourceRoot) {
	            newMapping.source = util.relative(sourceRoot, newMapping.source);
	          }

	          newMapping.original = {
	            line: mapping.originalLine,
	            column: mapping.originalColumn
	          };

	          if (mapping.name) {
	            newMapping.name = mapping.name;
	          }
	        }

	        generator.addMapping(newMapping);
	      });
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content) {
	          generator.setSourceContent(sourceFile, content);
	        }
	      });
	      return generator;
	    };

	  /**
	   * Add a single mapping from original source line and column to the generated
	   * source's line and column for this source map being created. The mapping
	   * object should have the following properties:
	   *
	   *   - generated: An object with the generated line and column positions.
	   *   - original: An object with the original line and column positions.
	   *   - source: The original source file (relative to the sourceRoot).
	   *   - name: An optional original token name for this mapping.
	   */
	  SourceMapGenerator.prototype.addMapping =
	    function SourceMapGenerator_addMapping(aArgs) {
	      var generated = util.getArg(aArgs, 'generated');
	      var original = util.getArg(aArgs, 'original', null);
	      var source = util.getArg(aArgs, 'source', null);
	      var name = util.getArg(aArgs, 'name', null);

	      this._validateMapping(generated, original, source, name);

	      if (source && !this._sources.has(source)) {
	        this._sources.add(source);
	      }

	      if (name && !this._names.has(name)) {
	        this._names.add(name);
	      }

	      this._mappings.push({
	        generatedLine: generated.line,
	        generatedColumn: generated.column,
	        originalLine: original != null && original.line,
	        originalColumn: original != null && original.column,
	        source: source,
	        name: name
	      });
	    };

	  /**
	   * Set the source content for a source file.
	   */
	  SourceMapGenerator.prototype.setSourceContent =
	    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
	      var source = aSourceFile;
	      if (this._sourceRoot) {
	        source = util.relative(this._sourceRoot, source);
	      }

	      if (aSourceContent !== null) {
	        // Add the source content to the _sourcesContents map.
	        // Create a new _sourcesContents map if the property is null.
	        if (!this._sourcesContents) {
	          this._sourcesContents = {};
	        }
	        this._sourcesContents[util.toSetString(source)] = aSourceContent;
	      } else {
	        // Remove the source file from the _sourcesContents map.
	        // If the _sourcesContents map is empty, set the property to null.
	        delete this._sourcesContents[util.toSetString(source)];
	        if (Object.keys(this._sourcesContents).length === 0) {
	          this._sourcesContents = null;
	        }
	      }
	    };

	  /**
	   * Applies the mappings of a sub-source-map for a specific source file to the
	   * source map being generated. Each mapping to the supplied source file is
	   * rewritten using the supplied source map. Note: The resolution for the
	   * resulting mappings is the minimium of this map and the supplied map.
	   *
	   * @param aSourceMapConsumer The source map to be applied.
	   * @param aSourceFile Optional. The filename of the source file.
	   *        If omitted, SourceMapConsumer's file property will be used.
	   */
	  SourceMapGenerator.prototype.applySourceMap =
	    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile) {
	      // If aSourceFile is omitted, we will use the file property of the SourceMap
	      if (!aSourceFile) {
	        aSourceFile = aSourceMapConsumer.file;
	      }
	      var sourceRoot = this._sourceRoot;
	      // Make "aSourceFile" relative if an absolute Url is passed.
	      if (sourceRoot) {
	        aSourceFile = util.relative(sourceRoot, aSourceFile);
	      }
	      // Applying the SourceMap can add and remove items from the sources and
	      // the names array.
	      var newSources = new ArraySet();
	      var newNames = new ArraySet();

	      // Find mappings for the "aSourceFile"
	      this._mappings.forEach(function (mapping) {
	        if (mapping.source === aSourceFile && mapping.originalLine) {
	          // Check if it can be mapped by the source map, then update the mapping.
	          var original = aSourceMapConsumer.originalPositionFor({
	            line: mapping.originalLine,
	            column: mapping.originalColumn
	          });
	          if (original.source !== null) {
	            // Copy mapping
	            if (sourceRoot) {
	              mapping.source = util.relative(sourceRoot, original.source);
	            } else {
	              mapping.source = original.source;
	            }
	            mapping.originalLine = original.line;
	            mapping.originalColumn = original.column;
	            if (original.name !== null && mapping.name !== null) {
	              // Only use the identifier name if it's an identifier
	              // in both SourceMaps
	              mapping.name = original.name;
	            }
	          }
	        }

	        var source = mapping.source;
	        if (source && !newSources.has(source)) {
	          newSources.add(source);
	        }

	        var name = mapping.name;
	        if (name && !newNames.has(name)) {
	          newNames.add(name);
	        }

	      }, this);
	      this._sources = newSources;
	      this._names = newNames;

	      // Copy sourcesContents of applied map.
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content) {
	          if (sourceRoot) {
	            sourceFile = util.relative(sourceRoot, sourceFile);
	          }
	          this.setSourceContent(sourceFile, content);
	        }
	      }, this);
	    };

	  /**
	   * A mapping can have one of the three levels of data:
	   *
	   *   1. Just the generated position.
	   *   2. The Generated position, original position, and original source.
	   *   3. Generated and original position, original source, as well as a name
	   *      token.
	   *
	   * To maintain consistency, we validate that any new mapping being added falls
	   * in to one of these categories.
	   */
	  SourceMapGenerator.prototype._validateMapping =
	    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
	                                                aName) {
	      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	          && aGenerated.line > 0 && aGenerated.column >= 0
	          && !aOriginal && !aSource && !aName) {
	        // Case 1.
	        return;
	      }
	      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
	               && aGenerated.line > 0 && aGenerated.column >= 0
	               && aOriginal.line > 0 && aOriginal.column >= 0
	               && aSource) {
	        // Cases 2 and 3.
	        return;
	      }
	      else {
	        throw new Error('Invalid mapping: ' + JSON.stringify({
	          generated: aGenerated,
	          source: aSource,
	          orginal: aOriginal,
	          name: aName
	        }));
	      }
	    };

	  /**
	   * Serialize the accumulated mappings in to the stream of base 64 VLQs
	   * specified by the source map format.
	   */
	  SourceMapGenerator.prototype._serializeMappings =
	    function SourceMapGenerator_serializeMappings() {
	      var previousGeneratedColumn = 0;
	      var previousGeneratedLine = 1;
	      var previousOriginalColumn = 0;
	      var previousOriginalLine = 0;
	      var previousName = 0;
	      var previousSource = 0;
	      var result = '';
	      var mapping;

	      // The mappings must be guaranteed to be in sorted order before we start
	      // serializing them or else the generated line numbers (which are defined
	      // via the ';' separators) will be all messed up. Note: it might be more
	      // performant to maintain the sorting as we insert them, rather than as we
	      // serialize them, but the big O is the same either way.
	      this._mappings.sort(util.compareByGeneratedPositions);

	      for (var i = 0, len = this._mappings.length; i < len; i++) {
	        mapping = this._mappings[i];

	        if (mapping.generatedLine !== previousGeneratedLine) {
	          previousGeneratedColumn = 0;
	          while (mapping.generatedLine !== previousGeneratedLine) {
	            result += ';';
	            previousGeneratedLine++;
	          }
	        }
	        else {
	          if (i > 0) {
	            if (!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])) {
	              continue;
	            }
	            result += ',';
	          }
	        }

	        result += base64VLQ.encode(mapping.generatedColumn
	                                   - previousGeneratedColumn);
	        previousGeneratedColumn = mapping.generatedColumn;

	        if (mapping.source) {
	          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
	                                     - previousSource);
	          previousSource = this._sources.indexOf(mapping.source);

	          // lines are stored 0-based in SourceMap spec version 3
	          result += base64VLQ.encode(mapping.originalLine - 1
	                                     - previousOriginalLine);
	          previousOriginalLine = mapping.originalLine - 1;

	          result += base64VLQ.encode(mapping.originalColumn
	                                     - previousOriginalColumn);
	          previousOriginalColumn = mapping.originalColumn;

	          if (mapping.name) {
	            result += base64VLQ.encode(this._names.indexOf(mapping.name)
	                                       - previousName);
	            previousName = this._names.indexOf(mapping.name);
	          }
	        }
	      }

	      return result;
	    };

	  SourceMapGenerator.prototype._generateSourcesContent =
	    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
	      return aSources.map(function (source) {
	        if (!this._sourcesContents) {
	          return null;
	        }
	        if (aSourceRoot) {
	          source = util.relative(aSourceRoot, source);
	        }
	        var key = util.toSetString(source);
	        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
	                                                    key)
	          ? this._sourcesContents[key]
	          : null;
	      }, this);
	    };

	  /**
	   * Externalize the source map.
	   */
	  SourceMapGenerator.prototype.toJSON =
	    function SourceMapGenerator_toJSON() {
	      var map = {
	        version: this._version,
	        file: this._file,
	        sources: this._sources.toArray(),
	        names: this._names.toArray(),
	        mappings: this._serializeMappings()
	      };
	      if (this._sourceRoot) {
	        map.sourceRoot = this._sourceRoot;
	      }
	      if (this._sourcesContents) {
	        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
	      }

	      return map;
	    };

	  /**
	   * Render the source map being generated to a string.
	   */
	  SourceMapGenerator.prototype.toString =
	    function SourceMapGenerator_toString() {
	      return JSON.stringify(this);
	    };

	  exports.SourceMapGenerator = SourceMapGenerator;

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  var util = __webpack_require__(279);
	  var binarySearch = __webpack_require__(281);
	  var ArraySet = __webpack_require__(280).ArraySet;
	  var base64VLQ = __webpack_require__(278);

	  /**
	   * A SourceMapConsumer instance represents a parsed source map which we can
	   * query for information about the original file positions by giving it a file
	   * position in the generated source.
	   *
	   * The only parameter is the raw source map (either as a JSON string, or
	   * already parsed to an object). According to the spec, source maps have the
	   * following attributes:
	   *
	   *   - version: Which version of the source map spec this map is following.
	   *   - sources: An array of URLs to the original source files.
	   *   - names: An array of identifiers which can be referrenced by individual mappings.
	   *   - sourceRoot: Optional. The URL root from which all sources are relative.
	   *   - sourcesContent: Optional. An array of contents of the original source files.
	   *   - mappings: A string of base64 VLQs which contain the actual mappings.
	   *   - file: The generated file this source map is associated with.
	   *
	   * Here is an example source map, taken from the source map spec[0]:
	   *
	   *     {
	   *       version : 3,
	   *       file: "out.js",
	   *       sourceRoot : "",
	   *       sources: ["foo.js", "bar.js"],
	   *       names: ["src", "maps", "are", "fun"],
	   *       mappings: "AA,AB;;ABCDE;"
	   *     }
	   *
	   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
	   */
	  function SourceMapConsumer(aSourceMap) {
	    var sourceMap = aSourceMap;
	    if (typeof aSourceMap === 'string') {
	      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
	    }

	    var version = util.getArg(sourceMap, 'version');
	    var sources = util.getArg(sourceMap, 'sources');
	    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
	    // requires the array) to play nice here.
	    var names = util.getArg(sourceMap, 'names', []);
	    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
	    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
	    var mappings = util.getArg(sourceMap, 'mappings');
	    var file = util.getArg(sourceMap, 'file', null);

	    // Once again, Sass deviates from the spec and supplies the version as a
	    // string rather than a number, so we use loose equality checking here.
	    if (version != this._version) {
	      throw new Error('Unsupported version: ' + version);
	    }

	    // Pass `true` below to allow duplicate names and sources. While source maps
	    // are intended to be compressed and deduplicated, the TypeScript compiler
	    // sometimes generates source maps with duplicates in them. See Github issue
	    // #72 and bugzil.la/889492.
	    this._names = ArraySet.fromArray(names, true);
	    this._sources = ArraySet.fromArray(sources, true);

	    this.sourceRoot = sourceRoot;
	    this.sourcesContent = sourcesContent;
	    this._mappings = mappings;
	    this.file = file;
	  }

	  /**
	   * Create a SourceMapConsumer from a SourceMapGenerator.
	   *
	   * @param SourceMapGenerator aSourceMap
	   *        The source map that will be consumed.
	   * @returns SourceMapConsumer
	   */
	  SourceMapConsumer.fromSourceMap =
	    function SourceMapConsumer_fromSourceMap(aSourceMap) {
	      var smc = Object.create(SourceMapConsumer.prototype);

	      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
	      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
	      smc.sourceRoot = aSourceMap._sourceRoot;
	      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
	                                                              smc.sourceRoot);
	      smc.file = aSourceMap._file;

	      smc.__generatedMappings = aSourceMap._mappings.slice()
	        .sort(util.compareByGeneratedPositions);
	      smc.__originalMappings = aSourceMap._mappings.slice()
	        .sort(util.compareByOriginalPositions);

	      return smc;
	    };

	  /**
	   * The version of the source mapping spec that we are consuming.
	   */
	  SourceMapConsumer.prototype._version = 3;

	  /**
	   * The list of original sources.
	   */
	  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
	    get: function () {
	      return this._sources.toArray().map(function (s) {
	        return this.sourceRoot ? util.join(this.sourceRoot, s) : s;
	      }, this);
	    }
	  });

	  // `__generatedMappings` and `__originalMappings` are arrays that hold the
	  // parsed mapping coordinates from the source map's "mappings" attribute. They
	  // are lazily instantiated, accessed via the `_generatedMappings` and
	  // `_originalMappings` getters respectively, and we only parse the mappings
	  // and create these arrays once queried for a source location. We jump through
	  // these hoops because there can be many thousands of mappings, and parsing
	  // them is expensive, so we only want to do it if we must.
	  //
	  // Each object in the arrays is of the form:
	  //
	  //     {
	  //       generatedLine: The line number in the generated code,
	  //       generatedColumn: The column number in the generated code,
	  //       source: The path to the original source file that generated this
	  //               chunk of code,
	  //       originalLine: The line number in the original source that
	  //                     corresponds to this chunk of generated code,
	  //       originalColumn: The column number in the original source that
	  //                       corresponds to this chunk of generated code,
	  //       name: The name of the original symbol which generated this chunk of
	  //             code.
	  //     }
	  //
	  // All properties except for `generatedLine` and `generatedColumn` can be
	  // `null`.
	  //
	  // `_generatedMappings` is ordered by the generated positions.
	  //
	  // `_originalMappings` is ordered by the original positions.

	  SourceMapConsumer.prototype.__generatedMappings = null;
	  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
	    get: function () {
	      if (!this.__generatedMappings) {
	        this.__generatedMappings = [];
	        this.__originalMappings = [];
	        this._parseMappings(this._mappings, this.sourceRoot);
	      }

	      return this.__generatedMappings;
	    }
	  });

	  SourceMapConsumer.prototype.__originalMappings = null;
	  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
	    get: function () {
	      if (!this.__originalMappings) {
	        this.__generatedMappings = [];
	        this.__originalMappings = [];
	        this._parseMappings(this._mappings, this.sourceRoot);
	      }

	      return this.__originalMappings;
	    }
	  });

	  /**
	   * Parse the mappings in a string in to a data structure which we can easily
	   * query (the ordered arrays in the `this.__generatedMappings` and
	   * `this.__originalMappings` properties).
	   */
	  SourceMapConsumer.prototype._parseMappings =
	    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	      var generatedLine = 1;
	      var previousGeneratedColumn = 0;
	      var previousOriginalLine = 0;
	      var previousOriginalColumn = 0;
	      var previousSource = 0;
	      var previousName = 0;
	      var mappingSeparator = /^[,;]/;
	      var str = aStr;
	      var mapping;
	      var temp;

	      while (str.length > 0) {
	        if (str.charAt(0) === ';') {
	          generatedLine++;
	          str = str.slice(1);
	          previousGeneratedColumn = 0;
	        }
	        else if (str.charAt(0) === ',') {
	          str = str.slice(1);
	        }
	        else {
	          mapping = {};
	          mapping.generatedLine = generatedLine;

	          // Generated column.
	          temp = base64VLQ.decode(str);
	          mapping.generatedColumn = previousGeneratedColumn + temp.value;
	          previousGeneratedColumn = mapping.generatedColumn;
	          str = temp.rest;

	          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
	            // Original source.
	            temp = base64VLQ.decode(str);
	            mapping.source = this._sources.at(previousSource + temp.value);
	            previousSource += temp.value;
	            str = temp.rest;
	            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
	              throw new Error('Found a source, but no line and column');
	            }

	            // Original line.
	            temp = base64VLQ.decode(str);
	            mapping.originalLine = previousOriginalLine + temp.value;
	            previousOriginalLine = mapping.originalLine;
	            // Lines are stored 0-based
	            mapping.originalLine += 1;
	            str = temp.rest;
	            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
	              throw new Error('Found a source and line, but no column');
	            }

	            // Original column.
	            temp = base64VLQ.decode(str);
	            mapping.originalColumn = previousOriginalColumn + temp.value;
	            previousOriginalColumn = mapping.originalColumn;
	            str = temp.rest;

	            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
	              // Original name.
	              temp = base64VLQ.decode(str);
	              mapping.name = this._names.at(previousName + temp.value);
	              previousName += temp.value;
	              str = temp.rest;
	            }
	          }

	          this.__generatedMappings.push(mapping);
	          if (typeof mapping.originalLine === 'number') {
	            this.__originalMappings.push(mapping);
	          }
	        }
	      }

	      this.__originalMappings.sort(util.compareByOriginalPositions);
	    };

	  /**
	   * Find the mapping that best matches the hypothetical "needle" mapping that
	   * we are searching for in the given "haystack" of mappings.
	   */
	  SourceMapConsumer.prototype._findMapping =
	    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
	                                           aColumnName, aComparator) {
	      // To return the position we are searching for, we must first find the
	      // mapping for the given position and then return the opposite position it
	      // points to. Because the mappings are sorted, we can use binary search to
	      // find the best mapping.

	      if (aNeedle[aLineName] <= 0) {
	        throw new TypeError('Line must be greater than or equal to 1, got '
	                            + aNeedle[aLineName]);
	      }
	      if (aNeedle[aColumnName] < 0) {
	        throw new TypeError('Column must be greater than or equal to 0, got '
	                            + aNeedle[aColumnName]);
	      }

	      return binarySearch.search(aNeedle, aMappings, aComparator);
	    };

	  /**
	   * Returns the original source, line, and column information for the generated
	   * source's line and column positions provided. The only argument is an object
	   * with the following properties:
	   *
	   *   - line: The line number in the generated source.
	   *   - column: The column number in the generated source.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - source: The original source file, or null.
	   *   - line: The line number in the original source, or null.
	   *   - column: The column number in the original source, or null.
	   *   - name: The original identifier, or null.
	   */
	  SourceMapConsumer.prototype.originalPositionFor =
	    function SourceMapConsumer_originalPositionFor(aArgs) {
	      var needle = {
	        generatedLine: util.getArg(aArgs, 'line'),
	        generatedColumn: util.getArg(aArgs, 'column')
	      };

	      var mapping = this._findMapping(needle,
	                                      this._generatedMappings,
	                                      "generatedLine",
	                                      "generatedColumn",
	                                      util.compareByGeneratedPositions);

	      if (mapping) {
	        var source = util.getArg(mapping, 'source', null);
	        if (source && this.sourceRoot) {
	          source = util.join(this.sourceRoot, source);
	        }
	        return {
	          source: source,
	          line: util.getArg(mapping, 'originalLine', null),
	          column: util.getArg(mapping, 'originalColumn', null),
	          name: util.getArg(mapping, 'name', null)
	        };
	      }

	      return {
	        source: null,
	        line: null,
	        column: null,
	        name: null
	      };
	    };

	  /**
	   * Returns the original source content. The only argument is the url of the
	   * original source file. Returns null if no original source content is
	   * availible.
	   */
	  SourceMapConsumer.prototype.sourceContentFor =
	    function SourceMapConsumer_sourceContentFor(aSource) {
	      if (!this.sourcesContent) {
	        return null;
	      }

	      if (this.sourceRoot) {
	        aSource = util.relative(this.sourceRoot, aSource);
	      }

	      if (this._sources.has(aSource)) {
	        return this.sourcesContent[this._sources.indexOf(aSource)];
	      }

	      var url;
	      if (this.sourceRoot
	          && (url = util.urlParse(this.sourceRoot))) {
	        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
	        // many users. We can help them out when they expect file:// URIs to
	        // behave like it would if they were running a local HTTP server. See
	        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
	        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
	        if (url.scheme == "file"
	            && this._sources.has(fileUriAbsPath)) {
	          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
	        }

	        if ((!url.path || url.path == "/")
	            && this._sources.has("/" + aSource)) {
	          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
	        }
	      }

	      throw new Error('"' + aSource + '" is not in the SourceMap.');
	    };

	  /**
	   * Returns the generated line and column information for the original source,
	   * line, and column positions provided. The only argument is an object with
	   * the following properties:
	   *
	   *   - source: The filename of the original source.
	   *   - line: The line number in the original source.
	   *   - column: The column number in the original source.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - line: The line number in the generated source, or null.
	   *   - column: The column number in the generated source, or null.
	   */
	  SourceMapConsumer.prototype.generatedPositionFor =
	    function SourceMapConsumer_generatedPositionFor(aArgs) {
	      var needle = {
	        source: util.getArg(aArgs, 'source'),
	        originalLine: util.getArg(aArgs, 'line'),
	        originalColumn: util.getArg(aArgs, 'column')
	      };

	      if (this.sourceRoot) {
	        needle.source = util.relative(this.sourceRoot, needle.source);
	      }

	      var mapping = this._findMapping(needle,
	                                      this._originalMappings,
	                                      "originalLine",
	                                      "originalColumn",
	                                      util.compareByOriginalPositions);

	      if (mapping) {
	        return {
	          line: util.getArg(mapping, 'generatedLine', null),
	          column: util.getArg(mapping, 'generatedColumn', null)
	        };
	      }

	      return {
	        line: null,
	        column: null
	      };
	    };

	  SourceMapConsumer.GENERATED_ORDER = 1;
	  SourceMapConsumer.ORIGINAL_ORDER = 2;

	  /**
	   * Iterate over each mapping between an original source/line/column and a
	   * generated line/column in this source map.
	   *
	   * @param Function aCallback
	   *        The function that is called with each mapping.
	   * @param Object aContext
	   *        Optional. If specified, this object will be the value of `this` every
	   *        time that `aCallback` is called.
	   * @param aOrder
	   *        Either `SourceMapConsumer.GENERATED_ORDER` or
	   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
	   *        iterate over the mappings sorted by the generated file's line/column
	   *        order or the original's source/line/column order, respectively. Defaults to
	   *        `SourceMapConsumer.GENERATED_ORDER`.
	   */
	  SourceMapConsumer.prototype.eachMapping =
	    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
	      var context = aContext || null;
	      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

	      var mappings;
	      switch (order) {
	      case SourceMapConsumer.GENERATED_ORDER:
	        mappings = this._generatedMappings;
	        break;
	      case SourceMapConsumer.ORIGINAL_ORDER:
	        mappings = this._originalMappings;
	        break;
	      default:
	        throw new Error("Unknown order of iteration.");
	      }

	      var sourceRoot = this.sourceRoot;
	      mappings.map(function (mapping) {
	        var source = mapping.source;
	        if (source && sourceRoot) {
	          source = util.join(sourceRoot, source);
	        }
	        return {
	          source: source,
	          generatedLine: mapping.generatedLine,
	          generatedColumn: mapping.generatedColumn,
	          originalLine: mapping.originalLine,
	          originalColumn: mapping.originalColumn,
	          name: mapping.name
	        };
	      }).forEach(aCallback, context);
	    };

	  exports.SourceMapConsumer = SourceMapConsumer;

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 277 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  var SourceMapGenerator = __webpack_require__(275).SourceMapGenerator;
	  var util = __webpack_require__(279);

	  /**
	   * SourceNodes provide a way to abstract over interpolating/concatenating
	   * snippets of generated JavaScript source code while maintaining the line and
	   * column information associated with the original source code.
	   *
	   * @param aLine The original line number.
	   * @param aColumn The original column number.
	   * @param aSource The original source's filename.
	   * @param aChunks Optional. An array of strings which are snippets of
	   *        generated JS, or other SourceNodes.
	   * @param aName The original identifier.
	   */
	  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
	    this.children = [];
	    this.sourceContents = {};
	    this.line = aLine === undefined ? null : aLine;
	    this.column = aColumn === undefined ? null : aColumn;
	    this.source = aSource === undefined ? null : aSource;
	    this.name = aName === undefined ? null : aName;
	    if (aChunks != null) this.add(aChunks);
	  }

	  /**
	   * Creates a SourceNode from generated code and a SourceMapConsumer.
	   *
	   * @param aGeneratedCode The generated code
	   * @param aSourceMapConsumer The SourceMap for the generated code
	   */
	  SourceNode.fromStringWithSourceMap =
	    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer) {
	      // The SourceNode we want to fill with the generated code
	      // and the SourceMap
	      var node = new SourceNode();

	      // The generated code
	      // Processed fragments are removed from this array.
	      var remainingLines = aGeneratedCode.split('\n');

	      // We need to remember the position of "remainingLines"
	      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

	      // The generate SourceNodes we need a code range.
	      // To extract it current and last mapping is used.
	      // Here we store the last mapping.
	      var lastMapping = null;

	      aSourceMapConsumer.eachMapping(function (mapping) {
	        if (lastMapping === null) {
	          // We add the generated code until the first mapping
	          // to the SourceNode without any mapping.
	          // Each line is added as separate string.
	          while (lastGeneratedLine < mapping.generatedLine) {
	            node.add(remainingLines.shift() + "\n");
	            lastGeneratedLine++;
	          }
	          if (lastGeneratedColumn < mapping.generatedColumn) {
	            var nextLine = remainingLines[0];
	            node.add(nextLine.substr(0, mapping.generatedColumn));
	            remainingLines[0] = nextLine.substr(mapping.generatedColumn);
	            lastGeneratedColumn = mapping.generatedColumn;
	          }
	        } else {
	          // We add the code from "lastMapping" to "mapping":
	          // First check if there is a new line in between.
	          if (lastGeneratedLine < mapping.generatedLine) {
	            var code = "";
	            // Associate full lines with "lastMapping"
	            do {
	              code += remainingLines.shift() + "\n";
	              lastGeneratedLine++;
	              lastGeneratedColumn = 0;
	            } while (lastGeneratedLine < mapping.generatedLine);
	            // When we reached the correct line, we add code until we
	            // reach the correct column too.
	            if (lastGeneratedColumn < mapping.generatedColumn) {
	              var nextLine = remainingLines[0];
	              code += nextLine.substr(0, mapping.generatedColumn);
	              remainingLines[0] = nextLine.substr(mapping.generatedColumn);
	              lastGeneratedColumn = mapping.generatedColumn;
	            }
	            // Create the SourceNode.
	            addMappingWithCode(lastMapping, code);
	          } else {
	            // There is no new line in between.
	            // Associate the code between "lastGeneratedColumn" and
	            // "mapping.generatedColumn" with "lastMapping"
	            var nextLine = remainingLines[0];
	            var code = nextLine.substr(0, mapping.generatedColumn -
	                                          lastGeneratedColumn);
	            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
	                                                lastGeneratedColumn);
	            lastGeneratedColumn = mapping.generatedColumn;
	            addMappingWithCode(lastMapping, code);
	          }
	        }
	        lastMapping = mapping;
	      }, this);
	      // We have processed all mappings.
	      // Associate the remaining code in the current line with "lastMapping"
	      // and add the remaining lines without any mapping
	      addMappingWithCode(lastMapping, remainingLines.join("\n"));

	      // Copy sourcesContent into SourceNode
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content) {
	          node.setSourceContent(sourceFile, content);
	        }
	      });

	      return node;

	      function addMappingWithCode(mapping, code) {
	        if (mapping === null || mapping.source === undefined) {
	          node.add(code);
	        } else {
	          node.add(new SourceNode(mapping.originalLine,
	                                  mapping.originalColumn,
	                                  mapping.source,
	                                  code,
	                                  mapping.name));
	        }
	      }
	    };

	  /**
	   * Add a chunk of generated JS to this source node.
	   *
	   * @param aChunk A string snippet of generated JS code, another instance of
	   *        SourceNode, or an array where each member is one of those things.
	   */
	  SourceNode.prototype.add = function SourceNode_add(aChunk) {
	    if (Array.isArray(aChunk)) {
	      aChunk.forEach(function (chunk) {
	        this.add(chunk);
	      }, this);
	    }
	    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
	      if (aChunk) {
	        this.children.push(aChunk);
	      }
	    }
	    else {
	      throw new TypeError(
	        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	      );
	    }
	    return this;
	  };

	  /**
	   * Add a chunk of generated JS to the beginning of this source node.
	   *
	   * @param aChunk A string snippet of generated JS code, another instance of
	   *        SourceNode, or an array where each member is one of those things.
	   */
	  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
	    if (Array.isArray(aChunk)) {
	      for (var i = aChunk.length-1; i >= 0; i--) {
	        this.prepend(aChunk[i]);
	      }
	    }
	    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
	      this.children.unshift(aChunk);
	    }
	    else {
	      throw new TypeError(
	        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	      );
	    }
	    return this;
	  };

	  /**
	   * Walk over the tree of JS snippets in this node and its children. The
	   * walking function is called once for each snippet of JS and is passed that
	   * snippet and the its original associated source's line/column location.
	   *
	   * @param aFn The traversal function.
	   */
	  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
	    var chunk;
	    for (var i = 0, len = this.children.length; i < len; i++) {
	      chunk = this.children[i];
	      if (chunk instanceof SourceNode) {
	        chunk.walk(aFn);
	      }
	      else {
	        if (chunk !== '') {
	          aFn(chunk, { source: this.source,
	                       line: this.line,
	                       column: this.column,
	                       name: this.name });
	        }
	      }
	    }
	  };

	  /**
	   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
	   * each of `this.children`.
	   *
	   * @param aSep The separator.
	   */
	  SourceNode.prototype.join = function SourceNode_join(aSep) {
	    var newChildren;
	    var i;
	    var len = this.children.length;
	    if (len > 0) {
	      newChildren = [];
	      for (i = 0; i < len-1; i++) {
	        newChildren.push(this.children[i]);
	        newChildren.push(aSep);
	      }
	      newChildren.push(this.children[i]);
	      this.children = newChildren;
	    }
	    return this;
	  };

	  /**
	   * Call String.prototype.replace on the very right-most source snippet. Useful
	   * for trimming whitespace from the end of a source node, etc.
	   *
	   * @param aPattern The pattern to replace.
	   * @param aReplacement The thing to replace the pattern with.
	   */
	  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
	    var lastChild = this.children[this.children.length - 1];
	    if (lastChild instanceof SourceNode) {
	      lastChild.replaceRight(aPattern, aReplacement);
	    }
	    else if (typeof lastChild === 'string') {
	      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
	    }
	    else {
	      this.children.push(''.replace(aPattern, aReplacement));
	    }
	    return this;
	  };

	  /**
	   * Set the source content for a source file. This will be added to the SourceMapGenerator
	   * in the sourcesContent field.
	   *
	   * @param aSourceFile The filename of the source file
	   * @param aSourceContent The content of the source file
	   */
	  SourceNode.prototype.setSourceContent =
	    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
	      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
	    };

	  /**
	   * Walk over the tree of SourceNodes. The walking function is called for each
	   * source file content and is passed the filename and source content.
	   *
	   * @param aFn The traversal function.
	   */
	  SourceNode.prototype.walkSourceContents =
	    function SourceNode_walkSourceContents(aFn) {
	      for (var i = 0, len = this.children.length; i < len; i++) {
	        if (this.children[i] instanceof SourceNode) {
	          this.children[i].walkSourceContents(aFn);
	        }
	      }

	      var sources = Object.keys(this.sourceContents);
	      for (var i = 0, len = sources.length; i < len; i++) {
	        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
	      }
	    };

	  /**
	   * Return the string representation of this source node. Walks over the tree
	   * and concatenates all the various snippets together to one string.
	   */
	  SourceNode.prototype.toString = function SourceNode_toString() {
	    var str = "";
	    this.walk(function (chunk) {
	      str += chunk;
	    });
	    return str;
	  };

	  /**
	   * Returns the string representation of this source node along with a source
	   * map.
	   */
	  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
	    var generated = {
	      code: "",
	      line: 1,
	      column: 0
	    };
	    var map = new SourceMapGenerator(aArgs);
	    var sourceMappingActive = false;
	    var lastOriginalSource = null;
	    var lastOriginalLine = null;
	    var lastOriginalColumn = null;
	    var lastOriginalName = null;
	    this.walk(function (chunk, original) {
	      generated.code += chunk;
	      if (original.source !== null
	          && original.line !== null
	          && original.column !== null) {
	        if(lastOriginalSource !== original.source
	           || lastOriginalLine !== original.line
	           || lastOriginalColumn !== original.column
	           || lastOriginalName !== original.name) {
	          map.addMapping({
	            source: original.source,
	            original: {
	              line: original.line,
	              column: original.column
	            },
	            generated: {
	              line: generated.line,
	              column: generated.column
	            },
	            name: original.name
	          });
	        }
	        lastOriginalSource = original.source;
	        lastOriginalLine = original.line;
	        lastOriginalColumn = original.column;
	        lastOriginalName = original.name;
	        sourceMappingActive = true;
	      } else if (sourceMappingActive) {
	        map.addMapping({
	          generated: {
	            line: generated.line,
	            column: generated.column
	          }
	        });
	        lastOriginalSource = null;
	        sourceMappingActive = false;
	      }
	      chunk.split('').forEach(function (ch) {
	        if (ch === '\n') {
	          generated.line++;
	          generated.column = 0;
	        } else {
	          generated.column++;
	        }
	      });
	    });
	    this.walkSourceContents(function (sourceFile, sourceContent) {
	      map.setSourceContent(sourceFile, sourceContent);
	    });

	    return { code: generated.code, map: map };
	  };

	  exports.SourceNode = SourceNode;

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 *
	 * Based on the Base 64 VLQ implementation in Closure Compiler:
	 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
	 *
	 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are
	 * met:
	 *
	 *  * Redistributions of source code must retain the above copyright
	 *    notice, this list of conditions and the following disclaimer.
	 *  * Redistributions in binary form must reproduce the above
	 *    copyright notice, this list of conditions and the following
	 *    disclaimer in the documentation and/or other materials provided
	 *    with the distribution.
	 *  * Neither the name of Google Inc. nor the names of its
	 *    contributors may be used to endorse or promote products derived
	 *    from this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  var base64 = __webpack_require__(282);

	  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
	  // length quantities we use in the source map spec, the first bit is the sign,
	  // the next four bits are the actual value, and the 6th bit is the
	  // continuation bit. The continuation bit tells us whether there are more
	  // digits in this value following this digit.
	  //
	  //   Continuation
	  //   |    Sign
	  //   |    |
	  //   V    V
	  //   101011

	  var VLQ_BASE_SHIFT = 5;

	  // binary: 100000
	  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

	  // binary: 011111
	  var VLQ_BASE_MASK = VLQ_BASE - 1;

	  // binary: 100000
	  var VLQ_CONTINUATION_BIT = VLQ_BASE;

	  /**
	   * Converts from a two-complement value to a value where the sign bit is
	   * is placed in the least significant bit.  For example, as decimals:
	   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
	   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
	   */
	  function toVLQSigned(aValue) {
	    return aValue < 0
	      ? ((-aValue) << 1) + 1
	      : (aValue << 1) + 0;
	  }

	  /**
	   * Converts to a two-complement value from a value where the sign bit is
	   * is placed in the least significant bit.  For example, as decimals:
	   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
	   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
	   */
	  function fromVLQSigned(aValue) {
	    var isNegative = (aValue & 1) === 1;
	    var shifted = aValue >> 1;
	    return isNegative
	      ? -shifted
	      : shifted;
	  }

	  /**
	   * Returns the base 64 VLQ encoded value.
	   */
	  exports.encode = function base64VLQ_encode(aValue) {
	    var encoded = "";
	    var digit;

	    var vlq = toVLQSigned(aValue);

	    do {
	      digit = vlq & VLQ_BASE_MASK;
	      vlq >>>= VLQ_BASE_SHIFT;
	      if (vlq > 0) {
	        // There are still more digits in this value, so we must make sure the
	        // continuation bit is marked.
	        digit |= VLQ_CONTINUATION_BIT;
	      }
	      encoded += base64.encode(digit);
	    } while (vlq > 0);

	    return encoded;
	  };

	  /**
	   * Decodes the next base 64 VLQ value from the given string and returns the
	   * value and the rest of the string.
	   */
	  exports.decode = function base64VLQ_decode(aStr) {
	    var i = 0;
	    var strLen = aStr.length;
	    var result = 0;
	    var shift = 0;
	    var continuation, digit;

	    do {
	      if (i >= strLen) {
	        throw new Error("Expected more digits in base 64 VLQ value.");
	      }
	      digit = base64.decode(aStr.charAt(i++));
	      continuation = !!(digit & VLQ_CONTINUATION_BIT);
	      digit &= VLQ_BASE_MASK;
	      result = result + (digit << shift);
	      shift += VLQ_BASE_SHIFT;
	    } while (continuation);

	    return {
	      value: fromVLQSigned(result),
	      rest: aStr.slice(i)
	    };
	  };

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 279 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  /**
	   * This is a helper function for getting values from parameter/options
	   * objects.
	   *
	   * @param args The object we are extracting values from
	   * @param name The name of the property we are getting.
	   * @param defaultValue An optional value to return if the property is missing
	   * from the object. If this is not specified and the property is missing, an
	   * error will be thrown.
	   */
	  function getArg(aArgs, aName, aDefaultValue) {
	    if (aName in aArgs) {
	      return aArgs[aName];
	    } else if (arguments.length === 3) {
	      return aDefaultValue;
	    } else {
	      throw new Error('"' + aName + '" is a required argument.');
	    }
	  }
	  exports.getArg = getArg;

	  var urlRegexp = /([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;
	  var dataUrlRegexp = /^data:.+\,.+/;

	  function urlParse(aUrl) {
	    var match = aUrl.match(urlRegexp);
	    if (!match) {
	      return null;
	    }
	    return {
	      scheme: match[1],
	      auth: match[3],
	      host: match[4],
	      port: match[6],
	      path: match[7]
	    };
	  }
	  exports.urlParse = urlParse;

	  function urlGenerate(aParsedUrl) {
	    var url = aParsedUrl.scheme + "://";
	    if (aParsedUrl.auth) {
	      url += aParsedUrl.auth + "@"
	    }
	    if (aParsedUrl.host) {
	      url += aParsedUrl.host;
	    }
	    if (aParsedUrl.port) {
	      url += ":" + aParsedUrl.port
	    }
	    if (aParsedUrl.path) {
	      url += aParsedUrl.path;
	    }
	    return url;
	  }
	  exports.urlGenerate = urlGenerate;

	  function join(aRoot, aPath) {
	    var url;

	    if (aPath.match(urlRegexp) || aPath.match(dataUrlRegexp)) {
	      return aPath;
	    }

	    if (aPath.charAt(0) === '/' && (url = urlParse(aRoot))) {
	      url.path = aPath;
	      return urlGenerate(url);
	    }

	    return aRoot.replace(/\/$/, '') + '/' + aPath;
	  }
	  exports.join = join;

	  /**
	   * Because behavior goes wacky when you set `__proto__` on objects, we
	   * have to prefix all the strings in our set with an arbitrary character.
	   *
	   * See https://github.com/mozilla/source-map/pull/31 and
	   * https://github.com/mozilla/source-map/issues/30
	   *
	   * @param String aStr
	   */
	  function toSetString(aStr) {
	    return '$' + aStr;
	  }
	  exports.toSetString = toSetString;

	  function fromSetString(aStr) {
	    return aStr.substr(1);
	  }
	  exports.fromSetString = fromSetString;

	  function relative(aRoot, aPath) {
	    aRoot = aRoot.replace(/\/$/, '');

	    var url = urlParse(aRoot);
	    if (aPath.charAt(0) == "/" && url && url.path == "/") {
	      return aPath.slice(1);
	    }

	    return aPath.indexOf(aRoot + '/') === 0
	      ? aPath.substr(aRoot.length + 1)
	      : aPath;
	  }
	  exports.relative = relative;

	  function strcmp(aStr1, aStr2) {
	    var s1 = aStr1 || "";
	    var s2 = aStr2 || "";
	    return (s1 > s2) - (s1 < s2);
	  }

	  /**
	   * Comparator between two mappings where the original positions are compared.
	   *
	   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	   * mappings with the same original source/line/column, but different generated
	   * line and column the same. Useful when searching for a mapping with a
	   * stubbed out mapping.
	   */
	  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
	    var cmp;

	    cmp = strcmp(mappingA.source, mappingB.source);
	    if (cmp) {
	      return cmp;
	    }

	    cmp = mappingA.originalLine - mappingB.originalLine;
	    if (cmp) {
	      return cmp;
	    }

	    cmp = mappingA.originalColumn - mappingB.originalColumn;
	    if (cmp || onlyCompareOriginal) {
	      return cmp;
	    }

	    cmp = strcmp(mappingA.name, mappingB.name);
	    if (cmp) {
	      return cmp;
	    }

	    cmp = mappingA.generatedLine - mappingB.generatedLine;
	    if (cmp) {
	      return cmp;
	    }

	    return mappingA.generatedColumn - mappingB.generatedColumn;
	  };
	  exports.compareByOriginalPositions = compareByOriginalPositions;

	  /**
	   * Comparator between two mappings where the generated positions are
	   * compared.
	   *
	   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	   * mappings with the same generated line and column, but different
	   * source/name/original line and column the same. Useful when searching for a
	   * mapping with a stubbed out mapping.
	   */
	  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
	    var cmp;

	    cmp = mappingA.generatedLine - mappingB.generatedLine;
	    if (cmp) {
	      return cmp;
	    }

	    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	    if (cmp || onlyCompareGenerated) {
	      return cmp;
	    }

	    cmp = strcmp(mappingA.source, mappingB.source);
	    if (cmp) {
	      return cmp;
	    }

	    cmp = mappingA.originalLine - mappingB.originalLine;
	    if (cmp) {
	      return cmp;
	    }

	    cmp = mappingA.originalColumn - mappingB.originalColumn;
	    if (cmp) {
	      return cmp;
	    }

	    return strcmp(mappingA.name, mappingB.name);
	  };
	  exports.compareByGeneratedPositions = compareByGeneratedPositions;

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  var util = __webpack_require__(279);

	  /**
	   * A data structure which is a combination of an array and a set. Adding a new
	   * member is O(1), testing for membership is O(1), and finding the index of an
	   * element is O(1). Removing elements from the set is not supported. Only
	   * strings are supported for membership.
	   */
	  function ArraySet() {
	    this._array = [];
	    this._set = {};
	  }

	  /**
	   * Static method for creating ArraySet instances from an existing array.
	   */
	  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
	    var set = new ArraySet();
	    for (var i = 0, len = aArray.length; i < len; i++) {
	      set.add(aArray[i], aAllowDuplicates);
	    }
	    return set;
	  };

	  /**
	   * Add the given string to this set.
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
	    var isDuplicate = this.has(aStr);
	    var idx = this._array.length;
	    if (!isDuplicate || aAllowDuplicates) {
	      this._array.push(aStr);
	    }
	    if (!isDuplicate) {
	      this._set[util.toSetString(aStr)] = idx;
	    }
	  };

	  /**
	   * Is the given string a member of this set?
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.has = function ArraySet_has(aStr) {
	    return Object.prototype.hasOwnProperty.call(this._set,
	                                                util.toSetString(aStr));
	  };

	  /**
	   * What is the index of the given string in the array?
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
	    if (this.has(aStr)) {
	      return this._set[util.toSetString(aStr)];
	    }
	    throw new Error('"' + aStr + '" is not in the set.');
	  };

	  /**
	   * What is the element at the given index?
	   *
	   * @param Number aIdx
	   */
	  ArraySet.prototype.at = function ArraySet_at(aIdx) {
	    if (aIdx >= 0 && aIdx < this._array.length) {
	      return this._array[aIdx];
	    }
	    throw new Error('No element indexed by ' + aIdx);
	  };

	  /**
	   * Returns the array representation of this set (which has the proper indices
	   * indicated by indexOf). Note that this is a copy of the internal array used
	   * for storing the members so that no one can mess with internal state.
	   */
	  ArraySet.prototype.toArray = function ArraySet_toArray() {
	    return this._array.slice();
	  };

	  exports.ArraySet = ArraySet;

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 281 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  /**
	   * Recursive implementation of binary search.
	   *
	   * @param aLow Indices here and lower do not contain the needle.
	   * @param aHigh Indices here and higher do not contain the needle.
	   * @param aNeedle The element being searched for.
	   * @param aHaystack The non-empty array being searched.
	   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
	   */
	  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
	    // This function terminates when one of the following is true:
	    //
	    //   1. We find the exact element we are looking for.
	    //
	    //   2. We did not find the exact element, but we can return the next
	    //      closest element that is less than that element.
	    //
	    //   3. We did not find the exact element, and there is no next-closest
	    //      element which is less than the one we are searching for, so we
	    //      return null.
	    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
	    var cmp = aCompare(aNeedle, aHaystack[mid], true);
	    if (cmp === 0) {
	      // Found the element we are looking for.
	      return aHaystack[mid];
	    }
	    else if (cmp > 0) {
	      // aHaystack[mid] is greater than our needle.
	      if (aHigh - mid > 1) {
	        // The element is in the upper half.
	        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
	      }
	      // We did not find an exact match, return the next closest one
	      // (termination case 2).
	      return aHaystack[mid];
	    }
	    else {
	      // aHaystack[mid] is less than our needle.
	      if (mid - aLow > 1) {
	        // The element is in the lower half.
	        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
	      }
	      // The exact needle element was not found in this haystack. Determine if
	      // we are in termination case (2) or (3) and return the appropriate thing.
	      return aLow < 0
	        ? null
	        : aHaystack[aLow];
	    }
	  }

	  /**
	   * This is an implementation of binary search which will always try and return
	   * the next lowest value checked if there is no exact hit. This is because
	   * mappings between original and generated line/col pairs are single points,
	   * and there is an implicit region between each of them, so a miss just means
	   * that you aren't on the very start of a region.
	   *
	   * @param aNeedle The element you are looking for.
	   * @param aHaystack The array that is being searched.
	   * @param aCompare A function which takes the needle and an element in the
	   *     array and returns -1, 0, or 1 depending on whether the needle is less
	   *     than, equal to, or greater than the element, respectively.
	   */
	  exports.search = function search(aNeedle, aHaystack, aCompare) {
	    return aHaystack.length > 0
	      ? recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
	      : null;
	  };

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 282 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	if (false) {
	    var define = require('amdefine')(module, require);
	}
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {

	  var charToIntMap = {};
	  var intToCharMap = {};

	  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	    .split('')
	    .forEach(function (ch, index) {
	      charToIntMap[ch] = index;
	      intToCharMap[index] = ch;
	    });

	  /**
	   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
	   */
	  exports.encode = function base64_encode(aNumber) {
	    if (aNumber in intToCharMap) {
	      return intToCharMap[aNumber];
	    }
	    throw new TypeError("Must be between 0 and 63: " + aNumber);
	  };

	  /**
	   * Decode a single base 64 digit to an integer.
	   */
	  exports.decode = function base64_decode(aChar) {
	    if (aChar in charToIntMap) {
	      return charToIntMap[aChar];
	    }
	    throw new TypeError("Not a valid base 64 digit: " + aChar);
	  };

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }
]);