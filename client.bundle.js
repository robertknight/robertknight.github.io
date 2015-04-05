webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../typings/tsd.d.ts" />
	var react = __webpack_require__(6);
	var react_router = __webpack_require__(10);
	var data_source = __webpack_require__(11);
	var routes = __webpack_require__(12);
	__webpack_require__(9);
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

/***/ 11:
/***/ function(module, exports, __webpack_require__) {

	var react = __webpack_require__(6);
	var components = __webpack_require__(159);
	var scanner = __webpack_require__(160);
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

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var assign = __webpack_require__(3);
	var react = __webpack_require__(6);
	var react_router = __webpack_require__(10);
	var header_view = __webpack_require__(161);
	var post_view = __webpack_require__(162);
	var post_list_view = __webpack_require__(163);
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

/***/ 159:
/***/ function(module, exports, __webpack_require__) {

	var highlights = __webpack_require__(4);
	var marked = __webpack_require__(5);
	var react = __webpack_require__(6);
	var react_tools = __webpack_require__(7);
	function convertMarkdownToReactJs(content) {
	    var markedOptions = {
	        highlight: function (code, lang) {
	            // add the 'hljs' class for use with the current highlights.js
	            // theme
	            var markedUpCode = "<div class=\"hljs\">" + highlights.highlightAuto(code).value + "</div>";
	            // the JSX transform will lose new lines in <pre> blocks,
	            // so we replace these with line-break tags up-front
	            markedUpCode = markedUpCode.replace(/\n/g, '<br/>');
	            return markedUpCode;
	        }
	    };
	    var jsx = marked(content.toString(), markedOptions)
	        .replace(/\n/g, ' ')
	        .replace(/\{/g, '&#123;')
	        .replace(/\}/g, '&#125;')
	        .replace(/class=/g, 'className=');
	    // wrap content in a root tag to make it valid JSX
	    jsx = "<div>" + jsx + "</div>";
	    return "return " + react_tools.transform(jsx);
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

/***/ 160:
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../typings/tsd.d.ts" />
	var path = __webpack_require__(245);
	var js_yaml = __webpack_require__(2);
	function extractSnippet(content) {
	    var idealLength = 400;
	    var snippet = '';
	    var paragraphs = content.split(/\n\s*\n/);
	    var paragraphIndex = 0;
	    while (snippet.length < idealLength && paragraphIndex < paragraphs.length) {
	        if (snippet.length > 0) {
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
	    // extract the front-matter from the top of the page.
	    // This is a section of the form:
	    // 
	    // ---
	    // <YAML config>
	    // ---
	    // 
	    var yamlMatcher = /^\s*---\n([^]*?)---\n/;
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

/***/ 161:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__filename) {var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var react = __webpack_require__(6);
	var react_router = __webpack_require__(10);
	var style = __webpack_require__(8);
	var TEXT_COLOR = '#eee';
	var SOCIAL_LOGO_HEIGHT = 22;
	var LinkF = react.createFactory(react_router.Link);
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
	        return react.DOM.div(style.mixin(theme.topBanner), react.DOM.span(style.mixin(theme.name), LinkF({ to: this.props.rootUrl + '/' }, this.props.name)), react.DOM.span(style.mixin(theme.sectionSeparator)), socialLinks);
	    };
	    return Header;
	})(react.Component);
	exports.Header = Header;
	exports.HeaderF = react.createFactory(Header);

	/* WEBPACK VAR INJECTION */}.call(exports, "views/header.js"))

/***/ },

/***/ 162:
/***/ function(module, exports, __webpack_require__) {

	var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var react = __webpack_require__(6);
	var react_router = __webpack_require__(10);
	var style = __webpack_require__(8);
	var typography = __webpack_require__(222);
	var shared_theme = __webpack_require__(223);
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
	var LinkF = react.createFactory(react_router.Link);
	var Post = (function (_super) {
	    __extends(Post, _super);
	    function Post() {
	        _super.apply(this, arguments);
	    }
	    Post.prototype.render = function () {
	        return react.DOM.div(style.mixin(theme.post), LinkF(style.mixin(theme.post.title, {
	            to: this.props.url
	        }), this.props.title), react.DOM.div(style.mixin(theme.post.date), this.props.date.toDateString()), this.renderTagList(), react.DOM.div(style.mixin(theme.post.content), this.props.children), DisqusCommentListF({ shortName: 'robertknight' }));
	    };
	    Post.prototype.renderTagList = function () {
	        return react.DOM.div(style.mixin(theme.post.tagList), this.props.tags.map(function (tagEntry) {
	            return LinkF(style.mixin(theme.post.tagList.tag, {
	                to: tagEntry.indexUrl,
	                key: "tag-" + tagEntry.tag,
	            }), tagEntry.tag);
	        }));
	    };
	    return Post;
	})(react.Component);
	exports.Post = Post;
	exports.PostF = react.createFactory(Post);


/***/ },

/***/ 163:
/***/ function(module, exports, __webpack_require__) {

	var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	var react = __webpack_require__(6);
	var react_router = __webpack_require__(10);
	var style = __webpack_require__(8);
	var typography = __webpack_require__(222);
	var shared_theme = __webpack_require__(223);
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

/***/ 222:
/***/ function(module, exports, __webpack_require__) {

	var style = __webpack_require__(8);
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

/***/ 223:
/***/ function(module, exports, __webpack_require__) {

	var style = __webpack_require__(8);
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

/***/ 245:
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(224)))

/***/ }

});