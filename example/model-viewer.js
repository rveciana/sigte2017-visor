(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define('d3', ['exports'], factory) :
	(factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var prefix = "$";

function Map() {}

Map.prototype = map.prototype = {
  constructor: Map,
  has: function(key) {
    return (prefix + key) in this;
  },
  get: function(key) {
    return this[prefix + key];
  },
  set: function(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function() {
    var this$1 = this;

    for (var property in this$1) { if (property[0] === prefix) { delete this$1[property]; } }
  },
  keys: function() {
    var this$1 = this;

    var keys = [];
    for (var property in this$1) { if (property[0] === prefix) { keys.push(property.slice(1)); } }
    return keys;
  },
  values: function() {
    var this$1 = this;

    var values = [];
    for (var property in this$1) { if (property[0] === prefix) { values.push(this$1[property]); } }
    return values;
  },
  entries: function() {
    var this$1 = this;

    var entries = [];
    for (var property in this$1) { if (property[0] === prefix) { entries.push({key: property.slice(1), value: this$1[property]}); } }
    return entries;
  },
  size: function() {
    var this$1 = this;

    var size = 0;
    for (var property in this$1) { if (property[0] === prefix) { ++size; } }
    return size;
  },
  empty: function() {
    var this$1 = this;

    for (var property in this$1) { if (property[0] === prefix) { return false; } }
    return true;
  },
  each: function(f) {
    var this$1 = this;

    for (var property in this$1) { if (property[0] === prefix) { f(this$1[property], property.slice(1), this$1); } }
  }
};

function map(object, f) {
  var map = new Map;

  // Copy constructor.
  if (object instanceof Map) { object.each(function(value, key) { map.set(key, value); }); }

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) { while (++i < n) { map.set(i, object[i]); } }
    else { while (++i < n) { map.set(f(o = object[i], i, object), o); } }
  }

  // Convert object to map.
  else if (object) { for (var key in object) { map.set(key, object[key]); } }

  return map;
}

function Set() {}

var proto = map.prototype;

Set.prototype = set.prototype = {
  constructor: Set,
  has: proto.has,
  add: function(value) {
    value += "";
    this[prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function set(object, f) {
  var set = new Set;

  // Copy constructor.
  if (object instanceof Set) { object.each(function(value) { set.add(value); }); }

  // Otherwise, assume it’s an array.
  else if (object) {
    var i = -1, n = object.length;
    if (f == null) { while (++i < n) { set.add(object[i]); } }
    else { while (++i < n) { set.add(f(object[i], i, object)); } }
  }

  return set;
}

var noop = {value: function() {}};

function dispatch() {
  var arguments$1 = arguments;

  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments$1[i] + "") || (t in _)) { throw new Error("illegal type: " + t); }
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) { name = t.slice(i + 1), t = t.slice(0, i); }
    if (t && !types.hasOwnProperty(t)) { throw new Error("unknown type: " + t); }
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) { if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) { return t; } }
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") { throw new Error("invalid callback: " + callback); }
    while (++i < n) {
      if (t = (typename = T[i]).type) { _[t] = set$2(_[t], typename.name, callback); }
      else if (callback == null) { for (t in _) { _[t] = set$2(_[t], typename.name, null); } }
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) { copy[t] = _[t].slice(); }
    return new Dispatch(copy);
  },
  call: function(type, that) {
    var arguments$1 = arguments;

    if ((n = arguments.length - 2) > 0) { for (var args = new Array(n), i = 0, n, t; i < n; ++i) { args[i] = arguments$1[i + 2]; } }
    if (!this._.hasOwnProperty(type)) { throw new Error("unknown type: " + type); }
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) { t[i].value.apply(that, args); }
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) { throw new Error("unknown type: " + type); }
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) { t[i].value.apply(that, args); }
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set$2(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) { type.push({name: name, value: callback}); }
  return type;
}

var request = function(url, callback) {
  var request,
      event = dispatch("beforesend", "progress", "load", "error"),
      mimeType,
      headers = map(),
      xhr = new XMLHttpRequest,
      user = null,
      password = null,
      response,
      responseType,
      timeout = 0;

  // If IE does not support CORS, use XDomainRequest.
  if (typeof XDomainRequest !== "undefined"
      && !("withCredentials" in xhr)
      && /^(http(s)?:)?\/\//.test(url)) { xhr = new XDomainRequest; }

  "onload" in xhr
      ? xhr.onload = xhr.onerror = xhr.ontimeout = respond
      : xhr.onreadystatechange = function(o) { xhr.readyState > 3 && respond(o); };

  function respond(o) {
    var status = xhr.status, result;
    if (!status && hasResponse(xhr)
        || status >= 200 && status < 300
        || status === 304) {
      if (response) {
        try {
          result = response.call(request, xhr);
        } catch (e) {
          event.call("error", request, e);
          return;
        }
      } else {
        result = xhr;
      }
      event.call("load", request, result);
    } else {
      event.call("error", request, o);
    }
  }

  xhr.onprogress = function(e) {
    event.call("progress", request, e);
  };

  request = {
    header: function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) { return headers.get(name); }
      if (value == null) { headers.remove(name); }
      else { headers.set(name, value + ""); }
      return request;
    },

    // If mimeType is non-null and no Accept header is set, a default is used.
    mimeType: function(value) {
      if (!arguments.length) { return mimeType; }
      mimeType = value == null ? null : value + "";
      return request;
    },

    // Specifies what type the response value should take;
    // for instance, arraybuffer, blob, document, or text.
    responseType: function(value) {
      if (!arguments.length) { return responseType; }
      responseType = value;
      return request;
    },

    timeout: function(value) {
      if (!arguments.length) { return timeout; }
      timeout = +value;
      return request;
    },

    user: function(value) {
      return arguments.length < 1 ? user : (user = value == null ? null : value + "", request);
    },

    password: function(value) {
      return arguments.length < 1 ? password : (password = value == null ? null : value + "", request);
    },

    // Specify how to convert the response content to a specific type;
    // changes the callback value on "load" events.
    response: function(value) {
      response = value;
      return request;
    },

    // Alias for send("GET", …).
    get: function(data, callback) {
      return request.send("GET", data, callback);
    },

    // Alias for send("POST", …).
    post: function(data, callback) {
      return request.send("POST", data, callback);
    },

    // If callback is non-null, it will be used for error and load events.
    send: function(method, data, callback) {
      xhr.open(method, url, true, user, password);
      if (mimeType != null && !headers.has("accept")) { headers.set("accept", mimeType + ",*/*"); }
      if (xhr.setRequestHeader) { headers.each(function(value, name) { xhr.setRequestHeader(name, value); }); }
      if (mimeType != null && xhr.overrideMimeType) { xhr.overrideMimeType(mimeType); }
      if (responseType != null) { xhr.responseType = responseType; }
      if (timeout > 0) { xhr.timeout = timeout; }
      if (callback == null && typeof data === "function") { callback = data, data = null; }
      if (callback != null && callback.length === 1) { callback = fixCallback(callback); }
      if (callback != null) { request.on("error", callback).on("load", function(xhr) { callback(null, xhr); }); }
      event.call("beforesend", request, xhr);
      xhr.send(data == null ? null : data);
      return request;
    },

    abort: function() {
      xhr.abort();
      return request;
    },

    on: function() {
      var value = event.on.apply(event, arguments);
      return value === event ? request : value;
    }
  };

  if (callback != null) {
    if (typeof callback !== "function") { throw new Error("invalid callback: " + callback); }
    return request.get(callback);
  }

  return request;
};

function fixCallback(callback) {
  return function(error, xhr) {
    callback(error == null ? xhr : null);
  };
}

function hasResponse(xhr) {
  var type = xhr.responseType;
  return type && type !== "text"
      ? xhr.response // null on error
      : xhr.responseText; // "" on error
}

var type = function(defaultMimeType, response) {
  return function(url, callback) {
    var r = request(url).mimeType(defaultMimeType).response(response);
    if (callback != null) {
      if (typeof callback !== "function") { throw new Error("invalid callback: " + callback); }
      return r.get(callback);
    }
    return r;
  };
};

type("text/html", function(xhr) {
  return document.createRange().createContextualFragment(xhr.responseText);
});

var json = type("application/json", function(xhr) {
  return JSON.parse(xhr.responseText);
});

type("text/plain", function(xhr) {
  return xhr.responseText;
});

type("application/xml", function(xhr) {
  var xml = xhr.responseXML;
  if (!xml) { throw new Error("parse error"); }
  return xml;
});

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function(name, i) {
    return JSON.stringify(name) + ": d[" + i + "]";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function(row, i) {
    return f(object(row), i, columns);
  };
}

// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function(row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

var dsv = function(delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n]"),
      delimiterCode = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert, columns, rows = parseRows(text, function(row, i) {
      if (convert) { return convert(row, i - 1); }
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns;
    return rows;
  }

  function parseRows(text, f) {
    var EOL = {}, // sentinel value for end-of-line
        EOF = {}, // sentinel value for end-of-file
        rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // the current line number
        t, // the current token
        eol; // is the current token followed by EOL?

    function token() {
      if (I >= N) { return EOF; } // special case: end of file
      if (eol) { return eol = false, EOL; } // special case: end of line

      // special case: quotes
      var j = I, c;
      if (text.charCodeAt(j) === 34) {
        var i = j;
        while (i++ < N) {
          if (text.charCodeAt(i) === 34) {
            if (text.charCodeAt(i + 1) !== 34) { break; }
            ++i;
          }
        }
        I = i + 2;
        c = text.charCodeAt(i + 1);
        if (c === 13) {
          eol = true;
          if (text.charCodeAt(i + 2) === 10) { ++I; }
        } else if (c === 10) {
          eol = true;
        }
        return text.slice(j + 1, i).replace(/""/g, "\"");
      }

      // common case: find next delimiter or newline
      while (I < N) {
        var k = 1;
        c = text.charCodeAt(I++);
        if (c === 10) { eol = true; } // \n
        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) { ++I, ++k; } } // \r|\r\n
        else if (c !== delimiterCode) { continue; }
        return text.slice(j, I - k);
      }

      // special case: last token before EOF
      return text.slice(j);
    }

    while ((t = token()) !== EOF) {
      var a = [];
      while (t !== EOL && t !== EOF) {
        a.push(t);
        t = token();
      }
      if (f && (a = f(a, n++)) == null) { continue; }
      rows.push(a);
    }

    return rows;
  }

  function format(rows, columns) {
    if (columns == null) { columns = inferColumns(rows); }
    return [columns.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
      return columns.map(function(column) {
        return formatValue(row[column]);
      }).join(delimiter);
    })).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(text) {
    return text == null ? ""
        : reFormat.test(text += "") ? "\"" + text.replace(/\"/g, "\"\"") + "\""
        : text;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatRows: formatRows
  };
};

var csv$1 = dsv(",");

var csvParse = csv$1.parse;

var tsv = dsv("\t");

var tsvParse = tsv.parse;

var dsv$1 = function(defaultMimeType, parse) {
  return function(url, row, callback) {
    if (arguments.length < 3) { callback = row, row = null; }
    var r = request(url).mimeType(defaultMimeType);
    r.row = function(_) { return arguments.length ? r.response(responseOf(parse, row = _)) : row; };
    r.row(row);
    return callback ? r.get(callback) : r;
  };
};

function responseOf(parse, row) {
  return function(request$$1) {
    return parse(request$$1.responseText, row);
  };
}

dsv$1("text/csv", csvParse);

dsv$1("text/tab-separated-values", tsvParse);

// Adds floating point numbers with twice the normal precision.
// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
// 305–363 (1997).
// Code adapted from GeographicLib by Charles F. F. Karney,
// http://geographiclib.sourceforge.net/

var adder = function() {
  return new Adder;
};

function Adder() {
  this.reset();
}

Adder.prototype = {
  constructor: Adder,
  reset: function() {
    this.s = // rounded value
    this.t = 0; // exact error
  },
  add: function(y) {
    add(temp, y, this.t);
    add(this, temp.s, this.s);
    if (this.s) { this.t += temp.t; }
    else { this.s = temp.t; }
  },
  valueOf: function() {
    return this.s;
  }
};

var temp = new Adder;

function add(adder, a, b) {
  var x = adder.s = a + b,
      bv = x - a,
      av = x - bv;
  adder.t = (a - av) + (b - bv);
}

var epsilon = 1e-6;

var pi = Math.PI;
var halfPi = pi / 2;
var quarterPi = pi / 4;
var tau = pi * 2;

var degrees = 180 / pi;
var radians = pi / 180;

var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;

var exp = Math.exp;

var log = Math.log;
var pow = Math.pow;
var sin = Math.sin;
var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
var sqrt = Math.sqrt;
var tan = Math.tan;

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}

function noop$1() {}

function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}

var streamObjectType = {
  Feature: function(feature, stream) {
    streamGeometry(feature.geometry, stream);
  },
  FeatureCollection: function(object, stream) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) { streamGeometry(features[i].geometry, stream); }
  }
};

var streamGeometryType = {
  Sphere: function(object, stream) {
    stream.sphere();
  },
  Point: function(object, stream) {
    object = object.coordinates;
    stream.point(object[0], object[1], object[2]);
  },
  MultiPoint: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) { object = coordinates[i], stream.point(object[0], object[1], object[2]); }
  },
  LineString: function(object, stream) {
    streamLine(object.coordinates, stream, 0);
  },
  MultiLineString: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) { streamLine(coordinates[i], stream, 0); }
  },
  Polygon: function(object, stream) {
    streamPolygon(object.coordinates, stream);
  },
  MultiPolygon: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) { streamPolygon(coordinates[i], stream); }
  },
  GeometryCollection: function(object, stream) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) { streamGeometry(geometries[i], stream); }
  }
};

function streamLine(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n) { coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]); }
  stream.lineEnd();
}

function streamPolygon(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n) { streamLine(coordinates[i], stream, 1); }
  stream.polygonEnd();
}

var geoStream = function(object, stream) {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream);
  } else {
    streamGeometry(object, stream);
  }
};

var areaRingSum = adder();

var areaSum = adder();
var lambda00;
var phi00;
var lambda0;
var cosPhi0;
var sinPhi0;

function spherical(cartesian) {
  return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
}

function cartesian(spherical) {
  var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}

function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// TODO return a
function cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}

function cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}

// TODO return d
function cartesianNormalizeInPlace(d) {
  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}

var lambda0$1;
var phi0;
var lambda1;
var phi1;
var lambda2;
var lambda00$1;
var phi00$1;
var p0;
var deltaSum = adder();
var ranges;
var range;

var W0;
var X0;
var Y0;
var Z0; // previous point

var compose = function(a, b) {

  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }

  if (a.invert && b.invert) { compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  }; }

  return compose;
};

function rotationIdentity(lambda, phi) {
  return [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
}

rotationIdentity.invert = rotationIdentity;

function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
    : rotationLambda(deltaLambda))
    : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
    : rotationIdentity);
}

function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
  };
}

function rotationLambda(deltaLambda) {
  var rotation = forwardRotationLambda(deltaLambda);
  rotation.invert = forwardRotationLambda(-deltaLambda);
  return rotation;
}

function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos(deltaPhi),
      sinDeltaPhi = sin(deltaPhi),
      cosDeltaGamma = cos(deltaGamma),
      sinDeltaGamma = sin(deltaGamma);

  function rotation(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }

  rotation.invert = function(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };

  return rotation;
}

// Generates a circle centered at [0°, 0°], with a given radius and precision.
function circleStream(stream, radius, delta, direction, t0, t1) {
  if (!delta) { return; }
  var cosRadius = cos(radius),
      sinRadius = sin(radius),
      step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius(cosRadius, t0);
    t1 = circleRadius(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) { t0 += direction * tau; }
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
    stream.point(point[0], point[1]);
  }
}

// Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
function circleRadius(cosRadius, point) {
  point = cartesian(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace(point);
  var radius = acos(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}

var clipBuffer = function() {
  var lines = [],
      line;
  return {
    point: function(x, y) {
      line.push([x, y]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop$1,
    rejoin: function() {
      if (lines.length > 1) { lines.push(lines.pop().concat(lines.shift())); }
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
};

var clipLine = function(a, b, x0, y0, x1, y1) {
  var ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1],
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay,
      r;

  r = x0 - ax;
  if (!dx && r > 0) { return; }
  r /= dx;
  if (dx < 0) {
    if (r < t0) { return; }
    if (r < t1) { t1 = r; }
  } else if (dx > 0) {
    if (r > t1) { return; }
    if (r > t0) { t0 = r; }
  }

  r = x1 - ax;
  if (!dx && r < 0) { return; }
  r /= dx;
  if (dx < 0) {
    if (r > t1) { return; }
    if (r > t0) { t0 = r; }
  } else if (dx > 0) {
    if (r < t0) { return; }
    if (r < t1) { t1 = r; }
  }

  r = y0 - ay;
  if (!dy && r > 0) { return; }
  r /= dy;
  if (dy < 0) {
    if (r < t0) { return; }
    if (r < t1) { t1 = r; }
  } else if (dy > 0) {
    if (r > t1) { return; }
    if (r > t0) { t0 = r; }
  }

  r = y1 - ay;
  if (!dy && r < 0) { return; }
  r /= dy;
  if (dy < 0) {
    if (r > t1) { return; }
    if (r > t0) { t0 = r; }
  } else if (dy > 0) {
    if (r < t0) { return; }
    if (r < t1) { t1 = r; }
  }

  if (t0 > 0) { a[0] = ax + t0 * dx, a[1] = ay + t0 * dy; }
  if (t1 < 1) { b[0] = ax + t1 * dx, b[1] = ay + t1 * dy; }
  return true;
};

var pointEqual = function(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
};

function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other; // another intersection
  this.e = entry; // is an entry?
  this.v = false; // visited
  this.n = this.p = null; // next & previous
}

// A generalized polygon clipping algorithm: given a polygon that has been cut
// into its visible line segments, and rejoins the segments by interpolating
// along the clip edge.
var clipPolygon = function(segments, compareIntersection, startInside, interpolate, stream) {
  var subject = [],
      clip = [],
      i,
      n;

  segments.forEach(function(segment) {
    if ((n = segment.length - 1) <= 0) { return; }
    var n, p0 = segment[0], p1 = segment[n], x;

    // If the first and last points of a segment are coincident, then treat as a
    // closed ring. TODO if all rings are closed, then the winding order of the
    // exterior ring should be checked.
    if (pointEqual(p0, p1)) {
      stream.lineStart();
      for (i = 0; i < n; ++i) { stream.point((p0 = segment[i])[0], p0[1]); }
      stream.lineEnd();
      return;
    }

    subject.push(x = new Intersection(p0, segment, null, true));
    clip.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip.push(x.o = new Intersection(p1, null, x, true));
  });

  if (!subject.length) { return; }

  clip.sort(compareIntersection);
  link(subject);
  link(clip);

  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside;
  }

  var start = subject[0],
      points,
      point;

  while (1) {
    // Find first unvisited intersection.
    var current = start,
        isSubject = true;
    while (current.v) { if ((current = current.n) === start) { return; } }
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) { stream.point((point = points[i])[0], point[1]); }
        } else {
          interpolate(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) { stream.point((point = points[i])[0], point[1]); }
        } else {
          interpolate(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
};

function link(array) {
  if (!(n = array.length)) { return; }
  var n,
      i = 0,
      a = array[0],
      b;
  while (++i < n) {
    a.n = b = array[i];
    b.p = a;
    a = b;
  }
  a.n = b = array[0];
  b.p = a;
}

var ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};

var bisector = function(compare) {
  if (compare.length === 1) { compare = ascendingComparator(compare); }
  return {
    left: function(a, x, lo, hi) {
      if (lo == null) { lo = 0; }
      if (hi == null) { hi = a.length; }
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) { lo = mid + 1; }
        else { hi = mid; }
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (lo == null) { lo = 0; }
      if (hi == null) { hi = a.length; }
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) { hi = mid; }
        else { lo = mid + 1; }
      }
      return lo;
    }
  };
};

function ascendingComparator(f) {
  return function(d, x) {
    return ascending(f(d), x);
  };
}

var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;

var number = function(x) {
  return x === null ? NaN : +x;
};

var extent$1 = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b,
      c;

  if (f == null) {
    while (++i < n) { if ((b = array[i]) != null && b >= b) { a = c = b; break; } }
    while (++i < n) { if ((b = array[i]) != null) {
      if (a > b) { a = b; }
      if (c < b) { c = b; }
    } }
  }

  else {
    while (++i < n) { if ((b = f(array[i], i, array)) != null && b >= b) { a = c = b; break; } }
    while (++i < n) { if ((b = f(array[i], i, array)) != null) {
      if (a > b) { a = b; }
      if (c < b) { c = b; }
    } }
  }

  return [a, c];
};

var identity = function(x) {
  return x;
};

var range$1 = function(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
};

var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);

var ticks = function(start, stop, count) {
  var step = tickStep(start, stop, count);
  return range$1(
    Math.ceil(start / step) * step,
    Math.floor(stop / step) * step + step / 2, // inclusive
    step
  );
};

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) { step1 *= 10; }
  else if (error >= e5) { step1 *= 5; }
  else if (error >= e2) { step1 *= 2; }
  return stop < start ? -step1 : step1;
}

var sturges = function(values) {
  return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
};

var quantile = function(array, p, f) {
  if (f == null) { f = number; }
  if (!(n = array.length)) { return; }
  if ((p = +p) <= 0 || n < 2) { return +f(array[0], 0, array); }
  if (p >= 1) { return +f(array[n - 1], n - 1, array); }
  var n,
      h = (n - 1) * p,
      i = Math.floor(h),
      a = +f(array[i], i, array),
      b = +f(array[i + 1], i + 1, array);
  return a + (b - a) * (h - i);
};

var merge = function(arrays) {
  var n = arrays.length,
      m,
      i = -1,
      j = 0,
      merged,
      array;

  while (++i < n) { j += arrays[i].length; }
  merged = new Array(j);

  while (--n >= 0) {
    array = arrays[n];
    m = array.length;
    while (--m >= 0) {
      merged[--j] = array[m];
    }
  }

  return merged;
};

var min = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;

  if (f == null) {
    while (++i < n) { if ((b = array[i]) != null && b >= b) { a = b; break; } }
    while (++i < n) { if ((b = array[i]) != null && a > b) { a = b; } }
  }

  else {
    while (++i < n) { if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; } }
    while (++i < n) { if ((b = f(array[i], i, array)) != null && a > b) { a = b; } }
  }

  return a;
};

function length(d) {
  return d.length;
}

var clipMax = 1e9;
var clipMin = -clipMax;

// TODO Use d3-polygon’s polygonContains here for the ring check?
// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

function clipExtent(x0, y0, x1, y1) {

  function visible(x, y) {
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  function interpolate(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null
        || (a = corner(from, direction)) !== (a1 = corner(to, direction))
        || comparePoint(from, to) < 0 ^ direction > 0) {
      do { stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0); }
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  function corner(p, direction) {
    return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
        : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
        : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
        : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
  }

  function compareIntersection(a, b) {
    return comparePoint(a.x, b.x);
  }

  function comparePoint(a, b) {
    var ca = corner(a, 1),
        cb = corner(b, 1);
    return ca !== cb ? ca - cb
        : ca === 0 ? b[1] - a[1]
        : ca === 1 ? a[0] - b[0]
        : ca === 2 ? a[1] - b[1]
        : b[0] - a[0];
  }

  return function(stream) {
    var activeStream = stream,
        bufferStream = clipBuffer(),
        segments,
        polygon,
        ring,
        x__, y__, v__, // first point
        x_, y_, v_, // previous point
        first,
        clean;

    var clipStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: polygonStart,
      polygonEnd: polygonEnd
    };

    function point(x, y) {
      if (visible(x, y)) { activeStream.point(x, y); }
    }

    function polygonInside() {
      var winding = 0;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
          if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) { ++winding; } }
          else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) { --winding; } }
        }
      }

      return winding;
    }

    // Buffer geometry within a polygon and then clip it en masse.
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }

    function polygonEnd() {
      var startInside = polygonInside(),
          cleanInside = clean && startInside,
          visible = (segments = merge(segments)).length;
      if (cleanInside || visible) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible) {
          clipPolygon(segments, compareIntersection, startInside, interpolate, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }

    function lineStart() {
      clipStream.point = linePoint;
      if (polygon) { polygon.push(ring = []); }
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }

    // TODO rather than special-case polygons, simply handle them separately.
    // Ideally, coincident intersection points should be jittered to avoid
    // clipping issues.
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_) { bufferStream.rejoin(); }
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_) { activeStream.lineEnd(); }
    }

    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon) { ring.push([x, y]); }
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_) { activeStream.point(x, y); }
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
              b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a, b, x0, y0, x1, y1)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v) { activeStream.lineEnd(); }
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }

    return clipStream;
  };
}

var lengthSum = adder();
var lambda0$2;
var sinPhi0$1;
var cosPhi0$1;

var identity$1 = function(x) {
  return x;
};

var areaSum$1 = adder();
var areaRingSum$1 = adder();
var x00;
var y00;
var x0$1;
var y0$1;

var areaStream$1 = {
  point: noop$1,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: function() {
    areaStream$1.lineStart = areaRingStart$1;
    areaStream$1.lineEnd = areaRingEnd$1;
  },
  polygonEnd: function() {
    areaStream$1.lineStart = areaStream$1.lineEnd = areaStream$1.point = noop$1;
    areaSum$1.add(abs(areaRingSum$1));
    areaRingSum$1.reset();
  },
  result: function() {
    var area = areaSum$1 / 2;
    areaSum$1.reset();
    return area;
  }
};

function areaRingStart$1() {
  areaStream$1.point = areaPointFirst$1;
}

function areaPointFirst$1(x, y) {
  areaStream$1.point = areaPoint$1;
  x00 = x0$1 = x, y00 = y0$1 = y;
}

function areaPoint$1(x, y) {
  areaRingSum$1.add(y0$1 * x - x0$1 * y);
  x0$1 = x, y0$1 = y;
}

function areaRingEnd$1() {
  areaPoint$1(x00, y00);
}

var x0$2 = Infinity;
var y0$2 = x0$2;
var x1 = -x0$2;
var y1 = x1;

var boundsStream$1 = {
  point: boundsPoint$1,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: noop$1,
  polygonEnd: noop$1,
  result: function() {
    var bounds = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds;
  }
};

function boundsPoint$1(x, y) {
  if (x < x0$2) { x0$2 = x; }
  if (x > x1) { x1 = x; }
  if (y < y0$2) { y0$2 = y; }
  if (y > y1) { y1 = y; }
}

// TODO Enforce positive area for exterior, negative area for interior?

var X0$1 = 0;
var Y0$1 = 0;
var Z0$1 = 0;
var X1$1 = 0;
var Y1$1 = 0;
var Z1$1 = 0;
var X2$1 = 0;
var Y2$1 = 0;
var Z2$1 = 0;
var x00$1;
var y00$1;
var x0$3;
var y0$3;

var centroidStream$1 = {
  point: centroidPoint$1,
  lineStart: centroidLineStart$1,
  lineEnd: centroidLineEnd$1,
  polygonStart: function() {
    centroidStream$1.lineStart = centroidRingStart$1;
    centroidStream$1.lineEnd = centroidRingEnd$1;
  },
  polygonEnd: function() {
    centroidStream$1.point = centroidPoint$1;
    centroidStream$1.lineStart = centroidLineStart$1;
    centroidStream$1.lineEnd = centroidLineEnd$1;
  },
  result: function() {
    var centroid = Z2$1 ? [X2$1 / Z2$1, Y2$1 / Z2$1]
        : Z1$1 ? [X1$1 / Z1$1, Y1$1 / Z1$1]
        : Z0$1 ? [X0$1 / Z0$1, Y0$1 / Z0$1]
        : [NaN, NaN];
    X0$1 = Y0$1 = Z0$1 =
    X1$1 = Y1$1 = Z1$1 =
    X2$1 = Y2$1 = Z2$1 = 0;
    return centroid;
  }
};

function centroidPoint$1(x, y) {
  X0$1 += x;
  Y0$1 += y;
  ++Z0$1;
}

function centroidLineStart$1() {
  centroidStream$1.point = centroidPointFirstLine;
}

function centroidPointFirstLine(x, y) {
  centroidStream$1.point = centroidPointLine;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function centroidPointLine(x, y) {
  var dx = x - x0$3, dy = y - y0$3, z = sqrt(dx * dx + dy * dy);
  X1$1 += z * (x0$3 + x) / 2;
  Y1$1 += z * (y0$3 + y) / 2;
  Z1$1 += z;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function centroidLineEnd$1() {
  centroidStream$1.point = centroidPoint$1;
}

function centroidRingStart$1() {
  centroidStream$1.point = centroidPointFirstRing;
}

function centroidRingEnd$1() {
  centroidPointRing(x00$1, y00$1);
}

function centroidPointFirstRing(x, y) {
  centroidStream$1.point = centroidPointRing;
  centroidPoint$1(x00$1 = x0$3 = x, y00$1 = y0$3 = y);
}

function centroidPointRing(x, y) {
  var dx = x - x0$3,
      dy = y - y0$3,
      z = sqrt(dx * dx + dy * dy);

  X1$1 += z * (x0$3 + x) / 2;
  Y1$1 += z * (y0$3 + y) / 2;
  Z1$1 += z;

  z = y0$3 * x - x0$3 * y;
  X2$1 += z * (x0$3 + x);
  Y2$1 += z * (y0$3 + y);
  Z2$1 += z * 3;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function PathContext(context) {
  this._context = context;
}

PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) { this._context.closePath(); }
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop$1
};

var lengthSum$1 = adder();
var lengthRing;
var x00$2;
var y00$2;
var x0$4;
var y0$4;

var lengthStream$1 = {
  point: noop$1,
  lineStart: function() {
    lengthStream$1.point = lengthPointFirst$1;
  },
  lineEnd: function() {
    if (lengthRing) { lengthPoint$1(x00$2, y00$2); }
    lengthStream$1.point = noop$1;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length = +lengthSum$1;
    lengthSum$1.reset();
    return length;
  }
};

function lengthPointFirst$1(x, y) {
  lengthStream$1.point = lengthPoint$1;
  x00$2 = x0$4 = x, y00$2 = y0$4 = y;
}

function lengthPoint$1(x, y) {
  x0$4 -= x, y0$4 -= y;
  lengthSum$1.add(sqrt(x0$4 * x0$4 + y0$4 * y0$4));
  x0$4 = x, y0$4 = y;
}

function PathString() {
  this._string = [];
}

PathString.prototype = {
  _circle: circle$1(4.5),
  pointRadius: function(_) {
    return this._circle = circle$1(_), this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) { this._string.push("Z"); }
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._string.push("M", x, ",", y);
        this._point = 1;
        break;
      }
      case 1: {
        this._string.push("L", x, ",", y);
        break;
      }
      default: {
        this._string.push("M", x, ",", y, this._circle);
        break;
      }
    }
  },
  result: function() {
    if (this._string.length) {
      var result = this._string.join("");
      this._string = [];
      return result;
    }
  }
};

function circle$1(radius) {
  return "m0," + radius
      + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
      + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
      + "z";
}

var geoPath = function(projection, context) {
  var pointRadius = 4.5,
      projectionStream,
      contextStream;

  function path(object) {
    if (object) {
      if (typeof pointRadius === "function") { contextStream.pointRadius(+pointRadius.apply(this, arguments)); }
      geoStream(object, projectionStream(contextStream));
    }
    return contextStream.result();
  }

  path.area = function(object) {
    geoStream(object, projectionStream(areaStream$1));
    return areaStream$1.result();
  };

  path.measure = function(object) {
    geoStream(object, projectionStream(lengthStream$1));
    return lengthStream$1.result();
  };

  path.bounds = function(object) {
    geoStream(object, projectionStream(boundsStream$1));
    return boundsStream$1.result();
  };

  path.centroid = function(object) {
    geoStream(object, projectionStream(centroidStream$1));
    return centroidStream$1.result();
  };

  path.projection = function(_) {
    return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$1) : (projection = _).stream, path) : projection;
  };

  path.context = function(_) {
    if (!arguments.length) { return context; }
    contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
    if (typeof pointRadius !== "function") { contextStream.pointRadius(pointRadius); }
    return path;
  };

  path.pointRadius = function(_) {
    if (!arguments.length) { return pointRadius; }
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };

  return path.projection(projection).context(context);
};

var sum$1 = adder();

var polygonContains = function(polygon, point) {
  var lambda = point[0],
      phi = point[1],
      normal = [sin(lambda), -cos(lambda), 0],
      angle = 0,
      winding = 0;

  sum$1.reset();

  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) { continue; }
    var ring,
        m,
        point0 = ring[m - 1],
        lambda0 = point0[0],
        phi0 = point0[1] / 2 + quarterPi,
        sinPhi0 = sin(phi0),
        cosPhi0 = cos(phi0);

    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j],
          lambda1 = point1[0],
          phi1 = point1[1] / 2 + quarterPi,
          sinPhi1 = sin(phi1),
          cosPhi1 = cos(phi1),
          delta = lambda1 - lambda0,
          sign$$1 = delta >= 0 ? 1 : -1,
          absDelta = sign$$1 * delta,
          antimeridian = absDelta > pi,
          k = sinPhi0 * sinPhi1;

      sum$1.add(atan2(k * sign$$1 * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
      angle += antimeridian ? delta + sign$$1 * tau : delta;

      // Are the longitudes either side of the point’s meridian (lambda),
      // and are the latitudes smaller than the parallel (phi)?
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }

  // First, determine whether the South pole is inside or outside:
  //
  // It is inside if:
  // * the polygon winds around it in a clockwise direction.
  // * the polygon does not (cumulatively) wind around it, but has a negative
  //   (counter-clockwise) area.
  //
  // Second, count the (signed) number of times a segment crosses a lambda
  // from the point to the South pole.  If it is zero, then the point is the
  // same side as the South pole.

  return (angle < -epsilon || angle < epsilon && sum$1 < -epsilon) ^ (winding & 1);
};

var clip = function(pointVisible, clipLine, interpolate, start) {
  return function(rotate, sink) {
    var line = clipLine(sink),
        rotatedStart = rotate.invert(start[0], start[1]),
        ringBuffer = clipBuffer(),
        ringSink = clipLine(ringBuffer),
        polygonStarted = false,
        polygon,
        segments,
        ring;

    var clip = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;
        segments = merge(segments);
        var startInside = polygonContains(polygon, rotatedStart);
        if (segments.length) {
          if (!polygonStarted) { sink.polygonStart(), polygonStarted = true; }
          clipPolygon(segments, compareIntersection, startInside, interpolate, sink);
        } else if (startInside) {
          if (!polygonStarted) { sink.polygonStart(), polygonStarted = true; }
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted) { sink.polygonEnd(), polygonStarted = false; }
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };

    function point(lambda, phi) {
      var point = rotate(lambda, phi);
      if (pointVisible(lambda = point[0], phi = point[1])) { sink.point(lambda, phi); }
    }

    function pointLine(lambda, phi) {
      var point = rotate(lambda, phi);
      line.point(point[0], point[1]);
    }

    function lineStart() {
      clip.point = pointLine;
      line.lineStart();
    }

    function lineEnd() {
      clip.point = point;
      line.lineEnd();
    }

    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      var point = rotate(lambda, phi);
      ringSink.point(point[0], point[1]);
    }

    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();

      var clean = ringSink.clean(),
          ringSegments = ringBuffer.result(),
          i, n = ringSegments.length, m,
          segment,
          point;

      ring.pop();
      polygon.push(ring);
      ring = null;

      if (!n) { return; }

      // No intersections.
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) { sink.polygonStart(), polygonStarted = true; }
          sink.lineStart();
          for (i = 0; i < m; ++i) { sink.point((point = segment[i])[0], point[1]); }
          sink.lineEnd();
        }
        return;
      }

      // Rejoin connected segments.
      // TODO reuse ringBuffer.rejoin()?
      if (n > 1 && clean & 2) { ringSegments.push(ringSegments.pop().concat(ringSegments.shift())); }

      segments.push(ringSegments.filter(validSegment));
    }

    return clip;
  };
};

function validSegment(segment) {
  return segment.length > 1;
}

// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
       - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}

var clipAntimeridian = clip(
  function() { return true; },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi, -halfPi]
);

// Takes a line and cuts into visible segments. Return values: 0 - there were
// intersections or the line was empty; 1 - no intersections; 2 - there were
// intersections, and the first and last segments should be rejoined.
function clipAntimeridianLine(stream) {
  var lambda0 = NaN,
      phi0 = NaN,
      sign0 = NaN,
      clean; // no intersections

  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda1, phi1) {
      var sign1 = lambda1 > 0 ? pi : -pi,
          delta = abs(lambda1 - lambda0);
      if (abs(delta - pi) < epsilon) { // line crosses a pole
        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        stream.point(lambda1, phi0);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
        if (abs(lambda0 - sign0) < epsilon) { lambda0 -= sign0 * epsilon; } // handle degeneracies
        if (abs(lambda1 - sign1) < epsilon) { lambda1 -= sign1 * epsilon; }
        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        clean = 0;
      }
      stream.point(lambda0 = lambda1, phi0 = phi1);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda0 = phi0 = NaN;
    },
    clean: function() {
      return 2 - clean; // if intersections, rejoin first and last segments
    }
  };
}

function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
  var cosPhi0,
      cosPhi1,
      sinLambda0Lambda1 = sin(lambda0 - lambda1);
  return abs(sinLambda0Lambda1) > epsilon
      ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
          - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
          / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
      : (phi0 + phi1) / 2;
}

function clipAntimeridianInterpolate(from, to, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * halfPi;
    stream.point(-pi, phi);
    stream.point(0, phi);
    stream.point(pi, phi);
    stream.point(pi, 0);
    stream.point(pi, -phi);
    stream.point(0, -phi);
    stream.point(-pi, -phi);
    stream.point(-pi, 0);
    stream.point(-pi, phi);
  } else if (abs(from[0] - to[0]) > epsilon) {
    var lambda = from[0] < to[0] ? pi : -pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}

var clipCircle = function(radius, delta) {
  var cr = cos(radius),
      smallRadius = cr > 0,
      notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

  function interpolate(from, to, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to);
  }

  function visible(lambda, phi) {
    return cos(lambda) * cos(phi) > cr;
  }

  // Takes a line and cuts into visible segments. Return values used for polygon
  // clipping: 0 - there were intersections or the line was empty; 1 - no
  // intersections 2 - there were intersections, and the first and last segments
  // should be rejoined.
  function clipLine(stream) {
    var point0, // previous point
        c0, // code for previous point
        v0, // visibility of previous point
        v00, // visibility of first point
        clean; // no intersections
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi],
            point2,
            v = visible(lambda, phi),
            c = smallRadius
              ? v ? 0 : code(lambda, phi)
              : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v)) { stream.lineStart(); }
        // Handle degeneracies.
        // TODO ignore if not clipping polygons.
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (pointEqual(point0, point2) || pointEqual(point1, point2)) {
            point1[0] += epsilon;
            point1[1] += epsilon;
            v = visible(point1[0], point1[1]);
          }
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            // outside going in
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            // inside going out
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1]);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          // If the codes for two points are different, or are both zero,
          // and there this segment intersects with the small circle.
          if (!(c & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c;
      },
      lineEnd: function() {
        if (v0) { stream.lineEnd(); }
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | ((v00 && v0) << 1);
      }
    };
  }

  // Intersects the great circle between a and b with the clip circle.
  function intersect(a, b, two) {
    var pa = cartesian(a),
        pb = cartesian(b);

    // We have two planes, n1.p = d1 and n2.p = d2.
    // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
    var n1 = [1, 0, 0], // normal
        n2 = cartesianCross(pa, pb),
        n2n2 = cartesianDot(n2, n2),
        n1n2 = n2[0], // cartesianDot(n1, n2),
        determinant = n2n2 - n1n2 * n1n2;

    // Two polar points.
    if (!determinant) { return !two && a; }

    var c1 =  cr * n2n2 / determinant,
        c2 = -cr * n1n2 / determinant,
        n1xn2 = cartesianCross(n1, n2),
        A = cartesianScale(n1, c1),
        B = cartesianScale(n2, c2);
    cartesianAddInPlace(A, B);

    // Solve |p(t)|^2 = 1.
    var u = n1xn2,
        w = cartesianDot(A, u),
        uu = cartesianDot(u, u),
        t2 = w * w - uu * (cartesianDot(A, A) - 1);

    if (t2 < 0) { return; }

    var t = sqrt(t2),
        q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A);
    q = spherical(q);

    if (!two) { return q; }

    // Two intersection points.
    var lambda0 = a[0],
        lambda1 = b[0],
        phi0 = a[1],
        phi1 = b[1],
        z;

    if (lambda1 < lambda0) { z = lambda0, lambda0 = lambda1, lambda1 = z; }

    var delta = lambda1 - lambda0,
        polar = abs(delta - pi) < epsilon,
        meridian = polar || delta < epsilon;

    if (!polar && phi1 < phi0) { z = phi0, phi0 = phi1, phi1 = z; }

    // Check that the first point is between a and b.
    if (meridian
        ? polar
          ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
          : phi0 <= q[1] && q[1] <= phi1
        : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A);
      return [q, spherical(q1)];
    }
  }

  // Generates a 4-bit vector representing the location of a point relative to
  // the small circle's bounding box.
  function code(lambda, phi) {
    var r = smallRadius ? radius : pi - radius,
        code = 0;
    if (lambda < -r) { code |= 1; } // left
    else if (lambda > r) { code |= 2; } // right
    if (phi < -r) { code |= 4; } // below
    else if (phi > r) { code |= 8; } // above
    return code;
  }

  return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
};

function transformer(methods) {
  return function(stream) {
    var s = new TransformStream;
    for (var key in methods) { s[key] = methods[key]; }
    s.stream = stream;
    return s;
  };
}

function TransformStream() {}

TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) { this.stream.point(x, y); },
  sphere: function() { this.stream.sphere(); },
  lineStart: function() { this.stream.lineStart(); },
  lineEnd: function() { this.stream.lineEnd(); },
  polygonStart: function() { this.stream.polygonStart(); },
  polygonEnd: function() { this.stream.polygonEnd(); }
};

function fitExtent(projection, extent, object) {
  var w = extent[1][0] - extent[0][0],
      h = extent[1][1] - extent[0][1],
      clip = projection.clipExtent && projection.clipExtent();

  projection
      .scale(150)
      .translate([0, 0]);

  if (clip != null) { projection.clipExtent(null); }

  geoStream(object, projection.stream(boundsStream$1));

  var b = boundsStream$1.result(),
      k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
      x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
      y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;

  if (clip != null) { projection.clipExtent(clip); }

  return projection
      .scale(k * 150)
      .translate([x, y]);
}

function fitSize(projection, size, object) {
  return fitExtent(projection, [[0, 0], size], object);
}

var maxDepth = 16;
var cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

var resample = function(project, delta2) {
  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
};

function resampleNone(project) {
  return transformer({
    point: function(x, y) {
      x = project(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}

function resample$1(project, delta2) {

  function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
    var dx = x1 - x0,
        dy = y1 - y0,
        d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1,
          b = b0 + b1,
          c = c0 + c1,
          m = sqrt(a * a + b * b + c * c),
          phi2 = asin(c /= m),
          lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
          p = project(lambda2, phi2),
          x2 = p[0],
          y2 = p[1],
          dx2 = x2 - x0,
          dy2 = y2 - y0,
          dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 // perpendicular projected distance
          || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
          || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda00, x00, y00, a00, b00, c00, // first point
        lambda0, x0, y0, a0, b0, c0; // previous point

    var resampleStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
      polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
    };

    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }

    function lineStart() {
      x0 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }

    function linePoint(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x0, y0);
    }

    function lineEnd() {
      resampleStream.point = point;
      stream.lineEnd();
    }

    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }

    function ringPoint(lambda, phi) {
      linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
    }

    function ringEnd() {
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }

    return resampleStream;
  };
}

var transformRadians = transformer({
  point: function(x, y) {
    this.stream.point(x * radians, y * radians);
  }
});

function projection(project) {
  return projectionMutator(function() { return project; })();
}

function projectionMutator(projectAt) {
  var project,
      k = 150, // scale
      x = 480, y = 250, // translate
      dx, dy, lambda = 0, phi = 0, // center
      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, projectRotate, // rotate
      theta = null, preclip = clipAntimeridian, // clip angle
      x0 = null, y0, x1, y1, postclip = identity$1, // clip extent
      delta2 = 0.5, projectResample = resample(projectTransform, delta2), // precision
      cache,
      cacheStream;

  function projection(point) {
    point = projectRotate(point[0] * radians, point[1] * radians);
    return [point[0] * k + dx, dy - point[1] * k];
  }

  function invert(point) {
    point = projectRotate.invert((point[0] - dx) / k, (dy - point[1]) / k);
    return point && [point[0] * degrees, point[1] * degrees];
  }

  function projectTransform(x, y) {
    return x = project(x, y), [x[0] * k + dx, dy - x[1] * k];
  }

  projection.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(preclip(rotate, projectResample(postclip(cacheStream = stream))));
  };

  projection.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians, 6 * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
  };

  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$1) : clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };

  projection.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };

  projection.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };

  projection.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
  };

  projection.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };

  projection.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };

  projection.fitExtent = function(extent, object) {
    return fitExtent(projection, extent, object);
  };

  projection.fitSize = function(size, object) {
    return fitSize(projection, size, object);
  };

  function recenter() {
    projectRotate = compose(rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma), project);
    var center = project(lambda, phi);
    dx = x - center[0] * k;
    dy = y + center[1] * k;
    return reset();
  }

  function reset() {
    cache = cacheStream = null;
    return projection;
  }

  return function() {
    project = projectAt.apply(this, arguments);
    projection.invert = project.invert && invert;
    return recenter();
  };
}

function conicProjection(projectAt) {
  var phi0 = 0,
      phi1 = pi / 3,
      m = projectionMutator(projectAt),
      p = m(phi0, phi1);

  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
  };

  return p;
}

// A composite projection for the United States, configured by default for
// 960×500. The projection also works quite well at 960×600 if you change the
// scale to 1285 and adjust the translate accordingly. The set of standard
// parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers

function azimuthalRaw(scale) {
  return function(x, y) {
    var cx = cos(x),
        cy = cos(y),
        k = scale(cx * cy);
    return [
      k * cy * sin(x),
      k * sin(y)
    ];
  }
}

function azimuthalInvert(angle) {
  return function(x, y) {
    var z = sqrt(x * x + y * y),
        c = angle(z),
        sc = sin(c),
        cc = cos(c);
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ];
  }
}

var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt(2 / (1 + cxcy));
});

azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * asin(z / 2);
});

var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
  return (c = acos(c)) && c / sin(c);
});

azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});

function mercatorRaw(lambda, phi) {
  return [lambda, log(tan((halfPi + phi) / 2))];
}

mercatorRaw.invert = function(x, y) {
  return [x, 2 * atan(exp(y)) - halfPi];
};

var geoMercator = function() {
  return mercatorProjection(mercatorRaw)
      .scale(961 / tau);
};

function mercatorProjection(project) {
  var m = projection(project),
      scale = m.scale,
      translate = m.translate,
      clipExtent = m.clipExtent,
      clipAuto;

  m.scale = function(_) {
    return arguments.length ? (scale(_), clipAuto && m.clipExtent(null), m) : scale();
  };

  m.translate = function(_) {
    return arguments.length ? (translate(_), clipAuto && m.clipExtent(null), m) : translate();
  };

  m.clipExtent = function(_) {
    if (!arguments.length) { return clipAuto ? null : clipExtent(); }
    if (clipAuto = _ == null) {
      var k = pi * scale(),
          t = translate();
      _ = [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]];
    }
    clipExtent(_);
    return m;
  };

  return m.clipExtent(null);
}

function tany(y) {
  return tan((halfPi + y) / 2);
}

function conicConformalRaw(y0, y1) {
  var cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
      f = cy0 * pow(tany(y0), n) / n;

  if (!n) { return mercatorRaw; }

  function project(x, y) {
    if (f > 0) { if (y < -halfPi + epsilon) { y = -halfPi + epsilon; } }
    else { if (y > halfPi - epsilon) { y = halfPi - epsilon; } }
    var r = f / pow(tany(y), n);
    return [r * sin(n * x), f - r * cos(n * x)];
  }

  project.invert = function(x, y) {
    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy);
    return [atan2(x, abs(fy)) / n * sign(fy), 2 * atan(pow(f / r, 1 / n)) - halfPi];
  };

  return project;
}

var geoConicConformal = function() {
  return conicProjection(conicConformalRaw)
      .scale(109.5)
      .parallels([30, 30]);
};

var xhtml = "http://www.w3.org/1999/xhtml";

var namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

var namespace = function(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") { name = name.slice(i + 1); }
  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
};

function creatorInherit(name) {
  return function() {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml
        ? document.createElement(name)
        : document.createElementNS(uri, name);
  };
}

function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}

var creator = function(name) {
  var fullname = namespace(name);
  return (fullname.local
      ? creatorFixed
      : creatorInherit)(fullname);
};

var matcher = function(selector) {
  return function() {
    return this.matches(selector);
  };
};

if (typeof document !== "undefined") {
  var element = document.documentElement;
  if (!element.matches) {
    var vendorMatches = element.webkitMatchesSelector
        || element.msMatchesSelector
        || element.mozMatchesSelector
        || element.oMatchesSelector;
    matcher = function(selector) {
      return function() {
        return vendorMatches.call(this, selector);
      };
    };
  }
}

var matcher$1 = matcher;

var filterEvents = {};

var event = null;

if (typeof document !== "undefined") {
  var element$1 = document.documentElement;
  if (!("onmouseenter" in element$1)) {
    filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
  }
}

function filterContextListener(listener, index, group) {
  listener = contextListener(listener, index, group);
  return function(event) {
    var related = event.relatedTarget;
    if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
      listener.call(this, event);
    }
  };
}

function contextListener(listener, index, group) {
  return function(event1) {
    var event0 = event; // Events can be reentrant (e.g., focus).
    event = event1;
    try {
      listener.call(this, this.__data__, index, group);
    } finally {
      event = event0;
    }
  };
}

function parseTypenames$1(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) { name = t.slice(i + 1), t = t.slice(0, i); }
    return {type: t, name: name};
  });
}

function onRemove(typename) {
  return function() {
    var this$1 = this;

    var on = this.__on;
    if (!on) { return; }
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this$1.removeEventListener(o.type, o.listener, o.capture);
      } else {
        on[++i] = o;
      }
    }
    if (++i) { on.length = i; }
    else { delete this.__on; }
  };
}

function onAdd(typename, value, capture) {
  var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
  return function(d, i, group) {
    var this$1 = this;

    var on = this.__on, o, listener = wrap(value, i, group);
    if (on) { for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this$1.removeEventListener(o.type, o.listener, o.capture);
        this$1.addEventListener(o.type, o.listener = listener, o.capture = capture);
        o.value = value;
        return;
      }
    } }
    this.addEventListener(typename.type, listener, capture);
    o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
    if (!on) { this.__on = [o]; }
    else { on.push(o); }
  };
}

var selection_on = function(typename, value, capture) {
  var this$1 = this;

  var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) { for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    } }
    return;
  }

  on = value ? onAdd : onRemove;
  if (capture == null) { capture = false; }
  for (i = 0; i < n; ++i) { this$1.each(on(typenames[i], value, capture)); }
  return this;
};

function customEvent(event1, listener, that, args) {
  var event0 = event;
  event1.sourceEvent = event;
  event = event1;
  try {
    return listener.apply(that, args);
  } finally {
    event = event0;
  }
}

var sourceEvent = function() {
  var current = event, source;
  while (source = current.sourceEvent) { current = source; }
  return current;
};

var point = function(node, event) {
  var svg = node.ownerSVGElement || node;

  if (svg.createSVGPoint) {
    var point = svg.createSVGPoint();
    point.x = event.clientX, point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    return [point.x, point.y];
  }

  var rect = node.getBoundingClientRect();
  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
};

var mouse = function(node) {
  var event = sourceEvent();
  if (event.changedTouches) { event = event.changedTouches[0]; }
  return point(node, event);
};

function none() {}

var selector = function(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
};

var selection_select = function(select) {
  if (typeof select !== "function") { select = selector(select); }

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) { subnode.__data__ = node.__data__; }
        subgroup[i] = subnode;
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

function empty() {
  return [];
}

var selectorAll = function(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
};

var selection_selectAll = function(select) {
  if (typeof select !== "function") { select = selectorAll(select); }

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new Selection(subgroups, parents);
};

var selection_filter = function(match) {
  if (typeof match !== "function") { match = matcher$1(match); }

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

var sparse = function(update) {
  return new Array(update.length);
};

var selection_enter = function() {
  return new Selection(this._enter || this._groups.map(sparse), this._parents);
};

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
  querySelector: function(selector) { return this._parent.querySelector(selector); },
  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
};

var constant$2 = function(x) {
  return function() {
    return x;
  };
};

var keyPrefix = "$"; // Protect against keys like “__proto__”.

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}

function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
      node,
      nodeByKeyValue = {},
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
      if (keyValue in nodeByKeyValue) {
        exit[i] = node;
      } else {
        nodeByKeyValue[keyValue] = node;
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = keyPrefix + key.call(parent, data[i], i, data);
    if (node = nodeByKeyValue[keyValue]) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue[keyValue] = null;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
      exit[i] = node;
    }
  }
}

var selection_data = function(value, key) {
  if (!value) {
    data = new Array(this.size()), j = -1;
    this.each(function(d) { data[++j] = d; });
    return data;
  }

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") { value = constant$2(value); }

  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = value.call(parent, parent && parent.__data__, j, parents),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);

    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) { i1 = i0 + 1; }
        while (!(next = updateGroup[i1]) && ++i1 < dataLength){  }
        previous._next = next || null;
      }
    }
  }

  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
};

var selection_exit = function() {
  return new Selection(this._exit || this._groups.map(sparse), this._parents);
};

var selection_merge = function(selection) {

  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Selection(merges, this._parents);
};

var selection_order = function() {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && next !== node.nextSibling) { next.parentNode.insertBefore(node, next); }
        next = node;
      }
    }
  }

  return this;
};

var selection_sort = function(compare) {
  if (!compare) { compare = ascending$1; }

  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }

  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }

  return new Selection(sortgroups, this._parents).order();
};

function ascending$1(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

var selection_call = function() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
};

var selection_nodes = function() {
  var nodes = new Array(this.size()), i = -1;
  this.each(function() { nodes[++i] = this; });
  return nodes;
};

var selection_node = function() {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) { return node; }
    }
  }

  return null;
};

var selection_size = function() {
  var size = 0;
  this.each(function() { ++size; });
  return size;
};

var selection_empty = function() {
  return !this.node();
};

var selection_each = function(callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) { callback.call(node, node.__data__, i, group); }
    }
  }

  return this;
};

function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}

function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) { this.removeAttribute(name); }
    else { this.setAttribute(name, v); }
  };
}

function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) { this.removeAttributeNS(fullname.space, fullname.local); }
    else { this.setAttributeNS(fullname.space, fullname.local, v); }
  };
}

var selection_attr = function(name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname);
  }

  return this.each((value == null
      ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)
      : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
};

var window$1 = function(node) {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
      || (node.document && node) // node is a Window
      || node.defaultView; // node is a Document
};

function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) { this.style.removeProperty(name); }
    else { this.style.setProperty(name, v, priority); }
  };
}

var selection_style = function(name, value, priority) {
  var node;
  return arguments.length > 1
      ? this.each((value == null
            ? styleRemove : typeof value === "function"
            ? styleFunction
            : styleConstant)(name, value, priority == null ? "" : priority))
      : window$1(node = this.node())
          .getComputedStyle(node, null)
          .getPropertyValue(name);
};

function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}

function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}

function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) { delete this[name]; }
    else { this[name] = v; }
  };
}

var selection_property = function(name, value) {
  return arguments.length > 1
      ? this.each((value == null
          ? propertyRemove : typeof value === "function"
          ? propertyFunction
          : propertyConstant)(name, value))
      : this.node()[name];
};

function classArray(string) {
  return string.trim().split(/^|\s+/);
}

function classList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}

ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};

function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) { list.add(names[i]); }
}

function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) { list.remove(names[i]); }
}

function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}

function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}

function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}

var selection_classed = function(name, value) {
  var names = classArray(name + "");

  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) { if (!list.contains(names[i])) { return false; } }
    return true;
  }

  return this.each((typeof value === "function"
      ? classedFunction : value
      ? classedTrue
      : classedFalse)(names, value));
};

function textRemove() {
  this.textContent = "";
}

function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

var selection_text = function(value) {
  return arguments.length
      ? this.each(value == null
          ? textRemove : (typeof value === "function"
          ? textFunction
          : textConstant)(value))
      : this.node().textContent;
};

function htmlRemove() {
  this.innerHTML = "";
}

function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}

function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}

var selection_html = function(value) {
  return arguments.length
      ? this.each(value == null
          ? htmlRemove : (typeof value === "function"
          ? htmlFunction
          : htmlConstant)(value))
      : this.node().innerHTML;
};

function raise() {
  if (this.nextSibling) { this.parentNode.appendChild(this); }
}

var selection_raise = function() {
  return this.each(raise);
};

function lower() {
  if (this.previousSibling) { this.parentNode.insertBefore(this, this.parentNode.firstChild); }
}

var selection_lower = function() {
  return this.each(lower);
};

var selection_append = function(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
};

function constantNull() {
  return null;
}

var selection_insert = function(name, before) {
  var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
};

function remove() {
  var parent = this.parentNode;
  if (parent) { parent.removeChild(this); }
}

var selection_remove = function() {
  return this.each(remove);
};

var selection_datum = function(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.node().__data__;
};

function dispatchEvent(node, type, params) {
  var window = window$1(node),
      event = window.CustomEvent;

  if (event) {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) { event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail; }
    else { event.initEvent(type, false, false); }
  }

  node.dispatchEvent(event);
}

function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}

function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}

var selection_dispatch = function(type, params) {
  return this.each((typeof params === "function"
      ? dispatchFunction
      : dispatchConstant)(type, params));
};

var root = [null];

function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new Selection([[document.documentElement]], root);
}

Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: selection_select,
  selectAll: selection_selectAll,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  merge: selection_merge,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch
};

var select = function(selector) {
  return typeof selector === "string"
      ? new Selection([[document.querySelector(selector)]], [document.documentElement])
      : new Selection([[selector]], root);
};

var touch = function(node, touches, identifier) {
  if (arguments.length < 3) { identifier = touches, touches = sourceEvent().changedTouches; }

  for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
    if ((touch = touches[i]).identifier === identifier) {
      return point(node, touch);
    }
  }

  return null;
};

function nopropagation() {
  event.stopImmediatePropagation();
}

var noevent = function() {
  event.preventDefault();
  event.stopImmediatePropagation();
};

var nodrag = function(view) {
  var root = view.document.documentElement,
      selection$$1 = select(view).on("dragstart.drag", noevent, true);
  if ("onselectstart" in root) {
    selection$$1.on("selectstart.drag", noevent, true);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
};

function yesdrag(view, noclick) {
  var root = view.document.documentElement,
      selection$$1 = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection$$1.on("click.drag", noevent, true);
    setTimeout(function() { selection$$1.on("click.drag", null); }, 0);
  }
  if ("onselectstart" in root) {
    selection$$1.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}

var constant$3 = function(x) {
  return function() {
    return x;
  };
};

function DragEvent(target, type, subject, id, active, x, y, dx, dy, dispatch) {
  this.target = target;
  this.type = type;
  this.subject = subject;
  this.identifier = id;
  this.active = active;
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this._ = dispatch;
}

DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};

// Ignore right-click, since that should open the context menu.
function defaultFilter() {
  return !event.button;
}

function defaultContainer() {
  return this.parentNode;
}

function defaultSubject(d) {
  return d == null ? {x: event.x, y: event.y} : d;
}

var drag = function() {
  var filter = defaultFilter,
      container = defaultContainer,
      subject = defaultSubject,
      gestures = {},
      listeners = dispatch("start", "drag", "end"),
      active = 0,
      mousemoving,
      touchending;

  function drag(selection$$1) {
    selection$$1
        .on("mousedown.drag", mousedowned)
        .on("touchstart.drag", touchstarted)
        .on("touchmove.drag", touchmoved)
        .on("touchend.drag touchcancel.drag", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function mousedowned() {
    if (touchending || !filter.apply(this, arguments)) { return; }
    var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
    if (!gesture) { return; }
    select(event.view).on("mousemove.drag", mousemoved, true).on("mouseup.drag", mouseupped, true);
    nodrag(event.view);
    nopropagation();
    mousemoving = false;
    gesture("start");
  }

  function mousemoved() {
    noevent();
    mousemoving = true;
    gestures.mouse("drag");
  }

  function mouseupped() {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent();
    gestures.mouse("end");
  }

  function touchstarted() {
    var arguments$1 = arguments;
    var this$1 = this;

    if (!filter.apply(this, arguments)) { return; }
    var touches$$1 = event.changedTouches,
        c = container.apply(this, arguments),
        n = touches$$1.length, i, gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(touches$$1[i].identifier, c, touch, this$1, arguments$1)) {
        nopropagation();
        gesture("start");
      }
    }
  }

  function touchmoved() {
    var touches$$1 = event.changedTouches,
        n = touches$$1.length, i, gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches$$1[i].identifier]) {
        noevent();
        gesture("drag");
      }
    }
  }

  function touchended() {
    var touches$$1 = event.changedTouches,
        n = touches$$1.length, i, gesture;

    if (touchending) { clearTimeout(touchending); }
    touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches$$1[i].identifier]) {
        nopropagation();
        gesture("end");
      }
    }
  }

  function beforestart(id, container, point, that, args) {
    var p = point(container, id), s, dx, dy,
        sublisteners = listeners.copy();

    if (!customEvent(new DragEvent(drag, "beforestart", s, id, active, p[0], p[1], 0, 0, sublisteners), function() {
      if ((event.subject = s = subject.apply(that, args)) == null) { return false; }
      dx = s.x - p[0] || 0;
      dy = s.y - p[1] || 0;
      return true;
    })) { return; }

    return function gesture(type) {
      var p0 = p, n;
      switch (type) {
        case "start": gestures[id] = gesture, n = active++; break;
        case "end": delete gestures[id], --active; // nobreak
        case "drag": p = point(container, id), n = active; break;
      }
      customEvent(new DragEvent(drag, type, s, id, n, p[0] + dx, p[1] + dy, p[0] - p0[0], p[1] - p0[1], sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
    };
  }

  drag.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$3(!!_), drag) : filter;
  };

  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant$3(_), drag) : container;
  };

  drag.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant$3(_), drag) : subject;
  };

  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };

  return drag;
};

var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1000;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : function(f) { setTimeout(f, 17); };

function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}

function clearNow() {
  clockNow = 0;
}

function Timer() {
  this._call =
  this._time =
  this._next = null;
}

Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") { throw new TypeError("callback is not a function"); }
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) { taskTail._next = this; }
      else { taskHead = this; }
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};

function timer(callback, delay, time) {
  var t = new Timer;
  t.restart(callback, delay, time);
  return t;
}

function timerFlush() {
  now(); // Get the current time, if not already set.
  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) { t._call.call(null, e); }
    t = t._next;
  }
  --frame;
}

function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}

function poke() {
  var now = clock.now(), delay = now - clockLast;
  if (delay > pokeDelay) { clockSkew -= delay, clockLast = now; }
}

function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) { time = t1._time; }
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}

function sleep(time) {
  if (frame) { return; } // Soonest alarm already set, or will be.
  if (timeout) { timeout = clearTimeout(timeout); }
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) { timeout = setTimeout(wake, delay); }
    if (interval) { interval = clearInterval(interval); }
  } else {
    if (!interval) { clockLast = clockNow, interval = setInterval(poke, pokeDelay); }
    frame = 1, setFrame(wake);
  }
}

var timeout$1 = function(callback, delay, time) {
  var t = new Timer;
  delay = delay == null ? 0 : +delay;
  t.restart(function(elapsed) {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
};

var interval$1 = function(callback, delay, time) {
  var t = new Timer, total = delay;
  if (delay == null) { return t.restart(callback, delay, time), t; }
  delay = +delay, time = time == null ? now() : +time;
  t.restart(function tick(elapsed) {
    elapsed += total;
    t.restart(tick, total += delay, time);
    callback(elapsed);
  }, delay, time);
  return t;
};

var emptyOn = dispatch("start", "end", "interrupt");
var emptyTween = [];

var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;

var schedule = function(node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) { node.__transition = {}; }
  else if (id in schedules) { return; }
  create(node, id, {
    name: name,
    index: index, // For context during callback.
    group: group, // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
};

function init(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id]) || schedule.state > CREATED) { throw new Error("too late"); }
  return schedule;
}

function set$3(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id]) || schedule.state > STARTING) { throw new Error("too late"); }
  return schedule;
}

function get$1(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) { throw new Error("too late"); }
  return schedule;
}

function create(node, id, self) {
  var schedules = node.__transition,
      tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = timer(schedule, 0, self.time);

  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) { start(elapsed - self.delay); }
  }

  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== SCHEDULED) { return stop(); }

    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) { continue; }

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) { return timeout$1(start); }

      // Interrupt the active transition, if any.
      // Dispatch the interrupt event.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions. No interrupt event is dispatched
      // because the cancelled transitions never started. Note that this also
      // removes this transition from the pending list!
      else if (+i < id) {
        o.state = ENDED;
        o.timer.stop();
        delete schedules[i];
      }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    timeout$1(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) { return; } // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }

  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
        i = -1,
        n = tween.length;

    while (++i < n) {
      tween[i].call(null, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }

  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) { return; } // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

var interrupt = function(node, name) {
  var schedules = node.__transition,
      schedule,
      active,
      empty = true,
      i;

  if (!schedules) { return; }

  name = name == null ? null : name + "";

  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    if (active) { schedule.on.call("interrupt", node, node.__data__, schedule.index, schedule.group); }
    delete schedules[i];
  }

  if (empty) { delete node.__transition; }
};

var selection_interrupt = function(name) {
  return this.each(function() {
    interrupt(this, name);
  });
};

var define = function(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
};

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) { prototype[key] = definition[key]; }
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex3 = /^#([0-9a-f]{3})$/;
var reHex6 = /^#([0-9a-f]{6})$/;
var reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$");
var reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$");
var reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$");
var reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$");
var reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$");
var reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  displayable: function() {
    return this.rgb().displayable();
  },
  toString: function() {
    return this.rgb() + "";
  }
});

function color(format) {
  var m;
  format = (format + "").trim().toLowerCase();
  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
      : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format])
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) { r = g = b = NaN; }
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) { o = color(o); }
  if (!o) { return new Rgb; }
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (0 <= this.r && this.r <= 255)
        && (0 <= this.g && this.g <= 255)
        && (0 <= this.b && this.b <= 255)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  toString: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

function hsla(h, s, l, a) {
  if (a <= 0) { h = s = l = NaN; }
  else if (l <= 0 || l >= 1) { h = s = NaN; }
  else if (s <= 0) { h = NaN; }
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) { return new Hsl(o.h, o.s, o.l, o.opacity); }
  if (!(o instanceof Color)) { o = color(o); }
  if (!o) { return new Hsl; }
  if (o instanceof Hsl) { return o; }
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) { h = (g - b) / s + (g < b) * 6; }
    else if (g === max) { h = (b - r) / s + 2; }
    else { h = (r - g) / s + 4; }
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

var deg2rad = Math.PI / 180;
var rad2deg = 180 / Math.PI;

var Kn = 18;
var Xn = 0.950470;
var Yn = 1;
var Zn = 1.088830;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;

function labConvert(o) {
  if (o instanceof Lab) { return new Lab(o.l, o.a, o.b, o.opacity); }
  if (o instanceof Hcl) {
    var h = o.h * deg2rad;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }
  if (!(o instanceof Rgb)) { o = rgbConvert(o); }
  var b = rgb2xyz(o.r),
      a = rgb2xyz(o.g),
      l = rgb2xyz(o.b),
      x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
      y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
      z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}

function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}

function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}

define(Lab, lab, extend(Color, {
  brighter: function(k) {
    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker: function(k) {
    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb: function() {
    var y = (this.l + 16) / 116,
        x = isNaN(this.a) ? y : y + this.a / 500,
        z = isNaN(this.b) ? y : y - this.b / 200;
    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);
    return new Rgb(
      xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
      xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
      xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
      this.opacity
    );
  }
}));

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function xyz2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2xyz(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hclConvert(o) {
  if (o instanceof Hcl) { return new Hcl(o.h, o.c, o.l, o.opacity); }
  if (!(o instanceof Lab)) { o = labConvert(o); }
  var h = Math.atan2(o.b, o.a) * rad2deg;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}

function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hcl, hcl, extend(Color, {
  brighter: function(k) {
    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
  },
  darker: function(k) {
    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
  },
  rgb: function() {
    return labConvert(this).rgb();
  }
}));

var A = -0.14861;
var B = +1.78277;
var C = -0.29227;
var D = -0.90649;
var E = +1.97294;
var ED = E * D;
var EB = E * B;
var BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) { return new Cubehelix(o.h, o.s, o.l, o.opacity); }
  if (!(o instanceof Rgb)) { o = rgbConvert(o); }
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Cubehelix, cubehelix, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new Rgb(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity
    );
  }
}));

function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
      + (4 - 6 * t2 + 3 * t3) * v1
      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
      + t3 * v3) / 6;
}

var constant$4 = function(x) {
  return function() {
    return x;
  };
};

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$4(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$4(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$4(isNaN(a) ? b : a);
}

var interpolateRgb = ((function rgbGamma(y) {
  var color$$1 = gamma(y);

  function rgb$$1(start, end) {
    var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
        g = color$$1(start.g, end.g),
        b = color$$1(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$$1.gamma = rgbGamma;

  return rgb$$1;
}))(1);

var interpolateNumber = function(a, b) {
  return a = +a, b -= a, function(t) {
    return a + b * t;
  };
};

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

var interpolateString = function(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) { s[i] += bs; } // coalesce with previous string
      else { s[++i] = bs; }
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) { s[i] += bm; } // coalesce with previous string
      else { s[++i] = bm; }
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: interpolateNumber(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) { s[i] += bs; } // coalesce with previous string
    else { s[++i] = bs; }
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) { s[(o = q[i]).i] = o.x(t); }
          return s.join("");
        });
};

var degrees$1 = 180 / Math.PI;

var identity$3 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

var decompose = function(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) { a /= scaleX, b /= scaleX; }
  if (skewX = a * c + b * d) { c -= a * skewX, d -= b * skewX; }
  if (scaleY = Math.sqrt(c * c + d * d)) { c /= scaleY, d /= scaleY, skewX /= scaleY; }
  if (a * d < b * c) { a = -a, b = -b, skewX = -skewX, scaleX = -scaleX; }
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees$1,
    skewX: Math.atan(skewX) * degrees$1,
    scaleX: scaleX,
    scaleY: scaleY
  };
};

var cssNode;
var cssRoot;
var cssView;
var svgNode;

function parseCss(value) {
  if (value === "none") { return identity$3; }
  if (!cssNode) { cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView; }
  cssNode.style.transform = value;
  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
  cssRoot.removeChild(cssNode);
  value = value.slice(7, -1).split(",");
  return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
}

function parseSvg(value) {
  if (value == null) { return identity$3; }
  if (!svgNode) { svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g"); }
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) { return identity$3; }
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) { b += 360; } else if (b - a > 180) { a += 360; } // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) { s[(o = q[i]).i] = o.x(t); }
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

// p0 = [ux0, uy0, w0]
// p1 = [ux1, uy1, w1]

function cubehelix$1(hue$$1) {
  return (function cubehelixGamma(y) {
    y = +y;

    function cubehelix$$1(start, end) {
      var h = hue$$1((start = cubehelix(start)).h, (end = cubehelix(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix$$1.gamma = cubehelixGamma;

    return cubehelix$$1;
  })(1);
}

cubehelix$1(hue);
var cubehelixLong = cubehelix$1(nogamma);

function tweenRemove(id, name) {
  var tween0, tween1;
  return function() {
    var schedule = set$3(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }

    schedule.tween = tween1;
  };
}

function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") { throw new Error; }
  return function() {
    var schedule = set$3(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) { tween1.push(t); }
    }

    schedule.tween = tween1;
  };
}

var transition_tween = function(name, value) {
  var id = this._id;

  name += "";

  if (arguments.length < 2) {
    var tween = get$1(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
};

function tweenValue(transition, name, value) {
  var id = transition._id;

  transition.each(function() {
    var schedule = set$3(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });

  return function(node) {
    return get$1(node, id).value[name];
  };
}

var interpolate$1 = function(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber
      : b instanceof color ? interpolateRgb
      : (c = color(b)) ? (b = c, interpolateRgb)
      : interpolateString)(a, b);
};

function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant$1(name, interpolate$$1, value1) {
  var value00,
      interpolate0;
  return function() {
    var value0 = this.getAttribute(name);
    return value0 === value1 ? null
        : value0 === value00 ? interpolate0
        : interpolate0 = interpolate$$1(value00 = value0, value1);
  };
}

function attrConstantNS$1(fullname, interpolate$$1, value1) {
  var value00,
      interpolate0;
  return function() {
    var value0 = this.getAttributeNS(fullname.space, fullname.local);
    return value0 === value1 ? null
        : value0 === value00 ? interpolate0
        : interpolate0 = interpolate$$1(value00 = value0, value1);
  };
}

function attrFunction$1(name, interpolate$$1, value) {
  var value00,
      value10,
      interpolate0;
  return function() {
    var value0, value1 = value(this);
    if (value1 == null) { return void this.removeAttribute(name); }
    value0 = this.getAttribute(name);
    return value0 === value1 ? null
        : value0 === value00 && value1 === value10 ? interpolate0
        : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
  };
}

function attrFunctionNS$1(fullname, interpolate$$1, value) {
  var value00,
      value10,
      interpolate0;
  return function() {
    var value0, value1 = value(this);
    if (value1 == null) { return void this.removeAttributeNS(fullname.space, fullname.local); }
    value0 = this.getAttributeNS(fullname.space, fullname.local);
    return value0 === value1 ? null
        : value0 === value00 && value1 === value10 ? interpolate0
        : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
  };
}

var transition_attr = function(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate$1;
  return this.attrTween(name, typeof value === "function"
      ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
      : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
      : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
};

function attrTweenNS(fullname, value) {
  function tween() {
    var node = this, i = value.apply(node, arguments);
    return i && function(t) {
      node.setAttributeNS(fullname.space, fullname.local, i(t));
    };
  }
  tween._value = value;
  return tween;
}

function attrTween(name, value) {
  function tween() {
    var node = this, i = value.apply(node, arguments);
    return i && function(t) {
      node.setAttribute(name, i(t));
    };
  }
  tween._value = value;
  return tween;
}

var transition_attrTween = function(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) { return (key = this.tween(key)) && key._value; }
  if (value == null) { return this.tween(key, null); }
  if (typeof value !== "function") { throw new Error; }
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
};

function delayFunction(id, value) {
  return function() {
    init(this, id).delay = +value.apply(this, arguments);
  };
}

function delayConstant(id, value) {
  return value = +value, function() {
    init(this, id).delay = value;
  };
}

var transition_delay = function(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? delayFunction
          : delayConstant)(id, value))
      : get$1(this.node(), id).delay;
};

function durationFunction(id, value) {
  return function() {
    set$3(this, id).duration = +value.apply(this, arguments);
  };
}

function durationConstant(id, value) {
  return value = +value, function() {
    set$3(this, id).duration = value;
  };
}

var transition_duration = function(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? durationFunction
          : durationConstant)(id, value))
      : get$1(this.node(), id).duration;
};

function easeConstant(id, value) {
  if (typeof value !== "function") { throw new Error; }
  return function() {
    set$3(this, id).ease = value;
  };
}

var transition_ease = function(value) {
  var id = this._id;

  return arguments.length
      ? this.each(easeConstant(id, value))
      : get$1(this.node(), id).ease;
};

var transition_filter = function(match) {
  if (typeof match !== "function") { match = matcher$1(match); }

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id);
};

var transition_merge = function(transition) {
  if (transition._id !== this._id) { throw new Error; }

  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Transition(merges, this._parents, this._name, this._id);
};

function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) { t = t.slice(0, i); }
    return !t || t === "start";
  });
}

function onFunction(id, name, listener) {
  var on0, on1, sit = start(name) ? init : set$3;
  return function() {
    var schedule = sit(this, id),
        on = schedule.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) { (on1 = (on0 = on).copy()).on(name, listener); }

    schedule.on = on1;
  };
}

var transition_on = function(name, listener) {
  var id = this._id;

  return arguments.length < 2
      ? get$1(this.node(), id).on.on(name)
      : this.each(onFunction(id, name, listener));
};

function removeFunction(id) {
  return function() {
    var this$1 = this;

    var parent = this.parentNode;
    for (var i in this$1.__transition) { if (+i !== id) { return; } }
    if (parent) { parent.removeChild(this); }
  };
}

var transition_remove = function() {
  return this.on("end.remove", removeFunction(this._id));
};

var transition_select = function(select$$1) {
  var name = this._name,
      id = this._id;

  if (typeof select$$1 !== "function") { select$$1 = selector(select$$1); }

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select$$1.call(node, node.__data__, i, group))) {
        if ("__data__" in node) { subnode.__data__ = node.__data__; }
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
      }
    }
  }

  return new Transition(subgroups, this._parents, name, id);
};

var transition_selectAll = function(select$$1) {
  var name = this._name,
      id = this._id;

  if (typeof select$$1 !== "function") { select$$1 = selectorAll(select$$1); }

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select$$1.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }

  return new Transition(subgroups, parents, name, id);
};

var Selection$1 = selection.prototype.constructor;

var transition_selection = function() {
  return new Selection$1(this._groups, this._parents);
};

function styleRemove$1(name, interpolate$$1) {
  var value00,
      value10,
      interpolate0;
  return function() {
    var style = window$1(this).getComputedStyle(this, null),
        value0 = style.getPropertyValue(name),
        value1 = (this.style.removeProperty(name), style.getPropertyValue(name));
    return value0 === value1 ? null
        : value0 === value00 && value1 === value10 ? interpolate0
        : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
  };
}

function styleRemoveEnd(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant$1(name, interpolate$$1, value1) {
  var value00,
      interpolate0;
  return function() {
    var value0 = window$1(this).getComputedStyle(this, null).getPropertyValue(name);
    return value0 === value1 ? null
        : value0 === value00 ? interpolate0
        : interpolate0 = interpolate$$1(value00 = value0, value1);
  };
}

function styleFunction$1(name, interpolate$$1, value) {
  var value00,
      value10,
      interpolate0;
  return function() {
    var style = window$1(this).getComputedStyle(this, null),
        value0 = style.getPropertyValue(name),
        value1 = value(this);
    if (value1 == null) { value1 = (this.style.removeProperty(name), style.getPropertyValue(name)); }
    return value0 === value1 ? null
        : value0 === value00 && value1 === value10 ? interpolate0
        : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
  };
}

var transition_style = function(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate$1;
  return value == null ? this
          .styleTween(name, styleRemove$1(name, i))
          .on("end.style." + name, styleRemoveEnd(name))
      : this.styleTween(name, typeof value === "function"
          ? styleFunction$1(name, i, tweenValue(this, "style." + name, value))
          : styleConstant$1(name, i, value), priority);
};

function styleTween(name, value, priority) {
  function tween() {
    var node = this, i = value.apply(node, arguments);
    return i && function(t) {
      node.style.setProperty(name, i(t), priority);
    };
  }
  tween._value = value;
  return tween;
}

var transition_styleTween = function(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) { return (key = this.tween(key)) && key._value; }
  if (value == null) { return this.tween(key, null); }
  if (typeof value !== "function") { throw new Error; }
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
};

function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction$1(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}

var transition_text = function(value) {
  return this.tween("text", typeof value === "function"
      ? textFunction$1(tweenValue(this, "text", value))
      : textConstant$1(value == null ? "" : value + ""));
};

var transition_transition = function() {
  var name = this._name,
      id0 = this._id,
      id1 = newId();

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = get$1(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }

  return new Transition(groups, this._parents, name, id1);
};

var id = 0;

function Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}

function transition(name) {
  return selection().transition(name);
}

function newId() {
  return ++id;
}

var selection_prototype = selection.prototype;

Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease
};

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

var exponent = 3;

var polyIn = (function custom(e) {
  e = +e;

  function polyIn(t) {
    return Math.pow(t, e);
  }

  polyIn.exponent = custom;

  return polyIn;
})(exponent);

var polyOut = (function custom(e) {
  e = +e;

  function polyOut(t) {
    return 1 - Math.pow(1 - t, e);
  }

  polyOut.exponent = custom;

  return polyOut;
})(exponent);

var polyInOut = (function custom(e) {
  e = +e;

  function polyInOut(t) {
    return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
  }

  polyInOut.exponent = custom;

  return polyInOut;
})(exponent);

var overshoot = 1.70158;

var backIn = (function custom(s) {
  s = +s;

  function backIn(t) {
    return t * t * ((s + 1) * t - s);
  }

  backIn.overshoot = custom;

  return backIn;
})(overshoot);

var backOut = (function custom(s) {
  s = +s;

  function backOut(t) {
    return --t * t * ((s + 1) * t + s) + 1;
  }

  backOut.overshoot = custom;

  return backOut;
})(overshoot);

var backInOut = (function custom(s) {
  s = +s;

  function backInOut(t) {
    return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
  }

  backInOut.overshoot = custom;

  return backInOut;
})(overshoot);

var tau$1 = 2 * Math.PI;
var amplitude = 1;
var period = 0.3;

var elasticIn = (function custom(a, p) {
  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau$1);

  function elasticIn(t) {
    return a * Math.pow(2, 10 * --t) * Math.sin((s - t) / p);
  }

  elasticIn.amplitude = function(a) { return custom(a, p * tau$1); };
  elasticIn.period = function(p) { return custom(a, p); };

  return elasticIn;
})(amplitude, period);

var elasticOut = (function custom(a, p) {
  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau$1);

  function elasticOut(t) {
    return 1 - a * Math.pow(2, -10 * (t = +t)) * Math.sin((t + s) / p);
  }

  elasticOut.amplitude = function(a) { return custom(a, p * tau$1); };
  elasticOut.period = function(p) { return custom(a, p); };

  return elasticOut;
})(amplitude, period);

var elasticInOut = (function custom(a, p) {
  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau$1);

  function elasticInOut(t) {
    return ((t = t * 2 - 1) < 0
        ? a * Math.pow(2, 10 * t) * Math.sin((s - t) / p)
        : 2 - a * Math.pow(2, -10 * t) * Math.sin((s + t) / p)) / 2;
  }

  elasticInOut.amplitude = function(a) { return custom(a, p * tau$1); };
  elasticInOut.period = function(p) { return custom(a, p); };

  return elasticInOut;
})(amplitude, period);

var defaultTiming = {
  time: null, // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};

function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      return defaultTiming.time = now(), defaultTiming;
    }
  }
  return timing;
}

var selection_transition = function(name) {
  var id,
      timing;

  if (name instanceof Transition) {
    id = name._id, name = name._name;
  } else {
    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }

  return new Transition(groups, this._parents, name, id);
};

selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;

var slice$1 = [].slice;

var noabort = {};

function Queue(size) {
  if (!(size >= 1)) { throw new Error; }
  this._size = size;
  this._call =
  this._error = null;
  this._tasks = [];
  this._data = [];
  this._waiting =
  this._active =
  this._ended =
  this._start = 0; // inside a synchronous task callback?
}

Queue.prototype = queue.prototype = {
  constructor: Queue,
  defer: function(callback) {
    if (typeof callback !== "function" || this._call) { throw new Error; }
    if (this._error != null) { return this; }
    var t = slice$1.call(arguments, 1);
    t.push(callback);
    ++this._waiting, this._tasks.push(t);
    poke$1(this);
    return this;
  },
  abort: function() {
    if (this._error == null) { abort(this, new Error("abort")); }
    return this;
  },
  await: function(callback) {
    if (typeof callback !== "function" || this._call) { throw new Error; }
    this._call = function(error, results) { callback.apply(null, [error].concat(results)); };
    maybeNotify(this);
    return this;
  },
  awaitAll: function(callback) {
    if (typeof callback !== "function" || this._call) { throw new Error; }
    this._call = callback;
    maybeNotify(this);
    return this;
  }
};

function poke$1(q) {
  if (!q._start) {
    try { start$1(q); } // let the current task complete
    catch (e) {
      if (q._tasks[q._ended + q._active - 1]) { abort(q, e); } // task errored synchronously
      else if (!q._data) { throw e; } // await callback errored synchronously
    }
  }
}

function start$1(q) {
  while (q._start = q._waiting && q._active < q._size) {
    var i = q._ended + q._active,
        t = q._tasks[i],
        j = t.length - 1,
        c = t[j];
    t[j] = end(q, i);
    --q._waiting, ++q._active;
    t = c.apply(null, t);
    if (!q._tasks[i]) { continue; } // task finished synchronously
    q._tasks[i] = t || noabort;
  }
}

function end(q, i) {
  return function(e, r) {
    if (!q._tasks[i]) { return; } // ignore multiple callbacks
    --q._active, ++q._ended;
    q._tasks[i] = null;
    if (q._error != null) { return; } // ignore secondary errors
    if (e != null) {
      abort(q, e);
    } else {
      q._data[i] = r;
      if (q._waiting) { poke$1(q); }
      else { maybeNotify(q); }
    }
  };
}

function abort(q, e) {
  var i = q._tasks.length, t;
  q._error = e; // ignore active callbacks
  q._data = undefined; // allow gc
  q._waiting = NaN; // prevent starting

  while (--i >= 0) {
    if (t = q._tasks[i]) {
      q._tasks[i] = null;
      if (t.abort) {
        try { t.abort(); }
        catch (e) { /* ignore */ }
      }
    }
  }

  q._active = NaN; // allow notification
  maybeNotify(q);
}

function maybeNotify(q) {
  if (!q._active && q._call) {
    var d = q._data;
    q._data = undefined; // allow gc
    q._call(q._error, d);
  }
}

function queue(concurrency) {
  return new Queue(arguments.length ? +concurrency : Infinity);
}

// Computes the bounding box of the specified hash of GeoJSON objects.

var hashset = function(size, hash, equal, type, empty) {
  if (arguments.length === 3) {
    type = Array;
    empty = null;
  }

  var store = new type(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
      mask = size - 1;

  for (var i = 0; i < size; ++i) {
    store[i] = empty;
  }

  function add(value) {
    var index = hash(value) & mask,
        match = store[index],
        collisions = 0;
    while (match != empty) {
      if (equal(match, value)) { return true; }
      if (++collisions >= size) { throw new Error("full hashset"); }
      match = store[index = (index + 1) & mask];
    }
    store[index] = value;
    return true;
  }

  function has(value) {
    var index = hash(value) & mask,
        match = store[index],
        collisions = 0;
    while (match != empty) {
      if (equal(match, value)) { return true; }
      if (++collisions >= size) { break; }
      match = store[index = (index + 1) & mask];
    }
    return false;
  }

  function values() {
    var values = [];
    for (var i = 0, n = store.length; i < n; ++i) {
      var match = store[i];
      if (match != empty) { values.push(match); }
    }
    return values;
  }

  return {
    add: add,
    has: has,
    values: values
  };
};

var hashmap = function(size, hash, equal, keyType, keyEmpty, valueType) {
  if (arguments.length === 3) {
    keyType = valueType = Array;
    keyEmpty = null;
  }

  var keystore = new keyType(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
      valstore = new valueType(size),
      mask = size - 1;

  for (var i = 0; i < size; ++i) {
    keystore[i] = keyEmpty;
  }

  function set(key, value) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) { return valstore[index] = value; }
      if (++collisions >= size) { throw new Error("full hashmap"); }
      matchKey = keystore[index = (index + 1) & mask];
    }
    keystore[index] = key;
    valstore[index] = value;
    return value;
  }

  function maybeSet(key, value) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) { return valstore[index]; }
      if (++collisions >= size) { throw new Error("full hashmap"); }
      matchKey = keystore[index = (index + 1) & mask];
    }
    keystore[index] = key;
    valstore[index] = value;
    return value;
  }

  function get(key, missingValue) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) { return valstore[index]; }
      if (++collisions >= size) { break; }
      matchKey = keystore[index = (index + 1) & mask];
    }
    return missingValue;
  }

  function keys() {
    var keys = [];
    for (var i = 0, n = keystore.length; i < n; ++i) {
      var matchKey = keystore[i];
      if (matchKey != keyEmpty) { keys.push(matchKey); }
    }
    return keys;
  }

  return {
    set: set,
    maybeSet: maybeSet, // set if unset
    get: get,
    keys: keys
  };
};

var equalPoint = function(pointA, pointB) {
  return pointA[0] === pointB[0] && pointA[1] === pointB[1];
};

// TODO if quantized, use simpler Int32 hashing?

var buffer = new ArrayBuffer(16);
var floats = new Float64Array(buffer);
var uints = new Uint32Array(buffer);

var hashPoint = function(point) {
  floats[0] = point[0];
  floats[1] = point[1];
  var hash = uints[0] ^ uints[1];
  hash = hash << 5 ^ hash >> 7 ^ uints[2] ^ uints[3];
  return hash & 0x7fffffff;
};

// Given an extracted (pre-)topology, identifies all of the junctions. These are
// the points at which arcs (lines or rings) will need to be cut so that each
// arc is represented uniquely.
//
// A junction is a point where at least one arc deviates from another arc going
// through the same point. For example, consider the point B. If there is a arc
// through ABC and another arc through CBA, then B is not a junction because in
// both cases the adjacent point pairs are {A,C}. However, if there is an
// additional arc ABD, then {A,D} != {A,C}, and thus B becomes a junction.
//
// For a closed ring ABCA, the first point A’s adjacent points are the second
// and last point {B,C}. For a line, the first and last point are always
// considered junctions, even if the line is closed; this ensures that a closed
// line is never rotated.
var join = function(topology) {
  var coordinates = topology.coordinates,
      lines = topology.lines,
      rings = topology.rings,
      indexes = index(),
      visitedByIndex = new Int32Array(coordinates.length),
      leftByIndex = new Int32Array(coordinates.length),
      rightByIndex = new Int32Array(coordinates.length),
      junctionByIndex = new Int8Array(coordinates.length),
      junctionCount = 0, // upper bound on number of junctions
      i, n,
      previousIndex,
      currentIndex,
      nextIndex;

  for (i = 0, n = coordinates.length; i < n; ++i) {
    visitedByIndex[i] = leftByIndex[i] = rightByIndex[i] = -1;
  }

  for (i = 0, n = lines.length; i < n; ++i) {
    var line = lines[i],
        lineStart = line[0],
        lineEnd = line[1];
    currentIndex = indexes[lineStart];
    nextIndex = indexes[++lineStart];
    ++junctionCount, junctionByIndex[currentIndex] = 1; // start
    while (++lineStart <= lineEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[lineStart]);
    }
    ++junctionCount, junctionByIndex[nextIndex] = 1; // end
  }

  for (i = 0, n = coordinates.length; i < n; ++i) {
    visitedByIndex[i] = -1;
  }

  for (i = 0, n = rings.length; i < n; ++i) {
    var ring = rings[i],
        ringStart = ring[0] + 1,
        ringEnd = ring[1];
    previousIndex = indexes[ringEnd - 1];
    currentIndex = indexes[ringStart - 1];
    nextIndex = indexes[ringStart];
    sequence(i, previousIndex, currentIndex, nextIndex);
    while (++ringStart <= ringEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[ringStart]);
    }
  }

  function sequence(i, previousIndex, currentIndex, nextIndex) {
    if (visitedByIndex[currentIndex] === i) { return; } // ignore self-intersection
    visitedByIndex[currentIndex] = i;
    var leftIndex = leftByIndex[currentIndex];
    if (leftIndex >= 0) {
      var rightIndex = rightByIndex[currentIndex];
      if ((leftIndex !== previousIndex || rightIndex !== nextIndex)
        && (leftIndex !== nextIndex || rightIndex !== previousIndex)) {
        ++junctionCount, junctionByIndex[currentIndex] = 1;
      }
    } else {
      leftByIndex[currentIndex] = previousIndex;
      rightByIndex[currentIndex] = nextIndex;
    }
  }

  function index() {
    var indexByPoint = hashmap(coordinates.length * 1.4, hashIndex, equalIndex, Int32Array, -1, Int32Array),
        indexes = new Int32Array(coordinates.length);

    for (var i = 0, n = coordinates.length; i < n; ++i) {
      indexes[i] = indexByPoint.maybeSet(i, i);
    }

    return indexes;
  }

  function hashIndex(i) {
    return hashPoint(coordinates[i]);
  }

  function equalIndex(i, j) {
    return equalPoint(coordinates[i], coordinates[j]);
  }

  visitedByIndex = leftByIndex = rightByIndex = null;

  var junctionByPoint = hashset(junctionCount * 1.4, hashPoint, equalPoint), j;

  // Convert back to a standard hashset by point for caller convenience.
  for (i = 0, n = coordinates.length; i < n; ++i) {
    if (junctionByIndex[j = indexes[i]]) {
      junctionByPoint.add(coordinates[j]);
    }
  }

  return junctionByPoint;
};

// Given an extracted (pre-)topology, cuts (or rotates) arcs so that all shared
// point sequences are identified. The topology can then be subsequently deduped
// to remove exact duplicate arcs.
function rotateArray(array, start, end, offset) {
  reverse(array, start, end);
  reverse(array, start, start + offset);
  reverse(array, start + offset, end);
}

function reverse(array, start, end) {
  for (var mid = start + ((end-- - start) >> 1), t; start < mid; ++start, --end) {
    t = array[start], array[start] = array[end], array[end] = t;
  }
}

// Given a cut topology, combines duplicate arcs.

// Given a TopoJSON topology in absolute (quantized) coordinates,
// converts to fixed-point delta encoding.
// This is a destructive operation that modifies the given topology!

// Extracts the lines and rings from the specified hash of geometry objects.
//
// Returns an object with three properties:
//
// * coordinates - shared buffer of [x, y] coordinates
// * lines - lines extracted from the hash, of the form [start, end]
// * rings - rings extracted from the hash, of the form [start, end]
//
// For each ring or line, start and end represent inclusive indexes into the
// coordinates buffer. For rings (and closed lines), coordinates[start] equals
// coordinates[end].
//
// For each line or polygon geometry in the input hash, including nested
// geometries as in geometry collections, the `coordinates` array is replaced
// with an equivalent `arcs` array that, for each line (for line string
// geometries) or ring (for polygon geometries), points to one of the above
// lines or rings.

// Given a hash of GeoJSON objects, replaces Features with geometry objects.
// This is a destructive operation that modifies the input objects!
function geomifyGeometry(geometry) {
  if (!geometry) { return {type: null}; }
  if (geomifyGeometryType.hasOwnProperty(geometry.type)) { geomifyGeometryType[geometry.type](geometry); }
  return geometry;
}

var geomifyGeometryType = {
  GeometryCollection: function(o) {
    var geometries = o.geometries, i = -1, n = geometries.length;
    while (++i < n) { geometries[i] = geomifyGeometry(geometries[i]); }
  },
  MultiPoint: function(o) {
    if (!o.coordinates.length) {
      o.type = null;
      delete o.coordinates;
    } else if (o.coordinates.length < 2) {
      o.type = "Point";
      o.coordinates = o.coordinates[0];
    }
  },
  LineString: function(o) {
    if (!o.coordinates.length) {
      o.type = null;
      delete o.coordinates;
    }
  },
  MultiLineString: function(o) {
    for (var lines = o.coordinates, i = 0, N = 0, n = lines.length; i < n; ++i) {
      var line = lines[i];
      if (line.length) { lines[N++] = line; }
    }
    if (!N) {
      o.type = null;
      delete o.coordinates;
    } else if (N < 2) {
      o.type = "LineString";
      o.coordinates = lines[0];
    } else {
      o.coordinates.length = N;
    }
  },
  Polygon: function(o) {
    for (var rings = o.coordinates, i = 0, N = 0, n = rings.length; i < n; ++i) {
      var ring = rings[i];
      if (ring.length) { rings[N++] = ring; }
    }
    if (!N) {
      o.type = null;
      delete o.coordinates;
    } else {
      o.coordinates.length = N;
    }
  },
  MultiPolygon: function(o) {
    for (var polygons = o.coordinates, j = 0, M = 0, m = polygons.length; j < m; ++j) {
      for (var rings = polygons[j], i = 0, N = 0, n = rings.length; i < n; ++i) {
        var ring = rings[i];
        if (ring.length) { rings[N++] = ring; }
      }
      if (N) {
        rings.length = N;
        polygons[M++] = rings;
      }
    }
    if (!M) {
      o.type = null;
      delete o.coordinates;
    } else if (M < 2) {
      o.type = "Polygon";
      o.coordinates = polygons[0];
    } else {
      polygons.length = M;
    }
  }
};

// Constructs the TopoJSON Topology for the specified hash of features.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.

var identity$4 = function(x) {
  return x;
};

var transform$1 = function(topology) {
  if ((transform = topology.transform) == null) { return identity$4; }
  var transform,
      x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(point, i) {
    if (!i) { x0 = y0 = 0; }
    point[0] = (x0 += point[0]) * kx + dx;
    point[1] = (y0 += point[1]) * ky + dy;
    return point;
  };
};

var reverse$1 = function(array, n) {
  var t, j = array.length, i = j - n;
  while (i < --j) { t = array[i], array[i++] = array[j], array[j] = t; }
};

var feature = function(topology, o) {
  return o.type === "GeometryCollection"
      ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
      : feature$1(topology, o);
};

function feature$1(topology, o) {
  var id = o.id,
      bbox = o.bbox,
      properties = o.properties == null ? {} : o.properties,
      geometry = object$2(topology, o);
  return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
      : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
      : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
}

function object$2(topology, o) {
  var transformPoint = transform$1(topology),
      arcs = topology.arcs;

  function arc(i, points) {
    if (points.length) { points.pop(); }
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k].slice(), k));
    }
    if (i < 0) { reverse$1(points, n); }
  }

  function point(p) {
    return transformPoint(p.slice());
  }

  function line(arcs) {
    var points = [];
    for (var i = 0, n = arcs.length; i < n; ++i) { arc(arcs[i], points); }
    if (points.length < 2) { points.push(points[0].slice()); }
    return points;
  }

  function ring(arcs) {
    var points = line(arcs);
    while (points.length < 4) { points.push(points[0].slice()); }
    return points;
  }

  function polygon(arcs) {
    return arcs.map(ring);
  }

  function geometry(o) {
    var type = o.type, coordinates;
    switch (type) {
      case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
      case "Point": coordinates = point(o.coordinates); break;
      case "MultiPoint": coordinates = o.coordinates.map(point); break;
      case "LineString": coordinates = line(o.arcs); break;
      case "MultiLineString": coordinates = o.arcs.map(line); break;
      case "Polygon": coordinates = polygon(o.arcs); break;
      case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
      default: return null;
    }
    return {type: type, coordinates: coordinates};
  }

  return geometry(o);
}

var bisect$1 = function(a, x) {
  var lo = 0, hi = a.length;
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (a[mid] < x) { lo = mid + 1; }
    else { hi = mid; }
  }
  return lo;
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;//\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {});
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
};
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end;
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g;
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}];
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase();
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config);
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2;
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el);
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el);
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder);
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e);
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="');
					attrName = source.slice(start,p);
				}
				start = p+1;
				p = source.indexOf(c,start);
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END;
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1);
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start);
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!');
					}
					el.add(value,value,start);
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p);
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start);
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!');
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!');
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName;
		}else{
			localName = qName;
			prefix = null;
			nsPrefix = qName === 'xmlns' && '';
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {};
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={});
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/';
			domBuilder.startPrefixMapping(nsPrefix, value); 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || ''];
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix); 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>');
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName);
		}
		closeMap[tagName] =pos;
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n];}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2);
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA(); 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0];
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1];
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName;
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset};
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
};




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){}
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	};
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1]){ return buf; }
	}
}

var XMLReader_1 = XMLReader;

var sax = {
	XMLReader: XMLReader_1
};

/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype);
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){}
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class);
		}
		pt.constructor = Class;
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml';
// Node Types
var NodeType = {};
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {};
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) { Error.captureStackTrace(this, DOMException); }
	}
	error.code = code;
	if(message) { this.message = this.message + ": " + message; }
	return error;
}
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException);
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
}
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		var this$1 = this;

		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this$1[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh;
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
};

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
}

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1;
		while(i<lastIndex){
			list[i] = list[++i];
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
		var this$1 = this;

//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this$1[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var this$1 = this;

		var i = this.length;
		while(i--){
			var node = this$1[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	var this$1 = this;

	this._features = {};
	if (features) {
		for (var feature in features) {
			 this$1._features = features[feature];
		}
	}
}

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
}

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var this$1 = this;

		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this$1.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value;
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:''];
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next;
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){
		var this$1 = this;
//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this$1.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		});
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
}
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr);
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name);
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr);
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
}
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
}
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
};
_extends(CharacterData,Node);
function Text() {
}
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
};
_extends(Text,CharacterData);
function Comment() {
}
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
};
_extends(Comment,CharacterData);

function CDATASection() {
}
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
};
_extends(CDATASection,CharacterData);


function DocumentType() {
}
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
}
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
}
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
}
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
}
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
};
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null} ];
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length; 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) { visibleNamespaces = []; }
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML; 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length;
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value;
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				var this$1 = this;

				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this$1.removeChild(this$1.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		});
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value;
		};
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	var DOMImplementation_1 = DOMImplementation;
	var XMLSerializer_1 = XMLSerializer;
//}

var dom = {
	DOMImplementation: DOMImplementation_1,
	XMLSerializer: XMLSerializer_1
};

var domParser = createCommonjsModule(function (module, exports) {
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax$$1 =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
	if(locator){
		domBuilder.setDocumentLocator(locator);
	}
	
	sax$$1.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax$$1.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax$$1.parse(source,defaultNSMap,entityMap);
	}else{
		sax$$1.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
};
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {};
	var isCallback = errorImpl instanceof Function;
	locator = locator||{};
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg);}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var this$1 = this;

		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el);
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this$1.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr);
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement;
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins);
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments);
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode);
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments);
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm);
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt);
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
};
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null};
});

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = sax.XMLReader;
	var DOMImplementation = exports.DOMImplementation = dom.DOMImplementation;
	exports.XMLSerializer = dom.XMLSerializer ;
	exports.DOMParser = DOMParser;
//}
});

var fieldTagNames$1 = {
  // TIFF Baseline
  0x013B: 'Artist',
  0x0102: 'BitsPerSample',
  0x0109: 'CellLength',
  0x0108: 'CellWidth',
  0x0140: 'ColorMap',
  0x0103: 'Compression',
  0x8298: 'Copyright',
  0x0132: 'DateTime',
  0x0152: 'ExtraSamples',
  0x010A: 'FillOrder',
  0x0121: 'FreeByteCounts',
  0x0120: 'FreeOffsets',
  0x0123: 'GrayResponseCurve',
  0x0122: 'GrayResponseUnit',
  0x013C: 'HostComputer',
  0x010E: 'ImageDescription',
  0x0101: 'ImageLength',
  0x0100: 'ImageWidth',
  0x010F: 'Make',
  0x0119: 'MaxSampleValue',
  0x0118: 'MinSampleValue',
  0x0110: 'Model',
  0x00FE: 'NewSubfileType',
  0x0112: 'Orientation',
  0x0106: 'PhotometricInterpretation',
  0x011C: 'PlanarConfiguration',
  0x0128: 'ResolutionUnit',
  0x0116: 'RowsPerStrip',
  0x0115: 'SamplesPerPixel',
  0x0131: 'Software',
  0x0117: 'StripByteCounts',
  0x0111: 'StripOffsets',
  0x00FF: 'SubfileType',
  0x0107: 'Threshholding',
  0x011A: 'XResolution',
  0x011B: 'YResolution',

  // TIFF Extended
  0x0146: 'BadFaxLines',
  0x0147: 'CleanFaxData',
  0x0157: 'ClipPath',
  0x0148: 'ConsecutiveBadFaxLines',
  0x01B1: 'Decode',
  0x01B2: 'DefaultImageColor',
  0x010D: 'DocumentName',
  0x0150: 'DotRange',
  0x0141: 'HalftoneHints',
  0x015A: 'Indexed',
  0x015B: 'JPEGTables',
  0x011D: 'PageName',
  0x0129: 'PageNumber',
  0x013D: 'Predictor',
  0x013F: 'PrimaryChromaticities',
  0x0214: 'ReferenceBlackWhite',
  0x0153: 'SampleFormat',
  0x0154: 'SMinSampleValue',
  0x0155: 'SMaxSampleValue',
  0x022F: 'StripRowCounts',
  0x014A: 'SubIFDs',
  0x0124: 'T4Options',
  0x0125: 'T6Options',
  0x0145: 'TileByteCounts',
  0x0143: 'TileLength',
  0x0144: 'TileOffsets',
  0x0142: 'TileWidth',
  0x012D: 'TransferFunction',
  0x013E: 'WhitePoint',
  0x0158: 'XClipPathUnits',
  0x011E: 'XPosition',
  0x0211: 'YCbCrCoefficients',
  0x0213: 'YCbCrPositioning',
  0x0212: 'YCbCrSubSampling',
  0x0159: 'YClipPathUnits',
  0x011F: 'YPosition',

  // EXIF
  0x9202: 'ApertureValue',
  0xA001: 'ColorSpace',
  0x9004: 'DateTimeDigitized',
  0x9003: 'DateTimeOriginal',
  0x8769: 'Exif IFD',
  0x9000: 'ExifVersion',
  0x829A: 'ExposureTime',
  0xA300: 'FileSource',
  0x9209: 'Flash',
  0xA000: 'FlashpixVersion',
  0x829D: 'FNumber',
  0xA420: 'ImageUniqueID',
  0x9208: 'LightSource',
  0x927C: 'MakerNote',
  0x9201: 'ShutterSpeedValue',
  0x9286: 'UserComment',

  // IPTC
  0x83BB: 'IPTC',

  // ICC
  0x8773: 'ICC Profile',

  // XMP
  0x02BC: 'XMP',

  // GDAL
  0xA480: 'GDAL_METADATA',
  0xA481: 'GDAL_NODATA',

  // Photoshop
  0x8649: 'Photoshop',

  // GeoTiff
  0x830E: 'ModelPixelScale',
  0x8482: 'ModelTiepoint',
  0x85D8: 'ModelTransformation',
  0x87AF: 'GeoKeyDirectory',
  0x87B0: 'GeoDoubleParams',
  0x87B1: 'GeoAsciiParams'
};

var key;
var fieldTags = {};
for (key in fieldTagNames$1) {
  fieldTags[fieldTagNames$1[key]] = parseInt(key);
}

var arrayFields$1 = [
  fieldTags.BitsPerSample,
  fieldTags.ExtraSamples,
  fieldTags.SampleFormat,
  fieldTags.StripByteCounts,
  fieldTags.StripOffsets,
  fieldTags.StripRowCounts,
  fieldTags.TileByteCounts,
  fieldTags.TileOffsets
];

var fieldTypeNames = {
  0x0001: 'BYTE',
  0x0002: 'ASCII',
  0x0003: 'SHORT',
  0x0004: 'LONG',
  0x0005: 'RATIONAL',
  0x0006: 'SBYTE',
  0x0007: 'UNDEFINED',
  0x0008: 'SSHORT',
  0x0009: 'SLONG',
  0x000A: 'SRATIONAL',
  0x000B: 'FLOAT',
  0x000C: 'DOUBLE',
  // introduced by BigTIFF
  0x0010: 'LONG8',
  0x0011: 'SLONG8',
  0x0012: 'IFD8'
};

var fieldTypes$1 = {};
for (key in fieldTypeNames) {
  fieldTypes$1[fieldTypeNames[key]] = parseInt(key);
}

var geoKeyNames$1 = {
  1024: 'GTModelTypeGeoKey',
  1025: 'GTRasterTypeGeoKey',
  1026: 'GTCitationGeoKey',
  2048: 'GeographicTypeGeoKey',
  2049: 'GeogCitationGeoKey',
  2050: 'GeogGeodeticDatumGeoKey',
  2051: 'GeogPrimeMeridianGeoKey',
  2052: 'GeogLinearUnitsGeoKey',
  2053: 'GeogLinearUnitSizeGeoKey',
  2054: 'GeogAngularUnitsGeoKey',
  2055: 'GeogAngularUnitSizeGeoKey',
  2056: 'GeogEllipsoidGeoKey',
  2057: 'GeogSemiMajorAxisGeoKey',
  2058: 'GeogSemiMinorAxisGeoKey',
  2059: 'GeogInvFlatteningGeoKey',
  2060: 'GeogAzimuthUnitsGeoKey',
  2061: 'GeogPrimeMeridianLongGeoKey',
  2062: 'GeogTOWGS84GeoKey',
  3072: 'ProjectedCSTypeGeoKey',
  3073: 'PCSCitationGeoKey',
  3074: 'ProjectionGeoKey',
  3075: 'ProjCoordTransGeoKey',
  3076: 'ProjLinearUnitsGeoKey',
  3077: 'ProjLinearUnitSizeGeoKey',
  3078: 'ProjStdParallel1GeoKey',
  3079: 'ProjStdParallel2GeoKey',
  3080: 'ProjNatOriginLongGeoKey',
  3081: 'ProjNatOriginLatGeoKey',
  3082: 'ProjFalseEastingGeoKey',
  3083: 'ProjFalseNorthingGeoKey',
  3084: 'ProjFalseOriginLongGeoKey',
  3085: 'ProjFalseOriginLatGeoKey',
  3086: 'ProjFalseOriginEastingGeoKey',
  3087: 'ProjFalseOriginNorthingGeoKey',
  3088: 'ProjCenterLongGeoKey',
  3089: 'ProjCenterLatGeoKey',
  3090: 'ProjCenterEastingGeoKey',
  3091: 'ProjCenterNorthingGeoKey',
  3092: 'ProjScaleAtNatOriginGeoKey',
  3093: 'ProjScaleAtCenterGeoKey',
  3094: 'ProjAzimuthAngleGeoKey',
  3095: 'ProjStraightVertPoleLongGeoKey',
  3096: 'ProjRectifiedGridAngleGeoKey',
  4096: 'VerticalCSTypeGeoKey',
  4097: 'VerticalCitationGeoKey',
  4098: 'VerticalDatumGeoKey',
  4099: 'VerticalUnitsGeoKey'
};

var geoKeys = {};
for (key in geoKeyNames$1) {
  geoKeys[geoKeyNames$1[key]] = parseInt(key);
}

var parseXml;
// node.js version
if (typeof window === "undefined") {
  parseXml = function(xmlStr) {
    // requires xmldom module
    var DOMParser = domParser.DOMParser;
    return ( new DOMParser() ).parseFromString(xmlStr, "text/xml");
  };
}
else if (typeof window.DOMParser !== "undefined") {
  parseXml = function(xmlStr) {
    return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
  };
}
else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
  parseXml = function(xmlStr) {
    var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = "false";
    xmlDoc.loadXML(xmlStr);
    return xmlDoc;
  };
}

var globals$1 = {
  fieldTags: fieldTags,
  fieldTagNames: fieldTagNames$1,
  arrayFields: arrayFields$1,
  fieldTypes: fieldTypes$1,
  fieldTypeNames: fieldTypeNames,
  geoKeys: geoKeys,
  geoKeyNames: geoKeyNames$1,
  parseXml: parseXml
};

function AbstractDecoder$1() { }

AbstractDecoder$1.prototype = {
  isAsync: function() {
    // TODO: check if async reading func is enabled or not.
    return (typeof this.decodeBlock === "undefined");
  }
};

var abstractdecoder = AbstractDecoder$1;

var AbstractDecoder = abstractdecoder;

function RawDecoder$1() { }

RawDecoder$1.prototype = Object.create(AbstractDecoder.prototype);
RawDecoder$1.prototype.constructor = RawDecoder$1;
RawDecoder$1.prototype.decodeBlock = function(buffer) {
  return buffer;
};

var raw = RawDecoder$1;

//var lzwCompress = require("lzwcompress");
var AbstractDecoder$2 = abstractdecoder;

function LZWDecoder$1() { }

LZWDecoder$1.prototype = Object.create(AbstractDecoder$2.prototype);
LZWDecoder$1.prototype.constructor = LZWDecoder$1;
LZWDecoder$1.prototype.decodeBlock = function(buffer) {
  throw new Error("LZWDecoder is not yet implemented");
  //return lzwCompress.unpack(Array.prototype.slice.call(new Uint8Array(buffer)));
};

var lzw = LZWDecoder$1;

var AbstractDecoder$3 = abstractdecoder;

/*
var Buffer = require('buffer');
var inflate = require('inflate');
var through = require('through');
*/

function DeflateDecoder$1() { }

DeflateDecoder$1.prototype = Object.create(AbstractDecoder$3.prototype);
DeflateDecoder$1.prototype.constructor = DeflateDecoder$1;
DeflateDecoder$1.prototype.decodeBlockAsync = function(buffer, callback) {
  // through(function (data) {
  //   this.queue(new Buffer(new Uint8Array(buffer)));
  // },
  // function() {
  //   this.queue(null);
  // })
  // .pipe(inflate())
  // /*.pipe(function() {
  //   alert(arguments);
  // })*/
  // .on("data", function(data) {
  //   buffers.push(data);
  // })
  // .on("end", function() {
  //   var buffer = Buffer.concat(buffers);
  //   var arrayBuffer = new ArrayBuffer(buffer.length);
  //   var view = new Uint8Array(ab);
  //   for (var i = 0; i < buffer.length; ++i) {
  //       view[i] = buffer[i];
  //   }
  //   callback(null, arrayBuffer);
  // })
  // .on("error", function(error) {
  //   callback(error, null)
  // });
  throw new Error("DeflateDecoder is not yet implemented.");
};

var deflate = DeflateDecoder$1;

var AbstractDecoder$4 = abstractdecoder;


function PackbitsDecoder$1() { }

PackbitsDecoder$1.prototype = Object.create(AbstractDecoder$4.prototype);
PackbitsDecoder$1.prototype.constructor = PackbitsDecoder$1;
PackbitsDecoder$1.prototype.decodeBlock = function(buffer) {
  var dataView = new DataView(buffer);
  var out = [];
  var i, j;

  for (i=0; i < buffer.byteLength; ++i) {
    var header = dataView.getInt8(i);
    if (header < 0) {
      var next = dataView.getUint8(i+1);
      header = -header;
      for (j=0; j<=header; ++j) {
        out.push(next);
      }
      i += 1;
    }
    else {
      for (j=0; j<=header; ++j) {
        out.push(dataView.getUint8(i+j+1));
      }
      i += header + 1;
    }
  }
  return new Uint8Array(out).buffer;
};

var packbits = PackbitsDecoder$1;

var globals$3 = globals$1;
var RawDecoder = raw;
var LZWDecoder = lzw;
var DeflateDecoder = deflate;
var PackbitsDecoder = packbits;


var sum$2 = function(array, start, end) {
  var s = 0;
  for (var i = start; i < end; ++i) {
    s += array[i];
  }
  return s;
};

var arrayForType = function(format, bitsPerSample, size) {
  switch (format) {
    case 1: // unsigned integer data
      switch (bitsPerSample) {
        case 8:
          return new Uint8Array(size);
        case 16:
          return new Uint16Array(size);
        case 32:
          return new Uint32Array(size);
      }
      break;
    case 2: // twos complement signed integer data
      switch (bitsPerSample) {
        case 8:
          return new Int8Array(size);
        case 16:
          return new Int16Array(size);
        case 32:
          return new Int32Array(size);
      }
      break;
    case 3: // floating point data
      switch (bitsPerSample) {
        case 32:
          return new Float32Array(size);
        case 64:
          return new Float64Array(size);
      }
      break;
  }
  throw Error("Unsupported data format/bitsPerSample");
};

/**
 * GeoTIFF sub-file image.
 * @constructor
 * @param {Object} fileDirectory The parsed file directory
 * @param {Object} geoKeys The parsed geo-keys
 * @param {DataView} dataView The DataView for the underlying file.
 * @param {Boolean} littleEndian Whether the file is encoded in little or big endian
 * @param {Boolean} cache Whether or not decoded tiles shall be cached
 */
function GeoTIFFImage$1(fileDirectory, geoKeys, dataView, littleEndian, cache) {
  this.fileDirectory = fileDirectory;
  this.geoKeys = geoKeys;
  this.dataView = dataView;
  this.littleEndian = littleEndian;
  this.tiles = cache ? {} : null;
  this.isTiled = (fileDirectory.StripOffsets) ? false : true;
  var planarConfiguration = fileDirectory.PlanarConfiguration;
  this.planarConfiguration = (typeof planarConfiguration === "undefined") ? 1 : planarConfiguration;
  if (this.planarConfiguration !== 1 && this.planarConfiguration !== 2) {
    throw new Error("Invalid planar configuration.");
  }

  switch (this.fileDirectory.Compression) {
    case undefined:
    case 1: // no compression
      this.decoder = new RawDecoder();
      break;
    case 5: // LZW
      this.decoder = new LZWDecoder();
      break;
    case 6: // JPEG
      throw new Error("JPEG compression not supported.");
    case 8: // Deflate
      this.decoder = new DeflateDecoder();
      break;
    //case 32946: // deflate ??
    //  throw new Error("Deflate compression not supported.");
    case 32773: // packbits
      this.decoder = new PackbitsDecoder();
      break;
    default:
      throw new Error("Unknown compresseion method identifier: " + this.fileDirectory.Compression);
  }
}

GeoTIFFImage$1.prototype = {
  /**
   * Returns the associated parsed file directory.
   * @returns {Object} the parsed file directory
   */
  getFileDirectory: function() {
    return this.fileDirectory;
  },
   /**
   * Returns the associated parsed geo keys.
   * @returns {Object} the parsed geo keys
   */
  getGeoKeys: function() {
    return this.geoKeys;
  },
  /**
   * Returns the width of the image.
   * @returns {Number} the width of the image
   */
  getWidth: function() {
    return this.fileDirectory.ImageWidth;
  },
  /**
   * Returns the height of the image.
   * @returns {Number} the height of the image
   */
  getHeight: function() {
    return this.fileDirectory.ImageLength;
  },
  /**
   * Returns the number of samples per pixel.
   * @returns {Number} the number of samples per pixel
   */
  getSamplesPerPixel: function() {
    return this.fileDirectory.SamplesPerPixel;
  },
  /**
   * Returns the width of each tile.
   * @returns {Number} the width of each tile
   */
  getTileWidth: function() {
    return this.isTiled ? this.fileDirectory.TileWidth : this.getWidth();
  },
  /**
   * Returns the height of each tile.
   * @returns {Number} the height of each tile
   */
  getTileHeight: function() {
    return this.isTiled ? this.fileDirectory.TileLength : this.fileDirectory.RowsPerStrip;
  },

  /**
   * Calculates the number of bytes for each pixel across all samples. Only full
   * bytes are supported, an exception is thrown when this is not the case.
   * @returns {Number} the bytes per pixel
   */
  getBytesPerPixel: function() {
    var this$1 = this;

    var bitsPerSample = 0;
    for (var i = 0; i < this.fileDirectory.BitsPerSample.length; ++i) {
      var bits = this$1.fileDirectory.BitsPerSample[i];
      if ((bits % 8) !== 0) {
        throw new Error("Sample bit-width of " + bits + " is not supported.");
      }
      else if (bits !== this$1.fileDirectory.BitsPerSample[0]) {
        throw new Error("Differing size of samples in a pixel are not supported.");
      }
      bitsPerSample += bits;
    }
    return bitsPerSample / 8;
  },

  getSampleByteSize: function(i) {
    if (i >= this.fileDirectory.BitsPerSample.length) {
      throw new RangeError("Sample index " + i + " is out of range.");
    }
    var bits = this.fileDirectory.BitsPerSample[i];
    if ((bits % 8) !== 0) {
      throw new Error("Sample bit-width of " + bits + " is not supported.");
    }
    return (bits / 8);
  },

  getReaderForSample: function(sampleIndex) {
    var format = this.fileDirectory.SampleFormat ? this.fileDirectory.SampleFormat[sampleIndex] : 1;
    var bitsPerSample = this.fileDirectory.BitsPerSample[sampleIndex];
    switch (format) {
      case 1: // unsigned integer data
        switch (bitsPerSample) {
          case 8:
            return DataView.prototype.getUint8;
          case 16:
            return DataView.prototype.getUint16;
          case 32:
            return DataView.prototype.getUint32;
        }
        break;
      case 2: // twos complement signed integer data
        switch (bitsPerSample) {
          case 8:
            return DataView.prototype.getInt8;
          case 16:
            return DataView.prototype.getInt16;
          case 32:
            return DataView.prototype.getInt32;
        }
        break;
      case 3:
        switch (bitsPerSample) {
          case 32:
            return DataView.prototype.getFloat32;
          case 64:
            return DataView.prototype.getFloat64;
        }
        break;
    }
  },

  getArrayForSample: function(sampleIndex, size) {
    var format = this.fileDirectory.SampleFormat ? this.fileDirectory.SampleFormat[sampleIndex] : 1;
    var bitsPerSample = this.fileDirectory.BitsPerSample[sampleIndex];
    return arrayForType(format, bitsPerSample, size);
  },

  getDecoder: function() {
    return this.decoder;
  },

  /**
   * Returns the decoded strip or tile.
   * @param {Number} x the strip or tile x-offset
   * @param {Number} y the tile y-offset (0 for stripped images)
   * @param {Number} plane the planar configuration (1: "chunky", 2: "separate samples")
   * @returns {(Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array)}
   */
  getTileOrStrip: function(x, y, sample, callback) {
    var numTilesPerRow = Math.ceil(this.getWidth() / this.getTileWidth());
    var numTilesPerCol = Math.ceil(this.getHeight() / this.getTileHeight());
    var index;
    var tiles = this.tiles;
    if (this.planarConfiguration === 1) {
      index = y * numTilesPerRow + x;
    }
    else if (this.planarConfiguration === 2) {
      index = sample * numTilesPerRow * numTilesPerCol + y * numTilesPerRow + x;
    }

    if (tiles !== null && index in tiles) {
      if (callback) {
        return callback(null, {x: x, y: y, sample: sample, data: tiles[index]});
      }
      return tiles[index];
    }
    else {
      var offset, byteCount;
      if (this.isTiled) {
        offset = this.fileDirectory.TileOffsets[index];
        byteCount = this.fileDirectory.TileByteCounts[index];
      }
      else {
        offset = this.fileDirectory.StripOffsets[index];
        byteCount = this.fileDirectory.StripByteCounts[index];
      }
      var slice = this.dataView.buffer.slice(offset, offset + byteCount);
      if (callback) {
        return this.getDecoder().decodeBlockAsync(slice, function(error, data) {
          if (!error && tiles !== null) {
            tiles[index] = data;
          }
          callback(error, {x: x, y: y, sample: sample, data: data});
        });
      }
      var block = this.getDecoder().decodeBlock(slice);
      if (tiles !== null) {
        tiles[index] = block;
      }
      return block;
    }
  },

  _readRasterAsync: function(imageWindow, samples, valueArrays, interleave, callback, callbackError) {
    var this$1 = this;

    var tileWidth = this.getTileWidth();
    var tileHeight = this.getTileHeight();

    var minXTile = Math.floor(imageWindow[0] / tileWidth);
    var maxXTile = Math.ceil(imageWindow[2] / tileWidth);
    var minYTile = Math.floor(imageWindow[1] / tileHeight);
    var maxYTile = Math.ceil(imageWindow[3] / tileHeight);

    var numTilesPerRow = Math.ceil(this.getWidth() / tileWidth);

    var windowWidth = imageWindow[2] - imageWindow[0];
    var windowHeight = imageWindow[3] - imageWindow[1];

    var bytesPerPixel = this.getBytesPerPixel();
    var imageWidth = this.getWidth();

    var srcSampleOffsets = [];
    var sampleReaders = [];
    for (var i = 0; i < samples.length; ++i) {
      if (this$1.planarConfiguration === 1) {
        srcSampleOffsets.push(sum$2(this$1.fileDirectory.BitsPerSample, 0, samples[i]) / 8);
      }
      else {
        srcSampleOffsets.push(0);
      }
      sampleReaders.push(this$1.getReaderForSample(samples[i]));
    }

    var allStacked = false;
    var unfinishedTiles = 0;
    var littleEndian = this.littleEndian;
    var globalError = null;

    function onTileGot(error, tile) {
      if (!error) {
        var dataView = new DataView(tile.data);

        var firstLine = tile.y * tileHeight;
        var firstCol = tile.x * tileWidth;
        var lastLine = (tile.y + 1) * tileHeight;
        var lastCol = (tile.x + 1) * tileWidth;
        var sampleIndex = tile.sample;

        for (var y = Math.max(0, imageWindow[1] - firstLine); y < Math.min(tileHeight, tileHeight - (lastLine - imageWindow[3])); ++y) {
          for (var x = Math.max(0, imageWindow[0] - firstCol); x < Math.min(tileWidth, tileWidth - (lastCol - imageWindow[2])); ++x) {
            var pixelOffset = (y * tileWidth + x) * bytesPerPixel;
            var value = sampleReaders[_sampleIndex].call(dataView, pixelOffset + srcSampleOffsets[_sampleIndex], littleEndian);
            var windowCoordinate;
            if (interleave) {
              windowCoordinate =
                (y + firstLine - imageWindow[1]) * windowWidth * samples.length +
                (x + firstCol - imageWindow[0]) * samples.length +
                _sampleIndex;
              valueArrays[windowCoordinate] = value;
            }
            else {
              windowCoordinate = (
                y + firstLine - imageWindow[1]
              ) * windowWidth + x + firstCol - imageWindow[0];
              valueArrays[_sampleIndex][windowCoordinate] = value;
            }
          }
        }
      }
      else {
        globalError = error;
      }

      // check end condition and call callbacks
      unfinishedTiles -= 1;
      checkFinished();
    }

    function checkFinished() {
      if (allStacked && unfinishedTiles === 0) {
        if (globalError) {
          callbackError(globalError);
        }
        else {
          callback(valueArrays);
        }
      }
    }

    for (var yTile = minYTile; yTile <= maxYTile; ++yTile) {
      for (var xTile = minXTile; xTile <= maxXTile; ++xTile) {
        for (var sampleIndex = 0; sampleIndex < samples.length; ++sampleIndex) {
          var sample = samples[sampleIndex];
          if (this$1.planarConfiguration === 2) {
            bytesPerPixel = this$1.getSampleByteSize(sample);
          }
          var _sampleIndex = sampleIndex;
          unfinishedTiles += 1;
          this$1.getTileOrStrip(xTile, yTile, sample, onTileGot);
        }
      }
    }
    allStacked = true;
    checkFinished();
  },

  _readRaster: function(imageWindow, samples, valueArrays, interleave, callback, callbackError) {
    var this$1 = this;

    try {
      var tileWidth = this.getTileWidth();
      var tileHeight = this.getTileHeight();

      var minXTile = Math.floor(imageWindow[0] / tileWidth);
      var maxXTile = Math.ceil(imageWindow[2] / tileWidth);
      var minYTile = Math.floor(imageWindow[1] / tileHeight);
      var maxYTile = Math.ceil(imageWindow[3] / tileHeight);

      var numTilesPerRow = Math.ceil(this.getWidth() / tileWidth);

      var windowWidth = imageWindow[2] - imageWindow[0];
      var windowHeight = imageWindow[3] - imageWindow[1];

      var bytesPerPixel = this.getBytesPerPixel();
      var imageWidth = this.getWidth();

      var srcSampleOffsets = [];
      var sampleReaders = [];
      for (var i = 0; i < samples.length; ++i) {
        if (this$1.planarConfiguration === 1) {
          srcSampleOffsets.push(sum$2(this$1.fileDirectory.BitsPerSample, 0, samples[i]) / 8);
        }
        else {
          srcSampleOffsets.push(0);
        }
        sampleReaders.push(this$1.getReaderForSample(samples[i]));
      }

      for (var yTile = minYTile; yTile < maxYTile; ++yTile) {
        for (var xTile = minXTile; xTile < maxXTile; ++xTile) {
          var firstLine = yTile * tileHeight;
          var firstCol = xTile * tileWidth;
          var lastLine = (yTile + 1) * tileHeight;
          var lastCol = (xTile + 1) * tileWidth;

          for (var sampleIndex = 0; sampleIndex < samples.length; ++sampleIndex) {
            var sample = samples[sampleIndex];
            if (this$1.planarConfiguration === 2) {
              bytesPerPixel = this$1.getSampleByteSize(sample);
            }
            var tile = new DataView(this$1.getTileOrStrip(xTile, yTile, sample));

            for (var y = Math.max(0, imageWindow[1] - firstLine); y < Math.min(tileHeight, tileHeight - (lastLine - imageWindow[3])); ++y) {
              for (var x = Math.max(0, imageWindow[0] - firstCol); x < Math.min(tileWidth, tileWidth - (lastCol - imageWindow[2])); ++x) {
                var pixelOffset = (y * tileWidth + x) * bytesPerPixel;
                var value = sampleReaders[sampleIndex].call(tile, pixelOffset + srcSampleOffsets[sampleIndex], this$1.littleEndian);
                var windowCoordinate;
                if (interleave) {
                  windowCoordinate =
                    (y + firstLine - imageWindow[1]) * windowWidth * samples.length +
                    (x + firstCol - imageWindow[0]) * samples.length +
                    sampleIndex;
                  valueArrays[windowCoordinate] = value;
                }
                else {
                  windowCoordinate = (
                    y + firstLine - imageWindow[1]
                  ) * windowWidth + x + firstCol - imageWindow[0];
                  valueArrays[sampleIndex][windowCoordinate] = value;
                }
              }
            }
          }
        }
      }
      callback(valueArrays);
      return valueArrays;
    }
    catch (error) {
      return callbackError(error);
    }
  },

  /**
   * This callback is called upon successful reading of a GeoTIFF image. The
   * resulting arrays are passed as a single argument.
   * @callback GeoTIFFImage~readCallback
   * @param {(TypedArray|TypedArray[])} array the requested data as a either a
   *                                          single typed array or a list of
   *                                          typed arrays, depending on the
   *                                          'interleave' option.
   */

  /**
   * This callback is called upon encountering an error while reading of a
   * GeoTIFF image
   * @callback GeoTIFFImage~readErrorCallback
   * @param {Error} error the encountered error
   */

  /**
   * Reads raster data from the image. This function reads all selected samples
   * into separate arrays of the correct type for that sample. When provided,
   * only a subset of the raster is read for each sample.
   *
   * @param {Object} [options] optional parameters
   * @param {Array} [options.window=whole image] the subset to read data from.
   * @param {Array} [options.samples=all samples] the selection of samples to read from.
   * @param {Boolean} [options.interleave=false] whether the data shall be read
   *                                             in one single array or separate
   *                                             arrays.
   * @param {GeoTIFFImage~readCallback} [callback] the success callback. this
   *                                               parameter is mandatory for
   *                                               asynchronous decoders (some
   *                                               compression mechanisms).
   * @param {GeoTIFFImage~readErrorCallback} [callbackError] the error callback
   * @returns {(TypedArray|TypedArray[]|null)} in synchonous cases, the decoded
   *                                           array(s) is/are returned. In
   *                                           asynchronous cases, nothing is
   *                                           returned.
   */
  readRasters: function(/* arguments are read via the 'arguments' object */) {
    var this$1 = this;

    // parse the arguments
    var options, callback, callbackError;
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        if (typeof arguments[0] === "function") {
          callback = arguments[0];
        }
        else {
          options = arguments[0];
        }
        break;
      case 2:
        if (typeof arguments[0] === "function") {
          callback = arguments[0];
          callbackError = arguments[1];
        }
        else {
          options = arguments[0];
          callback = arguments[1];
        }
        break;
      case 3:
        options = arguments[0];
        callback = arguments[1];
        callbackError = arguments[2];
        break;
      default:
        throw new Error("Invalid number of arguments passed.");
    }

    // set up default arguments
    options = options || {};
    callbackError = callbackError || function(error) { console.error(error); };

    var imageWindow = options.window || [0, 0, this.getWidth(), this.getHeight()],
        samples = options.samples,
        interleave = options.interleave;

    // check parameters
    if (imageWindow[0] < 0 ||
        imageWindow[1] < 0 ||
        imageWindow[2] > this.getWidth() ||
        imageWindow[3] > this.getHeight()) {
      throw new Error("Select window is out of image bounds.");
    }
    else if (imageWindow[0] > imageWindow[2] || imageWindow[1] > imageWindow[3]) {
      throw new Error("Invalid subsets");
    }

    var imageWindowWidth = imageWindow[2] - imageWindow[0];
    var imageWindowHeight = imageWindow[3] - imageWindow[1];
    var numPixels = imageWindowWidth * imageWindowHeight;
    var i;

    if (!samples) {
      samples = [];
      for (i=0; i < this.fileDirectory.SamplesPerPixel; ++i) {
        samples.push(i);
      }
    }
    else {
      for (i = 0; i < samples.length; ++i) {
        if (samples[i] >= this$1.fileDirectory.SamplesPerPixel) {
          throw new RangeError("Invalid sample index '" + samples[i] + "'.");
        }
      }
    }
    var valueArrays;
    if (interleave) {
      var format = this.fileDirectory.SampleFormat ? Math.max.apply(null, this.fileDirectory.SampleFormat) : 1,
          bitsPerSample = Math.max.apply(null, this.fileDirectory.BitsPerSample);
      valueArrays = arrayForType(format, bitsPerSample, numPixels * samples.length);
    }
    else {
      valueArrays = [];
      for (i = 0; i < samples.length; ++i) {
        valueArrays.push(this$1.getArrayForSample(samples[i], numPixels));
      }
    }

    // start reading data, sync or async
    var decoder = this.getDecoder();
    if (decoder.isAsync()) {
      if (!callback) {
        throw new Error("No callback specified for asynchronous raster reading.");
      }
      return this._readRasterAsync(
        imageWindow, samples, valueArrays, interleave, callback, callbackError
      );
    }
    else {
      callback = callback || function() {};
      return this._readRaster(
        imageWindow, samples, valueArrays, interleave, callback, callbackError
      );
    }
  },

  /**
   * Returns an array of tiepoints.
   * @returns {Object[]}
   */
  getTiePoints: function() {
    var this$1 = this;

    if (!this.fileDirectory.ModelTiepoint) {
      return [];
    }

    var tiePoints = [];
    for (var i = 0; i < this.fileDirectory.ModelTiepoint.length; i += 6) {
      tiePoints.push({
        i: this$1.fileDirectory.ModelTiepoint[i],
        j: this$1.fileDirectory.ModelTiepoint[i+1],
        k: this$1.fileDirectory.ModelTiepoint[i+2],
        x: this$1.fileDirectory.ModelTiepoint[i+3],
        y: this$1.fileDirectory.ModelTiepoint[i+4],
        z: this$1.fileDirectory.ModelTiepoint[i+5]
      });
    }
    return tiePoints;
  },

  /**
   * Returns the parsed GDAL metadata items.
   * @returns {Object}
   */
  getGDALMetadata: function() {
    var metadata = {};
    if (!this.fileDirectory.GDAL_METADATA) {
      return null;
    }
    var string = this.fileDirectory.GDAL_METADATA;
    var xmlDom = globals$3.parseXml(string.substring(0, string.length-1));
    var result = xmlDom.evaluate(
      "GDALMetadata/Item", xmlDom, null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
    );
    for (var i=0; i < result.snapshotLength; ++i) {
      var node = result.snapshotItem(i);
      metadata[node.getAttribute("name")] = node.textContent;
    }
    return metadata;
  }
};

var geotiffimage = GeoTIFFImage$1;

var DataView64$1 = function DataView64(arrayBuffer) {
  this._dataView = new DataView(arrayBuffer);
};

var prototypeAccessors = { buffer: {} };

prototypeAccessors.buffer.get = function () {
  return this._dataView.buffer;
};

DataView64$1.prototype.getUint64 = function getUint64 (offset, littleEndian) {
  var left = this.getUint32(offset, littleEndian);
  var right = this.getUint32(offset + 4, littleEndian);
  if (littleEndian) {
    return left << 32 | right;
  }
  return right << 32 | left;
};

DataView64$1.prototype.getInt64 = function getInt64 (offset, littleEndian) {
  var left, right;
  if (littleEndian) {
    left = this.getInt32(offset, littleEndian);
    right = this.getUint32(offset + 4, littleEndian);

    return left << 32 | right;
  }
  left = this.getUint32(offset, littleEndian);
  right = this.getInt32(offset + 4, littleEndian);
  return right << 32 | left;
};

DataView64$1.prototype.getUint8 = function getUint8 (offset, littleEndian) {
  return this._dataView.getUint8(offset, littleEndian);
};

DataView64$1.prototype.getInt8 = function getInt8 (offset, littleEndian) {
  return this._dataView.getInt8(offset, littleEndian);
};

DataView64$1.prototype.getUint16 = function getUint16 (offset, littleEndian) {
  return this._dataView.getUint16(offset, littleEndian);
};

DataView64$1.prototype.getInt16 = function getInt16 (offset, littleEndian) {
  return this._dataView.getInt16(offset, littleEndian);
};

DataView64$1.prototype.getUint32 = function getUint32 (offset, littleEndian) {
  return this._dataView.getUint32(offset, littleEndian);
};

DataView64$1.prototype.getInt32 = function getInt32 (offset, littleEndian) {
  return this._dataView.getInt32(offset, littleEndian);
};

DataView64$1.prototype.getFloat32 = function getFloat32 (offset, littleEndian) {
  return this._dataView.getFloat32(offset, littleEndian);
};

DataView64$1.prototype.getFloat64 = function getFloat64 (offset, littleEndian) {
  return this._dataView.getFloat64(offset, littleEndian);
};

Object.defineProperties( DataView64$1.prototype, prototypeAccessors );

var dataview64 = DataView64$1;

var globals = globals$1;
var GeoTIFFImage = geotiffimage;
var DataView64 = dataview64;

var fieldTypes = globals.fieldTypes;
var fieldTagNames = globals.fieldTagNames;
var arrayFields = globals.arrayFields;
var geoKeyNames = globals.geoKeyNames;

/**
 * The abstraction for a whole GeoTIFF file.
 * @constructor
 * @param {ArrayBuffer} rawData the raw data stream of the file as an ArrayBuffer.
 * @param {Object} [options] further options.
 * @param {Boolean} [options.cache=false] whether or not decoded tiles shall be cached.
 */
function GeoTIFF(rawData, options) {
  this.dataView = new DataView64(rawData);
  options = options || {};
  this.cache = options.cache || false;

  var BOM = this.dataView.getUint16(0, 0);
  if (BOM === 0x4949) {
    this.littleEndian = true;
  }
  else if (BOM === 0x4D4D) {
    this.littleEndian = false;
  }
  else {
    throw new TypeError("Invalid byte order value.");
  }

  var magicNumber = this.dataView.getUint16(2, this.littleEndian);
  if (this.dataView.getUint16(2, this.littleEndian) === 42) {
    this.bigTiff = false;
  }
  else if (magicNumber === 43) {
    this.bigTiff = true;
    var offsetBytesize = this.dataView.getUint16(4, this.littleEndian);
    if (offsetBytesize !== 8) {
      throw new Error("Unsupported offset byte-size.");
    }
  }
  else {
    throw new TypeError("Invalid magic number.");
  }

  this.fileDirectories = this.parseFileDirectories(
    this.getOffset((this.bigTiff) ? 8 : 4)
  );
}

GeoTIFF.prototype = {
  getOffset: function(offset) {
    if (this.bigTiff) {
      return this.dataView.getUint64(offset, this.littleEndian);
    }
    return this.dataView.getUint32(offset, this.littleEndian);
  },

  getFieldTypeLength: function(fieldType) {
    switch (fieldType) {
      case fieldTypes.BYTE: case fieldTypes.ASCII: case fieldTypes.SBYTE: case fieldTypes.UNDEFINED:
        return 1;
      case fieldTypes.SHORT: case fieldTypes.SSHORT:
        return 2;
      case fieldTypes.LONG: case fieldTypes.SLONG: case fieldTypes.FLOAT:
        return 4;
      case fieldTypes.RATIONAL: case fieldTypes.SRATIONAL: case fieldTypes.DOUBLE:
      case fieldTypes.LONG8: case fieldTypes.SLONG8: case fieldTypes.IFD8:
        return 8;
      default:
        throw new RangeError("Invalid field type: " + fieldType);
    }
  },

  getValues: function(fieldType, count, offset) {
    var this$1 = this;

    var values = null;
    var readMethod = null;
    var fieldTypeLength = this.getFieldTypeLength(fieldType);
    var i;

    switch (fieldType) {
      case fieldTypes.BYTE: case fieldTypes.ASCII: case fieldTypes.UNDEFINED:
        values = new Uint8Array(count); readMethod = this.dataView.getUint8;
        break;
      case fieldTypes.SBYTE:
        values = new Int8Array(count); readMethod = this.dataView.getInt8;
        break;
      case fieldTypes.SHORT:
        values = new Uint16Array(count); readMethod = this.dataView.getUint16;
        break;
      case fieldTypes.SSHORT:
        values = new Int16Array(count); readMethod = this.dataView.getInt16;
        break;
      case fieldTypes.LONG:
        values = new Uint32Array(count); readMethod = this.dataView.getUint32;
        break;
      case fieldTypes.SLONG:
        values = new Int32Array(count); readMethod = this.dataView.getInt32;
        break;
      case fieldTypes.LONG8: case fieldTypes.IFD8:
        values = new Array(count); readMethod = this.dataView.getUint64;
        break;
      case fieldTypes.SLONG8:
        values = new Array(count); readMethod = this.dataView.getInt64;
        break;
      case fieldTypes.RATIONAL:
        values = new Uint32Array(count*2); readMethod = this.dataView.getUint32;
        break;
      case fieldTypes.SRATIONAL:
        values = new Int32Array(count*2); readMethod = this.dataView.getInt32;
        break;
      case fieldTypes.FLOAT:
        values = new Float32Array(count); readMethod = this.dataView.getFloat32;
        break;
      case fieldTypes.DOUBLE:
        values = new Float64Array(count); readMethod = this.dataView.getFloat64;
        break;
      default:
        throw new RangeError("Invalid field type: " + fieldType);
    }

    // normal fields
    if (!(fieldType === fieldTypes.RATIONAL || fieldType === fieldTypes.SRATIONAL)) {
      for (i=0; i < count; ++i) {
        values[i] = readMethod.call(
          this$1.dataView, offset + (i*fieldTypeLength), this$1.littleEndian
        );
      }
    }
    // RATIONAL or SRATIONAL
    else {
      for (i=0; i < (count*2); i+=2) {
        values[i] = readMethod.call(
          this$1.dataView, offset + (i*fieldTypeLength), this$1.littleEndian
        );
        values[i+1] = readMethod.call(
          this$1.dataView, offset + ((i+1)*fieldTypeLength), this$1.littleEndian
        );
      }
    }

    if (fieldType === fieldTypes.ASCII) {
      return String.fromCharCode.apply(null, values);
    }
    return values;
  },

  getFieldValues: function(fieldTag, fieldType, typeCount, valueOffset) {
    var fieldValues;
    var fieldTypeLength = this.getFieldTypeLength(fieldType);

    if (fieldTypeLength * typeCount <= (this.bigTiff ? 8 : 4)) {
      fieldValues = this.getValues(fieldType, typeCount, valueOffset);
    }
    else {
      var actualOffset = this.getOffset(valueOffset);
      fieldValues = this.getValues(fieldType, typeCount, actualOffset);
    }

    if (typeCount === 1 && arrayFields.indexOf(fieldTag) === -1 && !(fieldType === fieldTypes.RATIONAL || fieldType === fieldTypes.SRATIONAL)) {
      return fieldValues[0];
    }

    return fieldValues;
  },

  parseGeoKeyDirectory: function(fileDirectory) {
    var rawGeoKeyDirectory = fileDirectory.GeoKeyDirectory;
    if (!rawGeoKeyDirectory) {
      return null;
    }

    var geoKeyDirectory = {};
    for (var i = 4; i < rawGeoKeyDirectory[3] * 4; i += 4) {
      var key = geoKeyNames[rawGeoKeyDirectory[i]],
        location = (rawGeoKeyDirectory[i+1]) ? (fieldTagNames[rawGeoKeyDirectory[i+1]]) : null,
        count = rawGeoKeyDirectory[i+2],
        offset = rawGeoKeyDirectory[i+3];

      var value = null;
      if (!location) {
        value = offset;
      }
      else {
        value = fileDirectory[location];
        if (typeof value === "undefined" || value === null) {
          throw new Error("Could not get value of geoKey '" + key + "'.");
        }
        else if (typeof value === "string") {
          value = value.substring(offset, offset + count - 1);
        }
        else if (value.subarray) {
          value = value.subarray(offset, offset + count - 1);
        }
      }
      geoKeyDirectory[key] = value;
    }
    return geoKeyDirectory;
  },

  parseFileDirectories: function(byteOffset) {
    var this$1 = this;

    var nextIFDByteOffset = byteOffset;
    var fileDirectories = [];

    while (nextIFDByteOffset !== 0x00000000) {
      var numDirEntries = this$1.bigTiff ?
          this$1.dataView.getUint64(nextIFDByteOffset, this$1.littleEndian) :
          this$1.dataView.getUint16(nextIFDByteOffset, this$1.littleEndian);

      var fileDirectory = {};

      for (var i = byteOffset + (this.bigTiff ? 8 : 2), entryCount = 0; entryCount < numDirEntries; i += (this.bigTiff ? 20 : 12), ++entryCount) {
        var fieldTag = this$1.dataView.getUint16(i, this$1.littleEndian);
        var fieldType = this$1.dataView.getUint16(i + 2, this$1.littleEndian);
        var typeCount = this$1.bigTiff ?
            this$1.dataView.getUint64(i + 4, this$1.littleEndian):
            this$1.dataView.getUint32(i + 4, this$1.littleEndian);

        fileDirectory[fieldTagNames[fieldTag]] = this$1.getFieldValues(
          fieldTag, fieldType, typeCount, i + (this$1.bigTiff ? 12 : 8)
        );
      }
      fileDirectories.push([
        fileDirectory, this$1.parseGeoKeyDirectory(fileDirectory)
      ]);

      nextIFDByteOffset = this$1.getOffset(i);
    }
    return fileDirectories;
  },

  /**
   * Get the n-th internal subfile a an image. By default, the first is returned.
   *
   * @param {Number} [index=0] the index of the image to return.
   * @returns {GeoTIFFImage} the image at the given index
   */
  getImage: function(index) {
    index = index || 0;
    var fileDirectoryAndGeoKey = this.fileDirectories[index];
    if (!fileDirectoryAndGeoKey) {
      throw new RangeError("Invalid image index");
    }
    return new GeoTIFFImage(fileDirectoryAndGeoKey[0], fileDirectoryAndGeoKey[1], this.dataView, this.littleEndian, this.cache);
  },

  /**
   * Returns the count of the internal subfiles.
   *
   * @returns {Number} the number of internal subfile images
   */
  getImageCount: function() {
    return this.fileDirectories.length;
  }
};

var geotiff$1 = GeoTIFF;

var main = createCommonjsModule(function (module) {
"use strict";

var GeoTIFF = geotiff$1;

/**
 * Main parsing function for GeoTIFF files.
 * @param {(string|ArrayBuffer)} data Raw data to parse the GeoTIFF from.
 * @param {Object} [options] further options.
 * @param {Boolean} [options.cache=false] whether or not decoded tiles shall be cached.
 * @returns {GeoTIFF} the parsed geotiff file.
 */
var parse = function(data, options) {
  var rawData, i, strLen, view;
  if (typeof data === "string" || data instanceof String) {
    rawData = new ArrayBuffer(data.length * 2); // 2 bytes for each char
    view = new Uint16Array(rawData);
    for (i=0, strLen=data.length; i<strLen; ++i) {
      view[i] = data.charCodeAt(i);
    }
  }
  else if (data instanceof ArrayBuffer) {
    rawData = data;
  }
  else {
    throw new Error("Invalid input data given.");
  }
  return new GeoTIFF(rawData, options);
};

{
  module.exports.parse = parse;
}
if (typeof window !== "undefined") {
  window["GeoTIFF"] = {parse:parse};
}
});

/**
* Gestiona les dades.
* Llegeix l'arxiu de configuració per determinar les capes actives inicials.
* Té funcions per a afegir i treure capes actives.
* Llegeix els formats de dades i afegeix els dades als objectes de capes actives
*/
/**
 * dataManager és la classe que defineix i gestiona les capes actives.
 * El constructor carrega les capes actives inicials
 *
 * @class
 * @param {Object} config - L'objecte de configuració carregat des de l'arxiu de configuració
 * @param {Function} iniCallback - La callback function que es crida quan totes les capes inicials estan carregades
 */
function dataManager(config, iniCallback){
   /**
   * L'objecte que conté totes les capes de dades actives, amb les seves propietats (Els valors del raster, tipus de visualització, escala de colors, etc)
   * @property {Object} activeDataLayers - Cada capa té un nom fet del model, la variable i nivell. Els tipus de visualització estan tots al mateix lloc, perquè comparteixen dades.
   */
  this.activeDataLayers = {};
   /**
   * Aquest objecte té les capes de fons actives (colors, dades, línies...)
   * @property {Object} activeBackgroundLayers - Cada capa activa té un nom decidit a la configuració.
   */
  this.activeBackgroundLayers = {};
  /**
   * The object holding all the intervals and horizons when changing the time. Will change depending on the layers
   * @property {Object} playParameters - Has the maxTime and inteval properties
   */
   /**
   * Aquest objecte tñe els intèrvals i horitzons que es fan servir per les aimacions.
   * Els valors de horitzó i intèrval canvien segons siguin els models carregats en cada moment
  * @property {Object} playParameters - té les propietats maxTime i inteval
   */
  this.playParameters = {'maxTime': -1, 'timeStep': 1000};
  /**
  * Si no és *null*, afegeix un paràmetre del tipus ?date=2017-01-01T00:00Z a la crida de l'api per triar la data que es vol veure.
  * Quan el paràmetre no s'afegeix, les dades se suposa que són del dia (problema resolt per l'API)
  */
  this.date = null;
  this.config = config;
  this.defaultMaxTime = config.maxTime;
  this.defaultTimeStep = config.timeStep;
  this.currentHour = 0;
  this.configDataLayers = config.dataLayers;
  var that = this;
   var layersQueue = queue();
  Object.keys(config.dataLayers).map(function(layerName){
    var d = config.dataLayers[layerName];
    if(d.active){
      layersQueue.defer(activateGeotiffLayer, d, that.activeDataLayers, layerName, that.currentHour, that.date);
      if(typeof d.type === 'string'){
        that.activeDataLayers[layerName]['type'] = [d.type];
      } else {
        d.type.forEach(function(visType){
          if(visType.active === true){that.activeDataLayers[layerName]['type'] = [visType.type];}
        });
      }
      if('scale' in that.config.dataLayers[layerName]){
        that.activeDataLayers[layerName]['activeScale'] = that.config.scales[d.scale[0]];
        that.activeDataLayers[layerName]['activeScaleName'] = d.scale[0];
      }
      if('intervals' in that.config.dataLayers[layerName]){
        that.activeDataLayers[layerName]['intervals'] = d.intervals;
      }
    }
  });

  Object.keys(that.activeDataLayers).forEach(function(varName){
    if(that.activeDataLayers[varName]['maxTime'] !== undefined){
      that.playParameters['maxTime'] = that.activeDataLayers[varName]['maxTime']>that.playParameters['maxTime']?that.activeDataLayers[varName]['maxTime']:that.playParameters['maxTime'];
      that.playParameters['timeStep'] = that.activeDataLayers[varName]['timeStep']<that.playParameters['timeStep']?that.activeDataLayers[varName]['timeStep']:that.playParameters['timeStep'];
    } else {
      that.playParameters['maxTime'] = that.defaultMaxTime;
      that.playParameters['timeStep'] = that.defaultTimeStep;
    }
  });

  Object.keys(config.backgroundLayers).map(function(layerName){
    var d = config.backgroundLayers[layerName];
    if(d.active){
      layersQueue.defer(activateTopojsonLayer, d, that.activeBackgroundLayers, layerName);
    }

  });


  layersQueue.await(function(error) {
    if (error) {console.info("ERROR!!!", error);} //dispatch event?
    iniCallback();
  });
}

/**
 * Retorna l'objecte activeDataLayers per poder veure'n les propietats
 * @return {Object} L'objecte activeDataLayers
 */
dataManager.prototype.getActiveDataLayers = function(){
  return this.activeDataLayers;
};

/**
 * Retorna l'objecte playParameters per poder veure'n les propietats
 * @return {Object} L'objecte playParameters
 */
dataManager.prototype.getPlayParameters = function(){
  return this.playParameters;
};

/**
 * Retorna l'objecte activeBackgroundLayers per poder veure'n les propietats
 * @return {Object} L'objecte activeBackgroundLayers
 */
dataManager.prototype.getActiveBackgroundLayers = function(){
  return this.activeBackgroundLayers;
};

/**
 * Determina un nou *temps actual* incrementant el nombre d'hores demanat. Si és necessari, els fitxers de les dades es carregaran.
 * @param (Integer) hours - Nombre d'hores a sumar o restar
 * @param {Function} callback - La callback function que es cridarà quan la capa s'hagi carregat
 * @return {Integer} currentHour - L'hora nova de les capes. Es pot fer servir per saber si n'hi ha més, mirant l'objecte *playParameters*
 */
dataManager.prototype.incrementCurrentTime = function(hours, callback){
  this.setCurrentTime(this.currentHour + hours, callback);
  return this.currentHour + hours;
};

/**
 * Posa el *temps actual per a les dades.  Si és necessari, els fitxers de les dades es carregaran.
 * @param (Integer) hours - El nombre d'hores des de l'inici del model (des de 0)
 * @param {Function} callback - La callback function que es cridarà quan la capa s'hagi carregat
 * @return {Void}
 */
dataManager.prototype.setCurrentTime = function(hours, callback){
  var that = this;
  this.currentHour = hours;
  var layersQueue = queue();
  Object.keys(this.activeDataLayers).forEach(function(activeLayerName){
    //if(activeLayerName !== that.activeDataLayers[activeLayerName].currentHour){
    if(isNaN(hours%that.activeDataLayers[activeLayerName].timeStep) || hours%that.activeDataLayers[activeLayerName].timeStep === 0){
      var oldType = that.activeDataLayers[activeLayerName].type;
      var activeScale = that.activeDataLayers[activeLayerName]['activeScale'];
      var activeScaleName = that.activeDataLayers[activeLayerName]['activeScaleName'];
      var intervals = that.activeDataLayers[activeLayerName]['intervals'];
      layersQueue.defer(activateGeotiffLayer, that.configDataLayers[activeLayerName], that.activeDataLayers, activeLayerName, that.currentHour, that.date);
      that.activeDataLayers[activeLayerName]['type'] = oldType;
      that.activeDataLayers[activeLayerName]['activeScale'] = activeScale;
      that.activeDataLayers[activeLayerName]['activeScaleName'] = activeScaleName;
      that.activeDataLayers[activeLayerName]['intervals'] = intervals;
    }
  });
  layersQueue.await(function(error) {
    if (error) {console.info("ERROR!!!", error);} //dispatch event?
    callback();
  });
};

/**
 * Retorna el temps actual des de la sortida del model. Es pot fer servir per saber si n'hi ha més, mirant l'objecte *playParameters*
 * @return {Integer} currentHour - L'hora de les capes.
 */
dataManager.prototype.getCurrentHours = function(){
  return this.currentHour;
};

/**
 * Afegeix una nova capa de dades cridant la funció privada activateGeotiffLayer
 * Si la capa té un tipus que ja és activat en una altra capa, desactiva l'altra capa (o sigui que fa que no hi hagi dues isobandes alhora)
 * @param {Object} layerConfig - La configuració de la capa tal i com ve definida a config.json (part de dataLayers)
 * @param {String} layerName - El nom de la capa escrit com a la clau a la secció dataLayers de config.json
 * @param {Function} callback - La callback function que es cridarà quan la capa s'hagi carregat
 * @param {String} [typeName] - El tipus de capa (p.e. isolines. Per defecte se'n treu un de layerConfig. Només es poden passar string
 * @return {Void}
 */
dataManager.prototype.addDataLayer = function(layerConfig, layerName, callback, typeName){
   var that = this;

   //Eliminem capes incompatibles per tenir igual tipus
   Object.keys(this.activeDataLayers).forEach(function(activeLayerName){
     var newType = [];
     var newTypeName = Array.isArray(layerConfig.type)?typeName:layerConfig.type;
     that.activeDataLayers[activeLayerName].type.forEach(function(activeTypeName){
       if(activeTypeName !== newTypeName){
         newType.push(activeTypeName);
       }
     });
     that.activeDataLayers[activeLayerName].type = newType;
     if(newType.length === 0){
       delete that.activeDataLayers[activeLayerName];
     }
   });

  if(!Array.isArray(layerConfig.type)){
    activateGeotiffLayer(layerConfig, this.activeDataLayers, layerName, this.currentHour, this.date, callback);
    this.activeDataLayers[layerName]['type'] = [layerConfig.type];
  } else {
    if(layerName in this.activeDataLayers){
      this.activeDataLayers[layerName]['type'].push(typeName);
    } else {
      activateGeotiffLayer(layerConfig, this.activeDataLayers, layerName, this.currentHour, this.date, callback);
      this.activeDataLayers[layerName]['type'] = [typeName];
    }
  }

  if('scale' in this.config.dataLayers[layerName]){
    that.activeDataLayers[layerName]['activeScale'] = that.config.scales[layerConfig.scale[0]];
    that.activeDataLayers[layerName]['activeScaleName'] = layerConfig.scale[0];
  }
  if('intervals' in this.config.dataLayers[layerName]){
    that.activeDataLayers[layerName]['intervals'] = layerConfig.intervals;
  }


  that.playParameters = {'maxTime': -1, 'timeStep': 1000};
  Object.keys(that.activeDataLayers).forEach(function(varName){
    if(that.activeDataLayers[varName]['maxTime'] !== undefined){
      that.playParameters['maxTime'] = that.activeDataLayers[varName]['maxTime']>that.playParameters['maxTime']?that.activeDataLayers[varName]['maxTime']:that.playParameters['maxTime'];
      that.playParameters['timeStep'] = that.activeDataLayers[varName]['timeStep']<that.playParameters['timeStep']?that.activeDataLayers[varName]['timeStep']:that.playParameters['timeStep'];
    } else {
      that.playParameters['maxTime'] = that.defaultMaxTime;
      that.playParameters['timeStep'] = that.defaultTimeStep;
    }
  });
};

/**
 * Elimina una capa activa de l'objecte activeDataLayers
 * @param {String} layerName - el nom de la capa tal i com ve definit com a clau a la secció dataLayers de config.json
 * @param {Function} callback - La callback function que es cridarà quan la capa s'hagi carregat
 * @return {Void}
 */
dataManager.prototype.removeDataLayer = function(layerName, callback){
    delete this.activeDataLayers[layerName];
    callback();
};

/**
 * Afegeix una capa de fons cridant la funció privada  activateTopojsonLayer
 * @param {Object} layerConfig - la configuració de la capa com està definida a config.json, a la part backgroundLayers
 * @param {String} layerName - el nom de la capa
 * @param {Function} callback - La callback function que es cridarà quan la capa s'hagi carregat
 * @return {Void}
 */
dataManager.prototype.addBackgroundLayer = function(layerConfig, layerName, callback){
  activateTopojsonLayer(layerConfig, this.activeBackgroundLayers, layerName, callback);
};

/**
 * Elimina una capa de l'objecte activeBackgroundLayers
 * @param {String} layerName - el nom de la capa
 * @param {Function} callback - La callback function que es cridarà quan la capa s'hagi carregat
 * @return {Void}
 */
dataManager.prototype.removeBackgroundLayer = function(layerName, callback){
  delete this.activeBackgroundLayers[layerName];
  callback();
};

/**
 * Selecciona una nova data de sortida del model. Recarrega les dades actives perquè corresponguin a la data seleccionada.
 * @param {Date} date - La nova data
* @param {Function} callback - La callback function que es cridarà quan les dades s'hagin carregat
 */
dataManager.prototype.setDate = function(date, callback){
  this.date = date;
  var that = this;
  var layersQueue = queue();
  Object.keys(this.activeDataLayers).forEach(function(layerName){
    var activeType = that.activeDataLayers[layerName]['type'];
    var activeScale = that.activeDataLayers[layerName]['activeScale'];
    var activeScaleName = that.activeDataLayers[layerName]['activeScaleName'];
    var intervals = that.activeDataLayers[layerName]['intervals'];
    delete that.activeDataLayers[layerName];
    layersQueue.defer(activateGeotiffLayer, that.config.dataLayers[layerName], that.activeDataLayers, layerName, that.currentHour, that.date);
    that.activeDataLayers[layerName]['type'] = activeType;
    that.activeDataLayers[layerName]['activeScale'] = activeScale;
    that.activeDataLayers[layerName]['activeScaleName'] = activeScaleName;
    that.activeDataLayers[layerName]['intervals'] = intervals;
  });


  layersQueue.await(function(error) {
    if (error) {console.info("ERROR!!!", error);} //dispatch event?
    callback();
  });
};

/**
 * Retorna la data vigent. Si és *null*, es posa com la data de les capes actives
 */
dataManager.prototype.getDate = function(){
  if(!this.date){
    this.date = this.activeDataLayers[Object.keys(this.activeDataLayers)[0]].date;
  }
  return this.date;
};

function activateTopojsonLayer(layerConfig, activeBackgroundLayers, layerName, callback){
  activeBackgroundLayers[layerName] = ('type' in layerConfig)?{'type':layerConfig['type']}:{'type': 'topojson'};
  json(layerConfig.file, function(error, data){
    activeBackgroundLayers[layerName]['data'] = feature(data, data.objects[layerConfig.topojsonName]);
    if('bottomFill' in layerConfig) {activeBackgroundLayers[layerName]['bottomFill'] = layerConfig.bottomFill;}
    if('topStroke' in layerConfig) {activeBackgroundLayers[layerName]['topStroke'] = layerConfig.topStroke;}
    if('pointFill' in layerConfig) {activeBackgroundLayers[layerName]['pointFill'] = layerConfig.pointFill;}
    if('font' in layerConfig) {activeBackgroundLayers[layerName]['font'] = layerConfig.font;}
    callback();
  });
}

function activateGeotiffLayer(layerConfig, activeDataLayers, layerName, currentHour, date, callback){

  activeDataLayers[layerName] = {};
  activeDataLayers[layerName]['model'] = layerConfig.model;
  activeDataLayers[layerName]['variable'] = layerConfig.variable;
  activeDataLayers[layerName]['level'] = layerConfig.level;
  activeDataLayers[layerName]['units'] = layerConfig.units;
  activeDataLayers[layerName]['currentHour'] = currentHour;


  activeDataLayers[layerName]['maxTime'] = layerConfig.maxTime;
  activeDataLayers[layerName]['timeStep'] = layerConfig.timeStep;

  if(currentHour<10){currentHour = "0"+currentHour;}
  var dataFile = layerConfig.file.replace("%H", currentHour);
  if(date){
    dataFile += "?date="+date.toISOString().slice(0, 19)+"Z";
  }

  request(dataFile)
  .responseType('arraybuffer')
  .get(function(error, tiffData){
    console.info(dataFile, tiffData.response);
    var tiff = main.parse(tiffData.response);
    console.info("hoooollll", tiff);
    var image = tiff.getImage();
    var rasters = image.readRasters();
    var tiepoint = image.getTiePoints()[0];
    var pixelScale = image.getFileDirectory().ModelPixelScale;
    var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1*pixelScale[1]];

    //Evitem problemes amb GFS (o qualsevol gt 0->360 enlloc de -180 -> 180 a les lons)
    if(geoTransform[0] > 180){
      geoTransform[0] = geoTransform[0] - 360;
    }

    if(rasters.length === 1){ //Dades escalars, una sola capa
      var pixelsData = new Array(image.getHeight());
      for (var j = 0; j<image.getHeight(); j++){
          pixelsData[j] = new Array(image.getWidth());
          for (var i = 0; i<image.getWidth(); i++){
              pixelsData[j][i] = rasters[0][i + j*image.getWidth()];
          }
      }
      activeDataLayers[layerName]['data'] = pixelsData;
    } else if(rasters.length === 2){ //Dades vectorials, dues capes de components (wind)
      var spdData = new Array(image.getHeight());
      var dirData = new Array(image.getHeight());
      var dataU = new Array(image.getHeight());
      var dataV = new Array(image.getHeight());
      for (var j$1 = 0; j$1<image.getHeight(); j$1++){
          spdData[j$1] = new Array(image.getWidth());
          dirData[j$1] = new Array(image.getWidth());
          dataU[j$1] = new Array(image.getWidth());
          dataV[j$1] = new Array(image.getWidth());
          for (var i$1 = 0; i$1<image.getWidth(); i$1++){
              var u = rasters[0][i$1 + j$1*image.getWidth()];
              var v = rasters[1][i$1 + j$1*image.getWidth()];
              spdData[j$1][i$1] = Math.sqrt(u*u + v*v);
              dirData[j$1][i$1] = Math.atan2(-v, u);
              dirData[j$1][i$1] = dirData[j$1][i$1]<0?dirData[j$1][i$1]+6.28:dirData[j$1][i$1];
              dataU[j$1][i$1] = u;
              dataV[j$1][i$1] = v;
          }
      }
      activeDataLayers[layerName]['data'] = spdData;
      activeDataLayers[layerName]['dirData'] = dirData;
      activeDataLayers[layerName]['dataU'] = dataU;
      activeDataLayers[layerName]['dataV'] = dataV;

    }
    activeDataLayers[layerName]['date'] = new Date(image.getGDALMetadata().date);
    activeDataLayers[layerName]['geoTransform'] = geoTransform;
    if('strokeStyle' in layerConfig){activeDataLayers[layerName]['strokeStyle']=layerConfig.strokeStyle;}
    if('lineWidth' in layerConfig){activeDataLayers[layerName]['lineWidth']=layerConfig.lineWidth;}
    if('barbSize' in layerConfig){activeDataLayers[layerName]['barbSize']=layerConfig.barbSize;}


    if (callback) {callback();}
  });
}

var isobands = function(data, geoTransform, intervals){
    var bands = { "type": "FeatureCollection",
    "features": []
    };
    for(var i=1; i<intervals.length; i++){
        var lowerValue = intervals[i-1];
        var upperValue = intervals[i];
        var coords = projectedIsoband(data, geoTransform, lowerValue, upperValue - lowerValue);
        //Change clockwise
        for(var j=0; j< coords.length; j++)
          { coords[j].reverse(); }

        bands['features'].push({"type": "Feature",
         "geometry": {
           "type": "Polygon",
          "coordinates": coords},
          "properties": [{"lowerValue": lowerValue, "upperValue": upperValue}]}
        );
    }

    return bands;
  };


var projectedIsoband = function(data, geoTransform, minV, bandwidth){
    if(typeof(geoTransform) != typeof(new Array()) || geoTransform.length != 6)
        { throw new Error("GeoTransform must be a 6 elements array"); }
    var coords = isoband(data, minV, bandwidth);

    for(var i = 0; i<coords.length; i++){
        for(var j = 0; j<coords[i].length; j++){
            var coordsGeo = applyGeoTransform(coords[i][j][0], coords[i][j][1], geoTransform);
            coords[i][j][0]= coordsGeo[0];
            coords[i][j][1]= coordsGeo[1];
        }
    }

    return coords;
  };

  /**
    Xgeo = GT(0) + Xpixel*GT(1) + Yline*GT(2)
    Ygeo = GT(3) + Xpixel*GT(4) + Yline*GT(5)
  */
  var applyGeoTransform = function(x, y, geoTransform){
    var xgeo = geoTransform[0] + x*geoTransform[1] + y*geoTransform[2];
    var ygeo = geoTransform[3] + x*geoTransform[4] + y*geoTransform[5];
    return [xgeo, ygeo];
  };

  /*
    Compute isobands(s) of a scalar 2D field given a certain
    threshold and a bandwidth by applying the Marching Squares
    Algorithm. The function returns a list of path coordinates
    either for individual polygons within each grid cell, or the
    outline of connected polygons.
  */
  var isoband = function(data, minV, bandwidth, options){
    var settings = {};
    var defaultSettings = {
    successCallback:  null,
    progressCallback: null,
    verbose:          false
    };

    /* process options */
    options = options ? options : {};

    var optionKeys = Object.keys(defaultSettings);

    for(var i = 0; i < optionKeys.length; i++){
      var key = optionKeys[i];
      var val = options[key];
      val = ((typeof val !== 'undefined') && (val !== null)) ? val : defaultSettings[key];

      settings[key] = val;
    }

    if(settings.verbose)
      { console.log("computing isobands for [" + minV + ":" + (minV + bandwidth) + "]"); }

    var grid = computeBandGrid(data, minV, bandwidth);

    var ret = BandGrid2AreaPaths(grid);

    return ret;
  };

  /*
    Thats all for the public interface, below follows the actual
    implementation
  */

  /* Some private variables */
  var Node0 = 64;
  var Node1 = 16;
  var Node2 = 4;
  var Node3 = 1;

  /*  For isoBands, each square is defined by the three states
      of its corner points. However, since computers use power-2
      values, we use 2bits per trit, i.e.:

      00 ... below minV
      01 ... between minV and maxV
      10 ... above maxV

      Hence we map the 4-trit configurations as follows:

      0000 => 0
      0001 => 1
      0002 => 2
      0010 => 4
      0011 => 5
      0012 => 6
      0020 => 8
      0021 => 9
      0022 => 10
      0100 => 16
      0101 => 17
      0102 => 18
      0110 => 20
      0111 => 21
      0112 => 22
      0120 => 24
      0121 => 25
      0122 => 26
      0200 => 32
      0201 => 33
      0202 => 34
      0210 => 36
      0211 => 37
      0212 => 38
      0220 => 40
      0221 => 41
      0222 => 42
      1000 => 64
      1001 => 65
      1002 => 66
      1010 => 68
      1011 => 69
      1012 => 70
      1020 => 72
      1021 => 73
      1022 => 74
      1100 => 80
      1101 => 81
      1102 => 82
      1110 => 84
      1111 => 85
      1112 => 86
      1120 => 88
      1121 => 89
      1122 => 90
      1200 => 96
      1201 => 97
      1202 => 98
      1210 => 100
      1211 => 101
      1212 => 102
      1220 => 104
      1221 => 105
      1222 => 106
      2000 => 128
      2001 => 129
      2002 => 130
      2010 => 132
      2011 => 133
      2012 => 134
      2020 => 136
      2021 => 137
      2022 => 138
      2100 => 144
      2101 => 145
      2102 => 146
      2110 => 148
      2111 => 149
      2112 => 150
      2120 => 152
      2121 => 153
      2122 => 154
      2200 => 160
      2201 => 161
      2202 => 162
      2210 => 164
      2211 => 165
      2212 => 166
      2220 => 168
      2221 => 169
      2222 => 170
  */

  /*
    The look-up tables for tracing back the contour path
    of isoBands
  */

  var isoBandNextXTL = [];
  var isoBandNextYTL = [];
  var isoBandNextOTL = [];

  var isoBandNextXTR = [];
  var isoBandNextYTR = [];
  var isoBandNextOTR = [];

  var isoBandNextXRT = [];
  var isoBandNextYRT = [];
  var isoBandNextORT = [];

  var isoBandNextXRB = [];
  var isoBandNextYRB = [];
  var isoBandNextORB = [];

  var isoBandNextXBL = [];
  var isoBandNextYBL = [];
  var isoBandNextOBL = [];

  var isoBandNextXBR = [];
  var isoBandNextYBR = [];
  var isoBandNextOBR = [];

  var isoBandNextXLT = [];
  var isoBandNextYLT = [];
  var isoBandNextOLT = [];

  var isoBandNextXLB = [];
  var isoBandNextYLB = [];
  var isoBandNextOLB = [];

  isoBandNextXRT[85] = isoBandNextXRB[85] = -1;
  isoBandNextYRT[85] = isoBandNextYRB[85] = 0;
  isoBandNextORT[85] = isoBandNextORB[85] = 1;
  isoBandNextXLT[85] = isoBandNextXLB[85] = 1;
  isoBandNextYLT[85] = isoBandNextYLB[85] = 0;
  isoBandNextOLT[85] = isoBandNextOLB[85] = 1;

  isoBandNextXTL[85] = isoBandNextXTR[85] = 0;
  isoBandNextYTL[85] = isoBandNextYTR[85] = -1;
  isoBandNextOTL[85] = isoBandNextOBL[85] = 0;
  isoBandNextXBR[85] = isoBandNextXBL[85] = 0;
  isoBandNextYBR[85] = isoBandNextYBL[85] = 1;
  isoBandNextOTR[85] = isoBandNextOBR[85] = 1;


  /* triangle cases */
  isoBandNextXLB[1] = isoBandNextXLB[169] = 0;
  isoBandNextYLB[1] = isoBandNextYLB[169] = -1;
  isoBandNextOLB[1] = isoBandNextOLB[169] = 0;
  isoBandNextXBL[1] = isoBandNextXBL[169] = -1;
  isoBandNextYBL[1] = isoBandNextYBL[169] = 0;
  isoBandNextOBL[1] = isoBandNextOBL[169] = 0;

  isoBandNextXRB[4] = isoBandNextXRB[166] = 0;
  isoBandNextYRB[4] = isoBandNextYRB[166] = -1;
  isoBandNextORB[4] = isoBandNextORB[166] = 1;
  isoBandNextXBR[4] = isoBandNextXBR[166] = 1;
  isoBandNextYBR[4] = isoBandNextYBR[166] = 0;
  isoBandNextOBR[4] = isoBandNextOBR[166] = 0;

  isoBandNextXRT[16] = isoBandNextXRT[154] = 0;
  isoBandNextYRT[16] = isoBandNextYRT[154] = 1;
  isoBandNextORT[16] = isoBandNextORT[154] = 1;
  isoBandNextXTR[16] = isoBandNextXTR[154] = 1;
  isoBandNextYTR[16] = isoBandNextYTR[154] = 0;
  isoBandNextOTR[16] = isoBandNextOTR[154] = 1;

  isoBandNextXLT[64] = isoBandNextXLT[106] = 0;
  isoBandNextYLT[64] = isoBandNextYLT[106] = 1;
  isoBandNextOLT[64] = isoBandNextOLT[106] = 0;
  isoBandNextXTL[64] = isoBandNextXTL[106] = -1;
  isoBandNextYTL[64] = isoBandNextYTL[106] = 0;
  isoBandNextOTL[64] = isoBandNextOTL[106] = 1;

  /* single trapezoid cases */
  isoBandNextXLT[2] = isoBandNextXLT[168] = 0;
  isoBandNextYLT[2] = isoBandNextYLT[168] = -1;
  isoBandNextOLT[2] = isoBandNextOLT[168] = 1;
  isoBandNextXLB[2] = isoBandNextXLB[168] = 0;
  isoBandNextYLB[2] = isoBandNextYLB[168] = -1;
  isoBandNextOLB[2] = isoBandNextOLB[168] = 0;
  isoBandNextXBL[2] = isoBandNextXBL[168] = -1;
  isoBandNextYBL[2] = isoBandNextYBL[168] = 0;
  isoBandNextOBL[2] = isoBandNextOBL[168] = 0;
  isoBandNextXBR[2] = isoBandNextXBR[168] = -1;
  isoBandNextYBR[2] = isoBandNextYBR[168] = 0;
  isoBandNextOBR[2] = isoBandNextOBR[168] = 1;

  isoBandNextXRT[8] = isoBandNextXRT[162] = 0;
  isoBandNextYRT[8] = isoBandNextYRT[162] = -1;
  isoBandNextORT[8] = isoBandNextORT[162] = 0;
  isoBandNextXRB[8] = isoBandNextXRB[162] = 0;
  isoBandNextYRB[8] = isoBandNextYRB[162] = -1;
  isoBandNextORB[8] = isoBandNextORB[162] = 1;
  isoBandNextXBL[8] = isoBandNextXBL[162] = 1;
  isoBandNextYBL[8] = isoBandNextYBL[162] = 0;
  isoBandNextOBL[8] = isoBandNextOBL[162] = 1;
  isoBandNextXBR[8] = isoBandNextXBR[162] = 1;
  isoBandNextYBR[8] = isoBandNextYBR[162] = 0;
  isoBandNextOBR[8] = isoBandNextOBR[162] = 0;

  isoBandNextXRT[32] = isoBandNextXRT[138] = 0;
  isoBandNextYRT[32] = isoBandNextYRT[138] = 1;
  isoBandNextORT[32] = isoBandNextORT[138] = 1;
  isoBandNextXRB[32] = isoBandNextXRB[138] = 0;
  isoBandNextYRB[32] = isoBandNextYRB[138] = 1;
  isoBandNextORB[32] = isoBandNextORB[138] = 0;
  isoBandNextXTL[32] = isoBandNextXTL[138] = 1;
  isoBandNextYTL[32] = isoBandNextYTL[138] = 0;
  isoBandNextOTL[32] = isoBandNextOTL[138] = 0;
  isoBandNextXTR[32] = isoBandNextXTR[138] = 1;
  isoBandNextYTR[32] = isoBandNextYTR[138] = 0;
  isoBandNextOTR[32] = isoBandNextOTR[138] = 1;

  isoBandNextXLB[128] = isoBandNextXLB[42] = 0;
  isoBandNextYLB[128] = isoBandNextYLB[42] = 1;
  isoBandNextOLB[128] = isoBandNextOLB[42] = 1;
  isoBandNextXLT[128] = isoBandNextXLT[42] = 0;
  isoBandNextYLT[128] = isoBandNextYLT[42] = 1;
  isoBandNextOLT[128] = isoBandNextOLT[42] = 0;
  isoBandNextXTL[128] = isoBandNextXTL[42] = -1;
  isoBandNextYTL[128] = isoBandNextYTL[42] = 0;
  isoBandNextOTL[128] = isoBandNextOTL[42] = 1;
  isoBandNextXTR[128] = isoBandNextXTR[42] = -1;
  isoBandNextYTR[128] = isoBandNextYTR[42] = 0;
  isoBandNextOTR[128] = isoBandNextOTR[42] = 0;

  /* single rectangle cases */
  isoBandNextXRB[5] = isoBandNextXRB[165] = -1;
  isoBandNextYRB[5] = isoBandNextYRB[165] = 0;
  isoBandNextORB[5] = isoBandNextORB[165] = 0;
  isoBandNextXLB[5] = isoBandNextXLB[165] = 1;
  isoBandNextYLB[5] = isoBandNextYLB[165] = 0;
  isoBandNextOLB[5] = isoBandNextOLB[165] = 0;

  isoBandNextXBR[20] = isoBandNextXBR[150] = 0;
  isoBandNextYBR[20] = isoBandNextYBR[150] = 1;
  isoBandNextOBR[20] = isoBandNextOBR[150] = 1;
  isoBandNextXTR[20] = isoBandNextXTR[150] = 0;
  isoBandNextYTR[20] = isoBandNextYTR[150] = -1;
  isoBandNextOTR[20] = isoBandNextOTR[150] = 1;

  isoBandNextXRT[80] = isoBandNextXRT[90] = -1;
  isoBandNextYRT[80] = isoBandNextYRT[90] = 0;
  isoBandNextORT[80] = isoBandNextORT[90] = 1;
  isoBandNextXLT[80] = isoBandNextXLT[90] = 1;
  isoBandNextYLT[80] = isoBandNextYLT[90] = 0;
  isoBandNextOLT[80] = isoBandNextOLT[90] = 1;

  isoBandNextXBL[65] = isoBandNextXBL[105] = 0;
  isoBandNextYBL[65] = isoBandNextYBL[105] = 1;
  isoBandNextOBL[65] = isoBandNextOBL[105] = 0;
  isoBandNextXTL[65] = isoBandNextXTL[105] = 0;
  isoBandNextYTL[65] = isoBandNextYTL[105] = -1;
  isoBandNextOTL[65] = isoBandNextOTL[105] = 0;

  isoBandNextXRT[160] = isoBandNextXRT[10] = -1;
  isoBandNextYRT[160] = isoBandNextYRT[10] = 0;
  isoBandNextORT[160] = isoBandNextORT[10] = 1;
  isoBandNextXRB[160] = isoBandNextXRB[10] = -1;
  isoBandNextYRB[160] = isoBandNextYRB[10] = 0;
  isoBandNextORB[160] = isoBandNextORB[10] = 0;
  isoBandNextXLB[160] = isoBandNextXLB[10] = 1;
  isoBandNextYLB[160] = isoBandNextYLB[10] = 0;
  isoBandNextOLB[160] = isoBandNextOLB[10] = 0;
  isoBandNextXLT[160] = isoBandNextXLT[10] = 1;
  isoBandNextYLT[160] = isoBandNextYLT[10] = 0;
  isoBandNextOLT[160] = isoBandNextOLT[10] = 1;

  isoBandNextXBR[130] = isoBandNextXBR[40] = 0;
  isoBandNextYBR[130] = isoBandNextYBR[40] = 1;
  isoBandNextOBR[130] = isoBandNextOBR[40] = 1;
  isoBandNextXBL[130] = isoBandNextXBL[40] = 0;
  isoBandNextYBL[130] = isoBandNextYBL[40] = 1;
  isoBandNextOBL[130] = isoBandNextOBL[40] = 0;
  isoBandNextXTL[130] = isoBandNextXTL[40] = 0;
  isoBandNextYTL[130] = isoBandNextYTL[40] = -1;
  isoBandNextOTL[130] = isoBandNextOTL[40] = 0;
  isoBandNextXTR[130] = isoBandNextXTR[40] = 0;
  isoBandNextYTR[130] = isoBandNextYTR[40] = -1;
  isoBandNextOTR[130] = isoBandNextOTR[40] = 1;

  /* single hexagon cases */
  isoBandNextXRB[37] = isoBandNextXRB[133] = 0;
  isoBandNextYRB[37] = isoBandNextYRB[133] = 1;
  isoBandNextORB[37] = isoBandNextORB[133] = 1;
  isoBandNextXLB[37] = isoBandNextXLB[133] = 0;
  isoBandNextYLB[37] = isoBandNextYLB[133] = 1;
  isoBandNextOLB[37] = isoBandNextOLB[133] = 0;
  isoBandNextXTL[37] = isoBandNextXTL[133] = -1;
  isoBandNextYTL[37] = isoBandNextYTL[133] = 0;
  isoBandNextOTL[37] = isoBandNextOTL[133] = 0;
  isoBandNextXTR[37] = isoBandNextXTR[133] = 1;
  isoBandNextYTR[37] = isoBandNextYTR[133] = 0;
  isoBandNextOTR[37] = isoBandNextOTR[133] = 0;

  isoBandNextXBR[148] = isoBandNextXBR[22] = -1;
  isoBandNextYBR[148] = isoBandNextYBR[22] = 0;
  isoBandNextOBR[148] = isoBandNextOBR[22] = 0;
  isoBandNextXLB[148] = isoBandNextXLB[22] = 0;
  isoBandNextYLB[148] = isoBandNextYLB[22] = -1;
  isoBandNextOLB[148] = isoBandNextOLB[22] = 1;
  isoBandNextXLT[148] = isoBandNextXLT[22] = 0;
  isoBandNextYLT[148] = isoBandNextYLT[22] = 1;
  isoBandNextOLT[148] = isoBandNextOLT[22] = 1;
  isoBandNextXTR[148] = isoBandNextXTR[22] = -1;
  isoBandNextYTR[148] = isoBandNextYTR[22] = 0;
  isoBandNextOTR[148] = isoBandNextOTR[22] = 1;

  isoBandNextXRT[82] = isoBandNextXRT[88] = 0;
  isoBandNextYRT[82] = isoBandNextYRT[88] = -1;
  isoBandNextORT[82] = isoBandNextORT[88] = 1;
  isoBandNextXBR[82] = isoBandNextXBR[88] = 1;
  isoBandNextYBR[82] = isoBandNextYBR[88] = 0;
  isoBandNextOBR[82] = isoBandNextOBR[88] = 1;
  isoBandNextXBL[82] = isoBandNextXBL[88] = -1;
  isoBandNextYBL[82] = isoBandNextYBL[88] = 0;
  isoBandNextOBL[82] = isoBandNextOBL[88] = 1;
  isoBandNextXLT[82] = isoBandNextXLT[88] = 0;
  isoBandNextYLT[82] = isoBandNextYLT[88] = -1;
  isoBandNextOLT[82] = isoBandNextOLT[88] = 0;

  isoBandNextXRT[73] = isoBandNextXRT[97] = 0;
  isoBandNextYRT[73] = isoBandNextYRT[97] = 1;
  isoBandNextORT[73] = isoBandNextORT[97] = 0;
  isoBandNextXRB[73] = isoBandNextXRB[97] = 0;
  isoBandNextYRB[73] = isoBandNextYRB[97] = -1;
  isoBandNextORB[73] = isoBandNextORB[97] = 0;
  isoBandNextXBL[73] = isoBandNextXBL[97] = 1;
  isoBandNextYBL[73] = isoBandNextYBL[97] = 0;
  isoBandNextOBL[73] = isoBandNextOBL[97] = 0;
  isoBandNextXTL[73] = isoBandNextXTL[97] = 1;
  isoBandNextYTL[73] = isoBandNextYTL[97] = 0;
  isoBandNextOTL[73] = isoBandNextOTL[97] = 1;

  isoBandNextXRT[145] = isoBandNextXRT[25] = 0;
  isoBandNextYRT[145] = isoBandNextYRT[25] = -1;
  isoBandNextORT[145] = isoBandNextORT[25] = 0;
  isoBandNextXBL[145] = isoBandNextXBL[25] = 1;
  isoBandNextYBL[145] = isoBandNextYBL[25] = 0;
  isoBandNextOBL[145] = isoBandNextOBL[25] = 1;
  isoBandNextXLB[145] = isoBandNextXLB[25] = 0;
  isoBandNextYLB[145] = isoBandNextYLB[25] = 1;
  isoBandNextOLB[145] = isoBandNextOLB[25] = 1;
  isoBandNextXTR[145] = isoBandNextXTR[25] = -1;
  isoBandNextYTR[145] = isoBandNextYTR[25] = 0;
  isoBandNextOTR[145] = isoBandNextOTR[25] = 0;

  isoBandNextXRB[70] = isoBandNextXRB[100] = 0;
  isoBandNextYRB[70] = isoBandNextYRB[100] = 1;
  isoBandNextORB[70] = isoBandNextORB[100] = 0;
  isoBandNextXBR[70] = isoBandNextXBR[100] = -1;
  isoBandNextYBR[70] = isoBandNextYBR[100] = 0;
  isoBandNextOBR[70] = isoBandNextOBR[100] = 1;
  isoBandNextXLT[70] = isoBandNextXLT[100] = 0;
  isoBandNextYLT[70] = isoBandNextYLT[100] = -1;
  isoBandNextOLT[70] = isoBandNextOLT[100] = 1;
  isoBandNextXTL[70] = isoBandNextXTL[100] = 1;
  isoBandNextYTL[70] = isoBandNextYTL[100] = 0;
  isoBandNextOTL[70] = isoBandNextOTL[100] = 0;

  /* single pentagon cases */
  isoBandNextXRB[101] = isoBandNextXRB[69] = 0;
  isoBandNextYRB[101] = isoBandNextYRB[69] = 1;
  isoBandNextORB[101] = isoBandNextORB[69] = 0;
  isoBandNextXTL[101] = isoBandNextXTL[69] = 1;
  isoBandNextYTL[101] = isoBandNextYTL[69] = 0;
  isoBandNextOTL[101] = isoBandNextOTL[69] = 0;

  isoBandNextXLB[149] = isoBandNextXLB[21] = 0;
  isoBandNextYLB[149] = isoBandNextYLB[21] = 1;
  isoBandNextOLB[149] = isoBandNextOLB[21] = 1;
  isoBandNextXTR[149] = isoBandNextXTR[21] = -1;
  isoBandNextYTR[149] = isoBandNextYTR[21] = 0;
  isoBandNextOTR[149] = isoBandNextOTR[21] = 0;

  isoBandNextXBR[86] = isoBandNextXBR[84] = -1;
  isoBandNextYBR[86] = isoBandNextYBR[84] = 0;
  isoBandNextOBR[86] = isoBandNextOBR[84] = 1;
  isoBandNextXLT[86] = isoBandNextXLT[84] = 0;
  isoBandNextYLT[86] = isoBandNextYLT[84] = -1;
  isoBandNextOLT[86] = isoBandNextOLT[84] = 1;

  isoBandNextXRT[89] = isoBandNextXRT[81] = 0;
  isoBandNextYRT[89] = isoBandNextYRT[81] = -1;
  isoBandNextORT[89] = isoBandNextORT[81] = 0;
  isoBandNextXBL[89] = isoBandNextXBL[81] = 1;
  isoBandNextYBL[89] = isoBandNextYBL[81] = 0;
  isoBandNextOBL[89] = isoBandNextOBL[81] = 1;

  isoBandNextXRT[96] = isoBandNextXRT[74] = 0;
  isoBandNextYRT[96] = isoBandNextYRT[74] = 1;
  isoBandNextORT[96] = isoBandNextORT[74] = 0;
  isoBandNextXRB[96] = isoBandNextXRB[74] = -1;
  isoBandNextYRB[96] = isoBandNextYRB[74] = 0;
  isoBandNextORB[96] = isoBandNextORB[74] = 1;
  isoBandNextXLT[96] = isoBandNextXLT[74] = 1;
  isoBandNextYLT[96] = isoBandNextYLT[74] = 0;
  isoBandNextOLT[96] = isoBandNextOLT[74] = 0;
  isoBandNextXTL[96] = isoBandNextXTL[74] = 1;
  isoBandNextYTL[96] = isoBandNextYTL[74] = 0;
  isoBandNextOTL[96] = isoBandNextOTL[74] = 1;

  isoBandNextXRT[24] = isoBandNextXRT[146] = 0;
  isoBandNextYRT[24] = isoBandNextYRT[146] = -1;
  isoBandNextORT[24] = isoBandNextORT[146] = 1;
  isoBandNextXBR[24] = isoBandNextXBR[146] = 1;
  isoBandNextYBR[24] = isoBandNextYBR[146] = 0;
  isoBandNextOBR[24] = isoBandNextOBR[146] = 1;
  isoBandNextXBL[24] = isoBandNextXBL[146] = 0;
  isoBandNextYBL[24] = isoBandNextYBL[146] = 1;
  isoBandNextOBL[24] = isoBandNextOBL[146] = 1;
  isoBandNextXTR[24] = isoBandNextXTR[146] = 0;
  isoBandNextYTR[24] = isoBandNextYTR[146] = -1;
  isoBandNextOTR[24] = isoBandNextOTR[146] = 0;

  isoBandNextXRB[6] = isoBandNextXRB[164] = -1;
  isoBandNextYRB[6] = isoBandNextYRB[164] = 0;
  isoBandNextORB[6] = isoBandNextORB[164] = 1;
  isoBandNextXBR[6] = isoBandNextXBR[164] = -1;
  isoBandNextYBR[6] = isoBandNextYBR[164] = 0;
  isoBandNextOBR[6] = isoBandNextOBR[164] = 0;
  isoBandNextXLB[6] = isoBandNextXLB[164] = 0;
  isoBandNextYLB[6] = isoBandNextYLB[164] = -1;
  isoBandNextOLB[6] = isoBandNextOLB[164] = 1;
  isoBandNextXLT[6] = isoBandNextXLT[164] = 1;
  isoBandNextYLT[6] = isoBandNextYLT[164] = 0;
  isoBandNextOLT[6] = isoBandNextOLT[164] = 0;

  isoBandNextXBL[129] = isoBandNextXBL[41] = 0;
  isoBandNextYBL[129] = isoBandNextYBL[41] = 1;
  isoBandNextOBL[129] = isoBandNextOBL[41] = 1;
  isoBandNextXLB[129] = isoBandNextXLB[41] = 0;
  isoBandNextYLB[129] = isoBandNextYLB[41] = 1;
  isoBandNextOLB[129] = isoBandNextOLB[41] = 0;
  isoBandNextXTL[129] = isoBandNextXTL[41] = -1;
  isoBandNextYTL[129] = isoBandNextYTL[41] = 0;
  isoBandNextOTL[129] = isoBandNextOTL[41] = 0;
  isoBandNextXTR[129] = isoBandNextXTR[41] = 0;
  isoBandNextYTR[129] = isoBandNextYTR[41] = -1;
  isoBandNextOTR[129] = isoBandNextOTR[41] = 0;

  isoBandNextXBR[66] = isoBandNextXBR[104] = 0;
  isoBandNextYBR[66] = isoBandNextYBR[104] = 1;
  isoBandNextOBR[66] = isoBandNextOBR[104] = 0;
  isoBandNextXBL[66] = isoBandNextXBL[104] = -1;
  isoBandNextYBL[66] = isoBandNextYBL[104] = 0;
  isoBandNextOBL[66] = isoBandNextOBL[104] = 1;
  isoBandNextXLT[66] = isoBandNextXLT[104] = 0;
  isoBandNextYLT[66] = isoBandNextYLT[104] = -1;
  isoBandNextOLT[66] = isoBandNextOLT[104] = 0;
  isoBandNextXTL[66] = isoBandNextXTL[104] = 0;
  isoBandNextYTL[66] = isoBandNextYTL[104] = -1;
  isoBandNextOTL[66] = isoBandNextOTL[104] = 1;

  isoBandNextXRT[144] = isoBandNextXRT[26] = -1;
  isoBandNextYRT[144] = isoBandNextYRT[26] = 0;
  isoBandNextORT[144] = isoBandNextORT[26] = 0;
  isoBandNextXLB[144] = isoBandNextXLB[26] = 1;
  isoBandNextYLB[144] = isoBandNextYLB[26] = 0;
  isoBandNextOLB[144] = isoBandNextOLB[26] = 1;
  isoBandNextXLT[144] = isoBandNextXLT[26] = 0;
  isoBandNextYLT[144] = isoBandNextYLT[26] = 1;
  isoBandNextOLT[144] = isoBandNextOLT[26] = 1;
  isoBandNextXTR[144] = isoBandNextXTR[26] = -1;
  isoBandNextYTR[144] = isoBandNextYTR[26] = 0;
  isoBandNextOTR[144] = isoBandNextOTR[26] = 1;

  isoBandNextXRB[36] = isoBandNextXRB[134] = 0;
  isoBandNextYRB[36] = isoBandNextYRB[134] = 1;
  isoBandNextORB[36] = isoBandNextORB[134] = 1;
  isoBandNextXBR[36] = isoBandNextXBR[134] = 0;
  isoBandNextYBR[36] = isoBandNextYBR[134] = 1;
  isoBandNextOBR[36] = isoBandNextOBR[134] = 0;
  isoBandNextXTL[36] = isoBandNextXTL[134] = 0;
  isoBandNextYTL[36] = isoBandNextYTL[134] = -1;
  isoBandNextOTL[36] = isoBandNextOTL[134] = 1;
  isoBandNextXTR[36] = isoBandNextXTR[134] = 1;
  isoBandNextYTR[36] = isoBandNextYTR[134] = 0;
  isoBandNextOTR[36] = isoBandNextOTR[134] = 0;

  isoBandNextXRT[9] = isoBandNextXRT[161] = -1;
  isoBandNextYRT[9] = isoBandNextYRT[161] = 0;
  isoBandNextORT[9] = isoBandNextORT[161] = 0;
  isoBandNextXRB[9] = isoBandNextXRB[161] = 0;
  isoBandNextYRB[9] = isoBandNextYRB[161] = -1;
  isoBandNextORB[9] = isoBandNextORB[161] = 0;
  isoBandNextXBL[9] = isoBandNextXBL[161] = 1;
  isoBandNextYBL[9] = isoBandNextYBL[161] = 0;
  isoBandNextOBL[9] = isoBandNextOBL[161] = 0;
  isoBandNextXLB[9] = isoBandNextXLB[161] = 1;
  isoBandNextYLB[9] = isoBandNextYLB[161] = 0;
  isoBandNextOLB[9] = isoBandNextOLB[161] = 1;

  /* 8-sided cases */
  isoBandNextXRT[136] = 0;
  isoBandNextYRT[136] = 1;
  isoBandNextORT[136] = 1;
  isoBandNextXRB[136] = 0;
  isoBandNextYRB[136] = 1;
  isoBandNextORB[136] = 0;
  isoBandNextXBR[136] = -1;
  isoBandNextYBR[136] = 0;
  isoBandNextOBR[136] = 1;
  isoBandNextXBL[136] = -1;
  isoBandNextYBL[136] = 0;
  isoBandNextOBL[136] = 0;
  isoBandNextXLB[136] = 0;
  isoBandNextYLB[136] = -1;
  isoBandNextOLB[136] = 0;
  isoBandNextXLT[136] = 0;
  isoBandNextYLT[136] = -1;
  isoBandNextOLT[136] = 1;
  isoBandNextXTL[136] = 1;
  isoBandNextYTL[136] = 0;
  isoBandNextOTL[136] = 0;
  isoBandNextXTR[136] = 1;
  isoBandNextYTR[136] = 0;
  isoBandNextOTR[136] = 1;

  isoBandNextXRT[34] = 0;
  isoBandNextYRT[34] = -1;
  isoBandNextORT[34] = 0;
  isoBandNextXRB[34] = 0;
  isoBandNextYRB[34] = -1;
  isoBandNextORB[34] = 1;
  isoBandNextXBR[34] = 1;
  isoBandNextYBR[34] = 0;
  isoBandNextOBR[34] = 0;
  isoBandNextXBL[34] = 1;
  isoBandNextYBL[34] = 0;
  isoBandNextOBL[34] = 1;
  isoBandNextXLB[34] = 0;
  isoBandNextYLB[34] = 1;
  isoBandNextOLB[34] = 1;
  isoBandNextXLT[34] = 0;
  isoBandNextYLT[34] = 1;
  isoBandNextOLT[34] = 0;
  isoBandNextXTL[34] = -1;
  isoBandNextYTL[34] = 0;
  isoBandNextOTL[34] = 1;
  isoBandNextXTR[34] = -1;
  isoBandNextYTR[34] = 0;
  isoBandNextOTR[34] = 0;

  isoBandNextXRT[35] = 0;
  isoBandNextYRT[35] = 1;
  isoBandNextORT[35] = 1;
  isoBandNextXRB[35] = 0;
  isoBandNextYRB[35] = -1;
  isoBandNextORB[35] = 1;
  isoBandNextXBR[35] = 1;
  isoBandNextYBR[35] = 0;
  isoBandNextOBR[35] = 0;
  isoBandNextXBL[35] = -1;
  isoBandNextYBL[35] = 0;
  isoBandNextOBL[35] = 0;
  isoBandNextXLB[35] = 0;
  isoBandNextYLB[35] = -1;
  isoBandNextOLB[35] = 0;
  isoBandNextXLT[35] = 0;
  isoBandNextYLT[35] = 1;
  isoBandNextOLT[35] = 0;
  isoBandNextXTL[35] = -1;
  isoBandNextYTL[35] = 0;
  isoBandNextOTL[35] = 1;
  isoBandNextXTR[35] = 1;
  isoBandNextYTR[35] = 0;
  isoBandNextOTR[35] = 1;

  /* 6-sided cases */
  isoBandNextXRT[153] = 0;
  isoBandNextYRT[153] = 1;
  isoBandNextORT[153] = 1;
  isoBandNextXBL[153] = -1;
  isoBandNextYBL[153] = 0;
  isoBandNextOBL[153] = 0;
  isoBandNextXLB[153] = 0;
  isoBandNextYLB[153] = -1;
  isoBandNextOLB[153] = 0;
  isoBandNextXTR[153] = 1;
  isoBandNextYTR[153] = 0;
  isoBandNextOTR[153] = 1;

  isoBandNextXRB[102] = 0;
  isoBandNextYRB[102] = -1;
  isoBandNextORB[102] = 1;
  isoBandNextXBR[102] = 1;
  isoBandNextYBR[102] = 0;
  isoBandNextOBR[102] = 0;
  isoBandNextXLT[102] = 0;
  isoBandNextYLT[102] = 1;
  isoBandNextOLT[102] = 0;
  isoBandNextXTL[102] = -1;
  isoBandNextYTL[102] = 0;
  isoBandNextOTL[102] = 1;

  isoBandNextXRT[155] = 0;
  isoBandNextYRT[155] = -1;
  isoBandNextORT[155] = 0;
  isoBandNextXBL[155] = 1;
  isoBandNextYBL[155] = 0;
  isoBandNextOBL[155] = 1;
  isoBandNextXLB[155] = 0;
  isoBandNextYLB[155] = 1;
  isoBandNextOLB[155] = 1;
  isoBandNextXTR[155] = -1;
  isoBandNextYTR[155] = 0;
  isoBandNextOTR[155] = 0;

  isoBandNextXRB[103] = 0;
  isoBandNextYRB[103] = 1;
  isoBandNextORB[103] = 0;
  isoBandNextXBR[103] = -1;
  isoBandNextYBR[103] = 0;
  isoBandNextOBR[103] = 1;
  isoBandNextXLT[103] = 0;
  isoBandNextYLT[103] = -1;
  isoBandNextOLT[103] = 1;
  isoBandNextXTL[103] = 1;
  isoBandNextYTL[103] = 0;
  isoBandNextOTL[103] = 0;

  /* 7-sided cases */
  isoBandNextXRT[152] = 0;
  isoBandNextYRT[152] = 1;
  isoBandNextORT[152] = 1;
  isoBandNextXBR[152] = -1;
  isoBandNextYBR[152] = 0;
  isoBandNextOBR[152] = 1;
  isoBandNextXBL[152] = -1;
  isoBandNextYBL[152] = 0;
  isoBandNextOBL[152] = 0;
  isoBandNextXLB[152] = 0;
  isoBandNextYLB[152] = -1;
  isoBandNextOLB[152] = 0;
  isoBandNextXLT[152] = 0;
  isoBandNextYLT[152] = -1;
  isoBandNextOLT[152] = 1;
  isoBandNextXTR[152] = 1;
  isoBandNextYTR[152] = 0;
  isoBandNextOTR[152] = 1;

  isoBandNextXRT[156] = 0;
  isoBandNextYRT[156] = -1;
  isoBandNextORT[156] = 1;
  isoBandNextXBR[156] = 1;
  isoBandNextYBR[156] = 0;
  isoBandNextOBR[156] = 1;
  isoBandNextXBL[156] = -1;
  isoBandNextYBL[156] = 0;
  isoBandNextOBL[156] = 0;
  isoBandNextXLB[156] = 0;
  isoBandNextYLB[156] = -1;
  isoBandNextOLB[156] = 0;
  isoBandNextXLT[156] = 0;
  isoBandNextYLT[156] = 1;
  isoBandNextOLT[156] = 1;
  isoBandNextXTR[156] = -1;
  isoBandNextYTR[156] = 0;
  isoBandNextOTR[156] = 1;

  isoBandNextXRT[137] = 0;
  isoBandNextYRT[137] = 1;
  isoBandNextORT[137] = 1;
  isoBandNextXRB[137] = 0;
  isoBandNextYRB[137] = 1;
  isoBandNextORB[137] = 0;
  isoBandNextXBL[137] = -1;
  isoBandNextYBL[137] = 0;
  isoBandNextOBL[137] = 0;
  isoBandNextXLB[137] = 0;
  isoBandNextYLB[137] = -1;
  isoBandNextOLB[137] = 0;
  isoBandNextXTL[137] = 1;
  isoBandNextYTL[137] = 0;
  isoBandNextOTL[137] = 0;
  isoBandNextXTR[137] = 1;
  isoBandNextYTR[137] = 0;
  isoBandNextOTR[137] = 1;

  isoBandNextXRT[139] = 0;
  isoBandNextYRT[139] = 1;
  isoBandNextORT[139] = 1;
  isoBandNextXRB[139] = 0;
  isoBandNextYRB[139] = -1;
  isoBandNextORB[139] = 0;
  isoBandNextXBL[139] = 1;
  isoBandNextYBL[139] = 0;
  isoBandNextOBL[139] = 0;
  isoBandNextXLB[139] = 0;
  isoBandNextYLB[139] = 1;
  isoBandNextOLB[139] = 0;
  isoBandNextXTL[139] = -1;
  isoBandNextYTL[139] = 0;
  isoBandNextOTL[139] = 0;
  isoBandNextXTR[139] = 1;
  isoBandNextYTR[139] = 0;
  isoBandNextOTR[139] = 1;

  isoBandNextXRT[98] = 0;
  isoBandNextYRT[98] = -1;
  isoBandNextORT[98] = 0;
  isoBandNextXRB[98] = 0;
  isoBandNextYRB[98] = -1;
  isoBandNextORB[98] = 1;
  isoBandNextXBR[98] = 1;
  isoBandNextYBR[98] = 0;
  isoBandNextOBR[98] = 0;
  isoBandNextXBL[98] = 1;
  isoBandNextYBL[98] = 0;
  isoBandNextOBL[98] = 1;
  isoBandNextXLT[98] = 0;
  isoBandNextYLT[98] = 1;
  isoBandNextOLT[98] = 0;
  isoBandNextXTL[98] = -1;
  isoBandNextYTL[98] = 0;
  isoBandNextOTL[98] = 1;

  isoBandNextXRT[99] = 0;
  isoBandNextYRT[99] = 1;
  isoBandNextORT[99] = 0;
  isoBandNextXRB[99] = 0;
  isoBandNextYRB[99] = -1;
  isoBandNextORB[99] = 1;
  isoBandNextXBR[99] = 1;
  isoBandNextYBR[99] = 0;
  isoBandNextOBR[99] = 0;
  isoBandNextXBL[99] = -1;
  isoBandNextYBL[99] = 0;
  isoBandNextOBL[99] = 1;
  isoBandNextXLT[99] = 0;
  isoBandNextYLT[99] = -1;
  isoBandNextOLT[99] = 0;
  isoBandNextXTL[99] = 1;
  isoBandNextYTL[99] = 0;
  isoBandNextOTL[99] = 1;

  isoBandNextXRB[38] = 0;
  isoBandNextYRB[38] = -1;
  isoBandNextORB[38] = 1;
  isoBandNextXBR[38] = 1;
  isoBandNextYBR[38] = 0;
  isoBandNextOBR[38] = 0;
  isoBandNextXLB[38] = 0;
  isoBandNextYLB[38] = 1;
  isoBandNextOLB[38] = 1;
  isoBandNextXLT[38] = 0;
  isoBandNextYLT[38] = 1;
  isoBandNextOLT[38] = 0;
  isoBandNextXTL[38] = -1;
  isoBandNextYTL[38] = 0;
  isoBandNextOTL[38] = 1;
  isoBandNextXTR[38] = -1;
  isoBandNextYTR[38] = 0;
  isoBandNextOTR[38] = 0;

  isoBandNextXRB[39] = 0;
  isoBandNextYRB[39] = 1;
  isoBandNextORB[39] = 1;
  isoBandNextXBR[39] = -1;
  isoBandNextYBR[39] = 0;
  isoBandNextOBR[39] = 0;
  isoBandNextXLB[39] = 0;
  isoBandNextYLB[39] = -1;
  isoBandNextOLB[39] = 1;
  isoBandNextXLT[39] = 0;
  isoBandNextYLT[39] = 1;
  isoBandNextOLT[39] = 0;
  isoBandNextXTL[39] = -1;
  isoBandNextYTL[39] = 0;
  isoBandNextOTL[39] = 1;
  isoBandNextXTR[39] = 1;
  isoBandNextYTR[39] = 0;
  isoBandNextOTR[39] = 0;

  /*
    The lookup tables for edge number given the polygon
    is entered at a specific location
  */

  var isoBandEdgeRT = [];
  var isoBandEdgeRB = [];
  var isoBandEdgeBR = [];
  var isoBandEdgeBL = [];
  var isoBandEdgeLB = [];
  var isoBandEdgeLT = [];
  var isoBandEdgeTL = [];
  var isoBandEdgeTR = [];

  /* triangle cases */
  isoBandEdgeBL[1]    = isoBandEdgeLB[1]    = 18;
  isoBandEdgeBL[169]  = isoBandEdgeLB[169]  = 18;
  isoBandEdgeBR[4]    = isoBandEdgeRB[4]    = 12;
  isoBandEdgeBR[166]  = isoBandEdgeRB[166]  = 12;
  isoBandEdgeRT[16]   = isoBandEdgeTR[16]   = 4;
  isoBandEdgeRT[154]  = isoBandEdgeTR[154]  = 4;
  isoBandEdgeLT[64]   = isoBandEdgeTL[64]   = 22;
  isoBandEdgeLT[106]  = isoBandEdgeTL[106]  = 22;

  /* trapezoid cases */
  isoBandEdgeBR[2]    = isoBandEdgeLT[2]    = 17;
  isoBandEdgeBL[2]    = isoBandEdgeLB[2]    = 18;
  isoBandEdgeBR[168]  = isoBandEdgeLT[168]  = 17;
  isoBandEdgeBL[168]  = isoBandEdgeLB[168]  = 18;
  isoBandEdgeRT[8]    = isoBandEdgeBL[8]    = 9;
  isoBandEdgeRB[8]    = isoBandEdgeBR[8]    = 12;
  isoBandEdgeRT[162]  = isoBandEdgeBL[162]  = 9;
  isoBandEdgeRB[162]  = isoBandEdgeBR[162]  = 12;
  isoBandEdgeRT[32]   = isoBandEdgeTR[32]   = 4;
  isoBandEdgeRB[32]   = isoBandEdgeTL[32]   = 1;
  isoBandEdgeRT[138]  = isoBandEdgeTR[138]  = 4;
  isoBandEdgeRB[138]  = isoBandEdgeTL[138]  = 1;
  isoBandEdgeLB[128]  = isoBandEdgeTR[128]  = 21;
  isoBandEdgeLT[128]  = isoBandEdgeTL[128]  = 22;
  isoBandEdgeLB[42]   = isoBandEdgeTR[42]   = 21;
  isoBandEdgeLT[42]   = isoBandEdgeTL[42]   = 22;

  /* rectangle cases */
  isoBandEdgeRB[5] = isoBandEdgeLB[5] = 14;
  isoBandEdgeRB[165] = isoBandEdgeLB[165] = 14;
  isoBandEdgeBR[20] = isoBandEdgeTR[20] = 6;
  isoBandEdgeBR[150] = isoBandEdgeTR[150] = 6;
  isoBandEdgeRT[80] = isoBandEdgeLT[80] = 11;
  isoBandEdgeRT[90] = isoBandEdgeLT[90] = 11;
  isoBandEdgeBL[65] = isoBandEdgeTL[65] = 3;
  isoBandEdgeBL[105] = isoBandEdgeTL[105] = 3;
  isoBandEdgeRT[160] = isoBandEdgeLT[160] = 11;
  isoBandEdgeRB[160] = isoBandEdgeLB[160] = 14;
  isoBandEdgeRT[10] = isoBandEdgeLT[10] = 11;
  isoBandEdgeRB[10] = isoBandEdgeLB[10] = 14;
  isoBandEdgeBR[130] = isoBandEdgeTR[130] = 6;
  isoBandEdgeBL[130] = isoBandEdgeTL[130] = 3;
  isoBandEdgeBR[40] = isoBandEdgeTR[40] = 6;
  isoBandEdgeBL[40] = isoBandEdgeTL[40] = 3;

  /* pentagon cases */
  isoBandEdgeRB[101] = isoBandEdgeTL[101] = 1;
  isoBandEdgeRB[69] = isoBandEdgeTL[69] = 1;
  isoBandEdgeLB[149] = isoBandEdgeTR[149] = 21;
  isoBandEdgeLB[21] = isoBandEdgeTR[21] = 21;
  isoBandEdgeBR[86] = isoBandEdgeLT[86] = 17;
  isoBandEdgeBR[84] = isoBandEdgeLT[84] = 17;
  isoBandEdgeRT[89] = isoBandEdgeBL[89] = 9;
  isoBandEdgeRT[81] = isoBandEdgeBL[81] = 9;
  isoBandEdgeRT[96] = isoBandEdgeTL[96] = 0;
  isoBandEdgeRB[96] = isoBandEdgeLT[96] = 15;
  isoBandEdgeRT[74] = isoBandEdgeTL[74] = 0;
  isoBandEdgeRB[74] = isoBandEdgeLT[74] = 15;
  isoBandEdgeRT[24] = isoBandEdgeBR[24] = 8;
  isoBandEdgeBL[24] = isoBandEdgeTR[24] = 7;
  isoBandEdgeRT[146] = isoBandEdgeBR[146] = 8;
  isoBandEdgeBL[146] = isoBandEdgeTR[146] = 7;
  isoBandEdgeRB[6] = isoBandEdgeLT[6] = 15;
  isoBandEdgeBR[6] = isoBandEdgeLB[6] = 16;
  isoBandEdgeRB[164] = isoBandEdgeLT[164] = 15;
  isoBandEdgeBR[164] = isoBandEdgeLB[164] = 16;
  isoBandEdgeBL[129] = isoBandEdgeTR[129] = 7;
  isoBandEdgeLB[129] = isoBandEdgeTL[129] = 20;
  isoBandEdgeBL[41] = isoBandEdgeTR[41] = 7;
  isoBandEdgeLB[41] = isoBandEdgeTL[41] = 20;
  isoBandEdgeBR[66] = isoBandEdgeTL[66] = 2;
  isoBandEdgeBL[66] = isoBandEdgeLT[66] = 19;
  isoBandEdgeBR[104] = isoBandEdgeTL[104] = 2;
  isoBandEdgeBL[104] = isoBandEdgeLT[104] = 19;
  isoBandEdgeRT[144] = isoBandEdgeLB[144] = 10;
  isoBandEdgeLT[144] = isoBandEdgeTR[144] = 23;
  isoBandEdgeRT[26] = isoBandEdgeLB[26] = 10;
  isoBandEdgeLT[26] = isoBandEdgeTR[26] = 23;
  isoBandEdgeRB[36] = isoBandEdgeTR[36] = 5;
  isoBandEdgeBR[36] = isoBandEdgeTL[36] = 2;
  isoBandEdgeRB[134] = isoBandEdgeTR[134] = 5;
  isoBandEdgeBR[134] = isoBandEdgeTL[134] = 2;
  isoBandEdgeRT[9] = isoBandEdgeLB[9] = 10;
  isoBandEdgeRB[9] = isoBandEdgeBL[9] = 13;
  isoBandEdgeRT[161] = isoBandEdgeLB[161] = 10;
  isoBandEdgeRB[161] = isoBandEdgeBL[161] = 13;

  /* hexagon cases */
  isoBandEdgeRB[37] = isoBandEdgeTR[37] = 5;
  isoBandEdgeLB[37] = isoBandEdgeTL[37] = 20;
  isoBandEdgeRB[133] = isoBandEdgeTR[133] = 5;
  isoBandEdgeLB[133] = isoBandEdgeTL[133] = 20;
  isoBandEdgeBR[148] = isoBandEdgeLB[148] = 16;
  isoBandEdgeLT[148] = isoBandEdgeTR[148] = 23;
  isoBandEdgeBR[22] = isoBandEdgeLB[22] = 16;
  isoBandEdgeLT[22] = isoBandEdgeTR[22] = 23;
  isoBandEdgeRT[82] = isoBandEdgeBR[82] = 8;
  isoBandEdgeBL[82] = isoBandEdgeLT[82] = 19;
  isoBandEdgeRT[88] = isoBandEdgeBR[88] = 8;
  isoBandEdgeBL[88] = isoBandEdgeLT[88] = 19;
  isoBandEdgeRT[73] = isoBandEdgeTL[73] = 0;
  isoBandEdgeRB[73] = isoBandEdgeBL[73] = 13;
  isoBandEdgeRT[97] = isoBandEdgeTL[97] = 0;
  isoBandEdgeRB[97] = isoBandEdgeBL[97] = 13;
  isoBandEdgeRT[145] = isoBandEdgeBL[145] = 9;
  isoBandEdgeLB[145] = isoBandEdgeTR[145] = 21;
  isoBandEdgeRT[25] = isoBandEdgeBL[25] = 9;
  isoBandEdgeLB[25] = isoBandEdgeTR[25] = 21;
  isoBandEdgeRB[70] = isoBandEdgeTL[70] = 1;
  isoBandEdgeBR[70] = isoBandEdgeLT[70] = 17;
  isoBandEdgeRB[100] = isoBandEdgeTL[100] = 1;
  isoBandEdgeBR[100] = isoBandEdgeLT[100] = 17;

  /* 8-sided cases */
  isoBandEdgeRT[34] = isoBandEdgeBL[34] = 9;
  isoBandEdgeRB[34] = isoBandEdgeBR[34] = 12;
  isoBandEdgeLB[34] = isoBandEdgeTR[34] = 21;
  isoBandEdgeLT[34] = isoBandEdgeTL[34] = 22;
  isoBandEdgeRT[136] = isoBandEdgeTR[136] = 4;
  isoBandEdgeRB[136] = isoBandEdgeTL[136] = 1;
  isoBandEdgeBR[136] = isoBandEdgeLT[136] = 17;
  isoBandEdgeBL[136] = isoBandEdgeLB[136] = 18;
  isoBandEdgeRT[35] = isoBandEdgeTR[35] = 4;
  isoBandEdgeRB[35] = isoBandEdgeBR[35] = 12;
  isoBandEdgeBL[35] = isoBandEdgeLB[35] = 18;
  isoBandEdgeLT[35] = isoBandEdgeTL[35] = 22;

  /* 6-sided cases */
  isoBandEdgeRT[153] = isoBandEdgeTR[153] = 4;
  isoBandEdgeBL[153] = isoBandEdgeLB[153] = 18;
  isoBandEdgeRB[102] = isoBandEdgeBR[102] = 12;
  isoBandEdgeLT[102] = isoBandEdgeTL[102] = 22;
  isoBandEdgeRT[155] = isoBandEdgeBL[155] = 9;
  isoBandEdgeLB[155] = isoBandEdgeTR[155] = 23;
  isoBandEdgeRB[103] = isoBandEdgeTL[103] = 1;
  isoBandEdgeBR[103] = isoBandEdgeLT[103] = 17;

  /* 7-sided cases */
  isoBandEdgeRT[152] = isoBandEdgeTR[152] = 4;
  isoBandEdgeBR[152] = isoBandEdgeLT[152] = 17;
  isoBandEdgeBL[152] = isoBandEdgeLB[152] = 18;
  isoBandEdgeRT[156] = isoBandEdgeBR[156] = 8;
  isoBandEdgeBL[156] = isoBandEdgeLB[156] = 18;
  isoBandEdgeLT[156] = isoBandEdgeTR[156] = 23;
  isoBandEdgeRT[137] = isoBandEdgeTR[137] = 4;
  isoBandEdgeRB[137] = isoBandEdgeTL[137] = 1;
  isoBandEdgeBL[137] = isoBandEdgeLB[137] = 18;
  isoBandEdgeRT[139] = isoBandEdgeTR[139] = 4;
  isoBandEdgeRB[139] = isoBandEdgeBL[139] = 13;
  isoBandEdgeLB[139] = isoBandEdgeTL[139] = 20;
  isoBandEdgeRT[98] = isoBandEdgeBL[98] = 9;
  isoBandEdgeRB[98] = isoBandEdgeBR[98] = 12;
  isoBandEdgeLT[98] = isoBandEdgeTL[98] = 22;
  isoBandEdgeRT[99] = isoBandEdgeTL[99] = 0;
  isoBandEdgeRB[99] = isoBandEdgeBR[99] = 12;
  isoBandEdgeBL[99] = isoBandEdgeLT[99] = 19;
  isoBandEdgeRB[38] = isoBandEdgeBR[38] = 12;
  isoBandEdgeLB[38] = isoBandEdgeTR[38] = 21;
  isoBandEdgeLT[38] = isoBandEdgeTL[38] = 22;
  isoBandEdgeRB[39] = isoBandEdgeTR[39] = 5;
  isoBandEdgeBR[39] = isoBandEdgeLB[39] = 16;
  isoBandEdgeLT[39] = isoBandEdgeTL[39] = 22;

  /*
  ####################################
  Some small helper functions
  ####################################
  */

  /* assume that x1 == 1 &&  x0 == 0 */
  function interpolateX(y, y0, y1){
    return (y - y0) / (y1 - y0);
  }

  /*
  ####################################
  Below is the actual Marching Squares implementation
  ####################################
  */

  var computeBandGrid = function(data, minV, bandwidth){
    var rows = data.length - 1;
    var cols = data[0].length - 1;
    var BandGrid = { rows: rows, cols: cols, cells: [] };

    var maxV = minV + Math.abs(bandwidth);

    for(var j = 0; j < rows; ++j){
      BandGrid.cells[j] = [];
      for(var i = 0; i < cols; ++i){
        /*  compose the 4-trit corner representation */
        var cval = 0;

        var tl = data[j+1][i];
        var tr = data[j+1][i+1];
        var br = data[j][i+1];
        var bl = data[j][i];

        if(isNaN(tl) || isNaN(tr) || isNaN(br) || isNaN(bl)){
          continue;
        }

        cval |= (tl < minV) ? 0 : (tl > maxV) ? 128 : 64;
        cval |= (tr < minV) ? 0 : (tr > maxV) ? 32 : 16;
        cval |= (br < minV) ? 0 : (br > maxV) ? 8 : 4;
        cval |= (bl < minV) ? 0 : (bl > maxV) ? 2 : 1;

        var cval_real = +cval;

        /* resolve ambiguity via averaging */
        var flipped = 0;
        if(     (cval == 17) /* 0101 */
            ||  (cval == 18) /* 0102 */
            ||  (cval == 33) /* 0201 */
            ||  (cval == 34) /* 0202 */
            ||  (cval == 38) /* 0212 */
            ||  (cval == 68) /* 1010 */
            ||  (cval == 72) /* 1020 */
            ||  (cval == 98) /* 1202 */
            ||  (cval == 102) /* 1212 */
            ||  (cval == 132) /* 2010 */
            ||  (cval == 136) /* 2020 */
            ||  (cval == 137) /* 2021 */
            ||  (cval == 152) /* 2120 */
            ||  (cval == 153) /* 2121 */
        ){
          var average = (tl + tr + br + bl) / 4;
          /* set flipped state */
          flipped = (average > maxV) ? 2 : (average < minV) ? 0 : 1;

          /* adjust cval for flipped cases */

          /* 8-sided cases */
          if(cval === 34){
            if(flipped === 1){
              cval = 35;
            } else if(flipped === 0){
              cval = 136;
            }
          } else if(cval === 136){
            if(flipped === 1){
              cval = 35;
              flipped = 4;
            } else if(flipped === 0){
              cval = 34;
            }
          }

          /* 6-sided polygon cases */
          else if(cval === 17){
            if(flipped === 1){
              cval = 155;
              flipped = 4;
            } else if(flipped === 0){
              cval = 153;
            }
          } else if(cval === 68){
            if(flipped === 1){
              cval = 103;
              flipped = 4;
            } else if(flipped === 0){
              cval = 102;
            }
          } else if(cval === 153){
            if(flipped === 1)
              { cval = 155; }
          } else if(cval === 102){
            if(flipped === 1)
              { cval = 103; }
          }

          /* 7-sided polygon cases */
          else if(cval === 152){
            if(flipped < 2){
              cval    = 156;
              flipped = 1;
            }
          } else if(cval === 137){
            if(flipped < 2){
              cval = 139;
              flipped = 1;
            }
          } else if(cval === 98){
            if(flipped < 2){
              cval    = 99;
              flipped = 1;
            }
          } else if(cval === 38){
            if(flipped < 2){
              cval    = 39;
              flipped = 1;
            }
          } else if(cval === 18){
            if(flipped > 0){
              cval = 156;
              flipped = 4;
            } else {
              cval = 152;
            }
          } else if(cval === 33){
            if(flipped > 0){
              cval = 139;
              flipped = 4;
            } else {
              cval = 137;
            }
          } else if(cval === 72){
            if(flipped > 0){
              cval = 99;
              flipped = 4;
            } else {
              cval = 98;
            }
          } else if(cval === 132){
            if(flipped > 0){
              cval = 39;
              flipped = 4;
            } else {
              cval = 38;
            }
          }
        }

        /* add cell to BandGrid if it contains at least one polygon-side */
        if((cval != 0) && (cval != 170)){
          var topleft, topright, bottomleft, bottomright,
              righttop, rightbottom, lefttop, leftbottom;

          topleft = topright = bottomleft = bottomright = righttop
                  = rightbottom = lefttop = leftbottom = 0.5;

          var edges = [];

          /* do interpolation here */
          /* 1st Triangles */
          if(cval === 1){ /* 0001 */
            bottomleft = 1 - interpolateX(minV, br, bl);
            leftbottom = 1 - interpolateX(minV, tl, bl);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 169){ /* 2221 */
            bottomleft = interpolateX(maxV, bl, br);
            leftbottom = interpolateX(maxV, bl, tl);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 4){ /* 0010 */
            rightbottom = 1 - interpolateX(minV, tr, br);
            bottomright = interpolateX(minV, bl, br);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 166){ /* 2212 */
            rightbottom = interpolateX(maxV, br, tr);
            bottomright = 1 - interpolateX(maxV, br, bl);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 16){ /* 0100 */
            righttop = interpolateX(minV, br, tr);
            topright = interpolateX(minV, tl, tr);
            edges.push(isoBandEdgeRT[cval]);
          } else if(cval === 154){ /* 2122 */
            righttop = 1 - interpolateX(maxV, tr, br);
            topright = 1 - interpolateX(maxV, tr, tl);
            edges.push(isoBandEdgeRT[cval]);
          } else if(cval === 64){ /* 1000 */
            lefttop = interpolateX(minV, bl, tl);
            topleft = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 106){ /* 1222 */
            lefttop = 1 - interpolateX(maxV, tl, bl);
            topleft = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeLT[cval]);
          }
          /* 2nd Trapezoids */
          else if(cval === 168){ /* 2220 */
            bottomright = interpolateX(maxV, bl, br);
            bottomleft = interpolateX(minV, bl, br);
            leftbottom = interpolateX(minV, bl, tl);
            lefttop = interpolateX(maxV, bl, tl);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 2){ /* 0002 */
            bottomright = 1 - interpolateX(minV, br, bl);
            bottomleft = 1 - interpolateX(maxV, br, bl);
            leftbottom = 1 - interpolateX(maxV, tl, bl);
            lefttop = 1 - interpolateX(minV, tl, bl);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 162){ /* 2202 */
            righttop = interpolateX(maxV, br, tr);
            rightbottom = interpolateX(minV, br, tr);
            bottomright = 1 - interpolateX(minV, br, bl);
            bottomleft = 1 - interpolateX(maxV, br, bl);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 8){ /* 0020 */
            righttop = 1 - interpolateX(minV, tr, br);
            rightbottom = 1 - interpolateX(maxV, tr, br);
            bottomright = interpolateX(maxV, bl, br);
            bottomleft = interpolateX(minV, bl, br);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 138){ /* 2022 */
            righttop = 1 - interpolateX(minV, tr, br);
            rightbottom = 1 - interpolateX(maxV, tr, br);
            topleft = 1 - interpolateX(maxV, tr, tl);
            topright = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 32){ /* 0200 */
            righttop = interpolateX(maxV, br, tr);
            rightbottom = interpolateX(minV, br, tr);
            topleft = interpolateX(minV, tl, tr);
            topright = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 42){ /* 0222 */
            leftbottom = 1 - interpolateX(maxV, tl, bl);
            lefttop = 1 - interpolateX(minV, tl, bl);
            topleft = interpolateX(minV, tl, tr);
            topright = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeLB[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 128){ /* 2000 */
            leftbottom = interpolateX(minV, bl, tl);
            lefttop = interpolateX(maxV, bl, tl);
            topleft = 1 - interpolateX(maxV, tr, tl);
            topright = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeLB[cval]);
            edges.push(isoBandEdgeLT[cval]);
          }

          /* 3rd rectangle cases */
          if(cval === 5){ /* 0011 */
            rightbottom = 1 - interpolateX(minV, tr, br);
            leftbottom = 1 - interpolateX(minV, tl, bl);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 165){ /* 2211 */
            rightbottom = interpolateX(maxV, br, tr);
            leftbottom = interpolateX(maxV, bl, tl);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 20){ /* 0110 */
            bottomright = interpolateX(minV, bl, br);
            topright = interpolateX(minV, tl, tr);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 150){ /* 2112 */
            bottomright = 1 - interpolateX(maxV, br, bl);
            topright = 1 - interpolateX(maxV, tr, tl);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 80){ /* 1100 */
            righttop = interpolateX(minV, br, tr);
            lefttop = interpolateX(minV, bl, tl);
            edges.push(isoBandEdgeRT[cval]);
          } else if(cval === 90){ /* 1122 */
            righttop = 1 - interpolateX(maxV, tr, br);
            lefttop = 1 - interpolateX(maxV, tl, bl);
            edges.push(isoBandEdgeRT[cval]);
          } else if(cval === 65){ /* 1001 */
            bottomleft = 1 - interpolateX(minV, br, bl);
            topleft = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 105){ /* 1221 */
            bottomleft = interpolateX(maxV, bl, br);
            topleft = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 160){ /* 2200 */
            righttop = interpolateX(maxV, br, tr);
            rightbottom = interpolateX(minV, br, tr);
            leftbottom = interpolateX(minV, bl, tl);
            lefttop = interpolateX(maxV, bl, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 10){ /* 0022 */
            righttop = 1 - interpolateX(minV, tr, br);
            rightbottom = 1 - interpolateX(maxV, tr, br);
            leftbottom = 1 - interpolateX(maxV, tl, bl);
            lefttop = 1 - interpolateX(minV, tl, bl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 130){ /* 2002 */
            bottomright = 1 - interpolateX(minV, br, bl);
            bottomleft = 1 - interpolateX(maxV, br, bl);
            topleft = 1 - interpolateX(maxV, tr, tl);
            topright = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 40){ /* 0220 */
            bottomright = interpolateX(maxV, bl, br);
            bottomleft = interpolateX(minV, bl, br);
            topleft = interpolateX(minV, tl, tr);
            topright = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeBL[cval]);
          }

          /* 4th single pentagon cases */
          else if(cval === 101){ /* 1211 */
            rightbottom = interpolateX(maxV, br, tr);
            topleft = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 69){ /* 1011 */
            rightbottom = 1 - interpolateX(minV, tr, br);
            topleft = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 149){ /* 2111 */
            leftbottom = interpolateX(maxV, bl, tl);
            topright = 1 - interpolateX(maxV, tr, tl);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 21){ /* 0111 */
            leftbottom = 1 - interpolateX(minV, tl, bl);
            topright = interpolateX(minV, tl, tr);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 86){ /* 1112 */
            bottomright = 1 - interpolateX(maxV, br, bl);
            lefttop = 1 - interpolateX(maxV, tl, bl);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 84){ /* 1110 */
            bottomright = interpolateX(minV, bl, br);
            lefttop = interpolateX(minV, bl, tl);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 89){ /* 1121 */
            righttop = 1 - interpolateX(maxV, tr, br);
            bottomleft = interpolateX(maxV, bl, br);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 81){ /* 1101 */
            righttop = interpolateX(minV, br, tr);
            bottomleft = 1 - interpolateX(minV, br, bl);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 96){ /* 1200 */
            righttop = interpolateX(maxV, br, tr);
            rightbottom = interpolateX(minV, br, tr);
            lefttop = interpolateX(minV, bl, tl);
            topleft = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 74){ /* 1022 */
            righttop = 1 - interpolateX(minV, tr, br);
            rightbottom = 1- interpolateX(maxV, tr, br);
            lefttop = 1 - interpolateX(maxV, tl, bl);
            topleft = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 24){ /* 0120 */
            righttop = 1 - interpolateX(maxV, tr, br);
            bottomright = interpolateX(maxV, bl, br);
            bottomleft = interpolateX(minV, bl, br);
            topright = interpolateX(minV, tl, tr);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 146){ /* 2102 */
            righttop = interpolateX(minV, br, tr);
            bottomright = 1 - interpolateX(minV, br, bl);
            bottomleft = 1 - interpolateX(maxV, br, bl);
            topright = 1 - interpolateX(maxV, tr, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 6){ /* 0012 */
            rightbottom = 1 - interpolateX(minV, tr, br);
            bottomright = 1 - interpolateX(maxV, br, bl);
            leftbottom = 1 - interpolateX(maxV, tl, bl);
            lefttop = 1 - interpolateX(minV, tl, bl);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 164){ /* 2210 */
            rightbottom = interpolateX(maxV, br, tr);
            bottomright = interpolateX(minV, bl, br);
            leftbottom = interpolateX(minV, bl, tl);
            lefttop = interpolateX(maxV, bl, tl);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 129){ /* 2001 */
            bottomleft = 1 - interpolateX(minV, br, bl);
            leftbottom = interpolateX(maxV, bl, tl);
            topleft = 1 - interpolateX(maxV, tr, tl);
            topright = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeBL[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 41){ /* 0221 */
            bottomleft = interpolateX(maxV, bl, br);
            leftbottom = 1 - interpolateX(minV, tl, bl);
            topleft = interpolateX(minV, tl, tr);
            topright = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeBL[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 66){ /* 1002 */
            bottomright = 1 - interpolateX(minV, br, bl);
            bottomleft = 1 - interpolateX(maxV, br, bl);
            lefttop = 1 - interpolateX(maxV, tl, bl);
            topleft = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 104){ /* 1220 */
            bottomright = interpolateX(maxV, bl, br);
            bottomleft = interpolateX(minV, bl, br);
            lefttop = interpolateX(minV, bl, tl);
            topleft = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeBL[cval]);
            edges.push(isoBandEdgeTL[cval]);
          } else if(cval === 144){ /* 2100 */
            righttop = interpolateX(minV, br, tr);
            leftbottom = interpolateX(minV, bl, tl);
            lefttop = interpolateX(maxV, bl, tl);
            topright = 1 - interpolateX(maxV, tr, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 26){ /* 0122 */
            righttop = 1 - interpolateX(maxV, tr, br);
            leftbottom = 1 - interpolateX(maxV, tl, bl);
            lefttop = 1 - interpolateX(minV, tl, bl);
            topright = interpolateX(minV, tl, tr);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 36){ /* 0210 */
            rightbottom = interpolateX(maxV, br, tr);
            bottomright = interpolateX(minV, bl, br);
            topleft = interpolateX(minV, tl, tr);
            topright = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 134){ /* 2012 */
            rightbottom = 1 - interpolateX(minV, tr, br);
            bottomright = 1 - interpolateX(maxV, br, bl);
            topleft = 1 - interpolateX(maxV, tr, tl);
            topright = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 9){ /* 0021 */
            righttop = 1 - interpolateX(minV, tr, br);
            rightbottom = 1 - interpolateX(maxV, tr, br);
            bottomleft = interpolateX(maxV, bl, br);
            leftbottom = 1 - interpolateX(minV, tl, bl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 161){ /* 2201 */
            righttop = interpolateX(maxV, br, tr);
            rightbottom = interpolateX(minV, br, tr);
            bottomleft = 1 - interpolateX(minV, br, bl);
            leftbottom = interpolateX(maxV, bl, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          }

          /* 5th single hexagon cases */
          else if(cval === 37){ /* 0211 */
            rightbottom = interpolateX(maxV, br, tr);
            leftbottom = 1- interpolateX(minV, tl, bl);
            topleft = interpolateX(minV, tl, tr);
            topright = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 133){ /* 2011 */
            rightbottom = 1 - interpolateX(minV, tr, br);
            leftbottom = interpolateX(maxV, bl, tl);
            topleft = 1 - interpolateX(maxV, tr, tl);
            topright = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 148){ /* 2110 */
            bottomright = interpolateX(minV, bl, br);
            leftbottom = interpolateX(minV, bl, tl);
            lefttop = interpolateX(maxV, bl, tl);
            topright = 1 - interpolateX(maxV, tr, tl);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 22){ /* 0112 */
            bottomright = 1 - interpolateX(maxV, br, bl);
            leftbottom = 1 - interpolateX(maxV, tl, bl);
            lefttop = 1 - interpolateX(minV, tl, bl);
            topright = interpolateX(minV, tl, tr);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 82){ /* 1102 */
            righttop = interpolateX(minV, br, tr);
            bottomright = 1- interpolateX(minV, br, bl);
            bottomleft = 1 - interpolateX(maxV, br, bl);
            lefttop = 1 - interpolateX(maxV, tl, bl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 88){ /* 1120 */
            righttop = 1 - interpolateX(maxV, tr, br);
            bottomright = interpolateX(maxV, bl, br);
            bottomleft = interpolateX(minV, bl, br);
            lefttop = interpolateX(minV, bl, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 73){ /* 1021 */
            righttop = 1 - interpolateX(minV, tr, br);
            rightbottom = 1 - interpolateX(maxV, tr, br);
            bottomleft = interpolateX(maxV, bl, br);
            topleft = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 97){ /* 1201 */
            righttop = interpolateX(maxV, br, tr);
            rightbottom = interpolateX(minV, br, tr);
            bottomleft = 1 - interpolateX(minV, br, bl);
            topleft = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
          } else if(cval === 145){ /* 2101 */
            righttop = interpolateX(minV, br, tr);
            bottomleft = 1 - interpolateX(minV, br, bl);
            leftbottom = interpolateX(maxV, bl, tl);
            topright = 1 - interpolateX(maxV, tr, tl);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 25){ /* 0121 */
            righttop = 1 - interpolateX(maxV, tr, br);
            bottomleft = interpolateX(maxV, bl, br);
            leftbottom = 1 - interpolateX(minV, tl, bl);
            topright = interpolateX(minV, tl, tr);
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 70){ /* 1012 */
            rightbottom = 1 - interpolateX(minV, tr, br);
            bottomright = 1 - interpolateX(maxV, br, bl);
            lefttop = 1 - interpolateX(maxV, tl, bl);
            topleft = 1 - interpolateX(minV, tr, tl);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
          } else if(cval === 100){ /* 1210 */
            rightbottom = interpolateX(maxV, br, tr);
            bottomright = interpolateX(minV, bl, br);
            lefttop = interpolateX(minV, bl, tl);
            topleft = interpolateX(maxV, tl, tr);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
          }

          /* 8-sided cases */
          else if(cval === 34){ /* 0202 || 2020 with flipped == 0 */
            if(flipped === 0){
              righttop = 1 - interpolateX(minV, tr, br);
              rightbottom = 1 - interpolateX(maxV, tr, br);
              bottomright = interpolateX(maxV, bl, br);
              bottomleft = interpolateX(minV, bl, br);
              leftbottom = interpolateX(minV, bl, tl);
              lefttop = interpolateX(maxV, bl, tl);
              topleft = 1 - interpolateX(maxV, tr, tl);
              topright = 1 - interpolateX(minV, tr, tl);
            } else {
              righttop = interpolateX(maxV, br, tr);
              rightbottom = interpolateX(minV, br, tr);
              bottomright = 1 - interpolateX(minV, br, bl);
              bottomleft = 1 - interpolateX(maxV, br, bl);
              leftbottom = 1 - interpolateX(maxV, tl, bl);
              lefttop = 1 - interpolateX(minV, tl, bl);
              topleft = interpolateX(minV, tl, tr);
              topright = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLB[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 35){ /* flipped == 1 state for 0202, and 2020 with flipped == 4*/
            if(flipped === 4){
              righttop = 1 - interpolateX(minV, tr, br);
              rightbottom = 1 - interpolateX(maxV, tr, br);
              bottomright = interpolateX(maxV, bl, br);
              bottomleft = interpolateX(minV, bl, br);
              leftbottom = interpolateX(minV, bl, tl);
              lefttop = interpolateX(maxV, bl, tl);
              topleft = 1 - interpolateX(maxV, tr, tl);
              topright = 1 - interpolateX(minV, tr, tl);
            } else {
              righttop = interpolateX(maxV, br, tr);
              rightbottom = interpolateX(minV, br, tr);
              bottomright = 1 - interpolateX(minV, br, bl);
              bottomleft = 1 - interpolateX(maxV, br, bl);
              leftbottom = 1 - interpolateX(maxV, tl, bl);
              lefttop = 1 - interpolateX(minV, tl, bl);
              topleft = interpolateX(minV, tl, tr);
              topright = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBL[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 136){ /* 2020 || 0202 with flipped == 0 */
            if(flipped === 0){
              righttop = interpolateX(maxV, br, tr);
              rightbottom = interpolateX(minV, br, tr);
              bottomright = 1 - interpolateX(minV, br, bl);
              bottomleft = 1 - interpolateX(maxV, br, bl);
              leftbottom = 1 - interpolateX(maxV, tl, bl);
              lefttop = 1 - interpolateX(minV, tl, bl);
              topleft = interpolateX(minV, tl, tr);
              topright = interpolateX(maxV, tl, tr);
            } else {
              righttop = 1 - interpolateX(minV, tr, br);
              rightbottom = 1 - interpolateX(maxV, tr, br);
              bottomright = interpolateX(maxV, bl, br);
              bottomleft = interpolateX(minV, bl, br);
              leftbottom = interpolateX(minV, bl, tl);
              lefttop = interpolateX(maxV, bl, tl);
              topleft = 1 - interpolateX(maxV, tr, tl);
              topright = 1 - interpolateX(minV, tr, tl);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLB[cval]);
            edges.push(isoBandEdgeLT[cval]);
          }

          /* 6-sided polygon cases */
          else if(cval === 153){ /* 0101 with flipped == 0 || 2121 with flipped == 2 */
            if(flipped === 0){
              righttop = interpolateX(minV, br, tr);
              bottomleft = 1 - interpolateX(minV, br, bl);
              leftbottom = 1 - interpolateX(minV, tl, bl);
              topright = interpolateX(minV, tl, tr);
            } else {
              righttop = 1 - interpolateX(maxV, tr, br);
              bottomleft = interpolateX(maxV, bl, br);
              leftbottom = interpolateX(maxV, bl, tl);
              topright = 1 - interpolateX(maxV, tr, tl);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 102){ /* 1010 with flipped == 0 || 1212 with flipped == 2 */
            if(flipped === 0){
              rightbottom = 1 - interpolateX(minV, tr, br);
              bottomright = interpolateX(minV, bl, br);
              lefttop = interpolateX(minV, bl, tl);
              topleft = 1 - interpolateX(minV, tr, tl);
            } else {
              rightbottom = interpolateX(maxV, br, tr);
              bottomright = 1 - interpolateX(maxV, br, bl);
              lefttop = 1 - interpolateX(maxV, tl, bl);
              topleft = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 155){ /* 0101 with flipped == 4 || 2121 with flipped == 1 */
            if(flipped === 4){
              righttop = interpolateX(minV, br, tr);
              bottomleft = 1 - interpolateX(minV, br, bl);
              leftbottom = 1 - interpolateX(minV, tl, bl);
              topright = interpolateX(minV, tl, tr);
            } else {
              righttop = 1 - interpolateX(maxV, tr, br);
              bottomleft = interpolateX(maxV, bl, br);
              leftbottom = interpolateX(maxV, bl, tl);
              topright = 1 - interpolateX(maxV, tr, tl);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 103){ /* 1010 with flipped == 4 || 1212 with flipped == 1 */
            if(flipped === 4){
              rightbottom = 1 - interpolateX(minV, tr, br);
              bottomright = interpolateX(minV, bl, br);
              lefttop = interpolateX(minV, bl, tl);
              topleft = 1 - interpolateX(minV, tr, tl);
            } else {
              rightbottom = interpolateX(maxV, br, tr);
              bottomright = 1 - interpolateX(maxV, br, bl);
              lefttop = 1 - interpolateX(maxV, tl, bl);
              topleft = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
          }

          /* 7-sided polygon cases */
          else if(cval === 152){ /* 2120 with flipped == 2 || 0102 with flipped == 0 */
            if(flipped === 0){
              righttop = interpolateX(minV, br, tr);
              bottomright = 1 - interpolateX(minV, br, bl);
              bottomleft = 1 - interpolateX(maxV, br, bl);
              leftbottom = 1 - interpolateX(maxV, tl, bl);
              lefttop = 1 - interpolateX(minV, tl, bl);
              topright = interpolateX(minV, tl, tr);
            } else {
              righttop = 1 - interpolateX(maxV, tr, br);
              bottomright = interpolateX(maxV, bl, br);
              bottomleft = interpolateX(minV, bl, br);
              leftbottom = interpolateX(minV, bl, tl);
              lefttop = interpolateX(maxV, bl, tl);
              topright = 1 - interpolateX(maxV, tr, tl);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 156){ /* 2120 with flipped == 1 || 0102 with flipped == 4 */
            if(flipped === 4){
              righttop = interpolateX(minV, br, tr);
              bottomright = 1 - interpolateX(minV, br, bl);
              bottomleft = 1 - interpolateX(maxV, br, bl);
              leftbottom = 1 - interpolateX(maxV, tl, bl);
              lefttop = 1 - interpolateX(minV, tl, bl);
              topright = interpolateX(minV, tl, tr);
            } else {
              righttop = 1 - interpolateX(maxV, tr, br);
              bottomright = interpolateX(maxV, bl, br);
              bottomleft = interpolateX(minV, bl, br);
              leftbottom = interpolateX(minV, bl, tl);
              lefttop = interpolateX(maxV, bl, tl);
              topright = 1 - interpolateX(maxV, tr, tl);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeBL[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 137){ /* 2021 with flipped == 2 || 0201 with flipped == 0 */
            if(flipped === 0){
              righttop = interpolateX(maxV, br, tr);
              rightbottom = interpolateX(minV, br, tr);
              bottomleft = 1 - interpolateX(minV, br, bl);
              leftbottom = 1 - interpolateX(minV, tl, bl);
              topleft = interpolateX(minV, tl, tr);
              topright = interpolateX(maxV, tl, tr);
            } else {
              righttop = 1 - interpolateX(minV, tr, br);
              rightbottom = 1 - interpolateX(maxV, tr, br);
              bottomleft = interpolateX(maxV, bl, br);
              leftbottom = interpolateX(maxV, bl, tl);
              topleft = 1 - interpolateX(maxV, tr, tl);
              topright = 1 - interpolateX(minV, tr, tl);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 139){ /* 2021 with flipped == 1 || 0201 with flipped == 4 */
            if(flipped === 4){
              righttop = interpolateX(maxV, br, tr);
              rightbottom = interpolateX(minV, br, tr);
              bottomleft = 1 - interpolateX(minV, br, bl);
              leftbottom = 1 - interpolateX(minV, tl, bl);
              topleft = interpolateX(minV, tl, tr);
              topright = interpolateX(maxV, tl, tr);
            } else {
              righttop = 1 - interpolateX(minV, tr, br);
              rightbottom = 1 - interpolateX(maxV, tr, br);
              bottomleft = interpolateX(maxV, bl, br);
              leftbottom = interpolateX(maxV, bl, tl);
              topleft = 1 - interpolateX(maxV, tr, tl);
              topright = 1 - interpolateX(minV, tr, tl);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLB[cval]);
          } else if(cval === 98){ /* 1202 with flipped == 2 || 1020 with flipped == 0 */
            if(flipped === 0){
              righttop = 1 - interpolateX(minV, tr, br);
              rightbottom = 1 - interpolateX(maxV, tr, br);
              bottomright = interpolateX(maxV, bl, br);
              bottomleft = interpolateX(minV, bl, br);
              lefttop = interpolateX(minV, bl, tl);
              topleft = 1 - interpolateX(minV, tr, tl);
            } else {
              righttop = interpolateX(maxV, br, tr);
              rightbottom = interpolateX(minV, br, tr);
              bottomright = 1 - interpolateX(minV, br, bl);
              bottomleft = 1 - interpolateX(maxV, br, bl);
              lefttop = 1 - interpolateX(maxV, tl, bl);
              topleft = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 99){ /* 1202 with flipped == 1 || 1020 with flipped == 4 */
            if(flipped === 4){
              righttop = 1 - interpolateX(minV, tr, br);
              rightbottom = 1 - interpolateX(maxV, tr, br);
              bottomright = interpolateX(maxV, bl, br);
              bottomleft = interpolateX(minV, bl, br);
              lefttop = interpolateX(minV, bl, tl);
              topleft = 1 - interpolateX(minV, tr, tl);
            } else {
              righttop = interpolateX(maxV, br, tr);
              rightbottom = interpolateX(minV, br, tr);
              bottomright = 1 - interpolateX(minV, br, bl);
              bottomleft = 1 - interpolateX(maxV, br, bl);
              lefttop = 1 - interpolateX(maxV, tl, bl);
              topleft = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRT[cval]);
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBL[cval]);
          } else if(cval === 38){ /* 0212 with flipped == 2 || 2010 with flipped == 0 */
            if(flipped === 0){
              rightbottom = 1 - interpolateX(minV, tr, br);
              bottomright = interpolateX(minV, bl, br);
              leftbottom = interpolateX(minV, bl, tl);
              lefttop = interpolateX(maxV, bl, tl);
              topleft = 1 - interpolateX(maxV, tr, tl);
              topright = 1 - interpolateX(minV, tr, tl);
            } else {
              rightbottom = interpolateX(maxV, br, tr);
              bottomright = 1 - interpolateX(maxV, br, bl);
              leftbottom = 1 - interpolateX(maxV, tl, bl);
              lefttop = 1 - interpolateX(minV, tl, bl);
              topleft = interpolateX(minV, tl, tr);
              topright = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeLB[cval]);
            edges.push(isoBandEdgeLT[cval]);
          } else if(cval === 39){ /* 0212 with flipped == 1 || 2010 with flipped == 4 */
            if(flipped === 4){
              rightbottom = 1 - interpolateX(minV, tr, br);
              bottomright = interpolateX(minV, bl, br);
              leftbottom = interpolateX(minV, bl, tl);
              lefttop = interpolateX(maxV, bl, tl);
              topleft = 1 - interpolateX(maxV, tr, tl);
              topright = 1 - interpolateX(minV, tr, tl);
            } else {
              rightbottom = interpolateX(maxV, br, tr);
              bottomright = 1 - interpolateX(maxV, br, bl);
              leftbottom = 1 - interpolateX(maxV, tl, bl);
              lefttop = 1 - interpolateX(minV, tl, bl);
              topleft = interpolateX(minV, tl, tr);
              topright = interpolateX(maxV, tl, tr);
            }
            edges.push(isoBandEdgeRB[cval]);
            edges.push(isoBandEdgeBR[cval]);
            edges.push(isoBandEdgeLT[cval]);
          }

          else if(cval === 85){
            righttop = 1;
            rightbottom = 0;
            bottomright = 1;
            bottomleft = 0;
            leftbottom = 0;
            lefttop = 1;
            topleft = 0;
            topright = 1;
          }

          if(topleft < 0 || topleft > 1 || topright < 0 || topright > 1 || righttop < 0 || righttop > 1 || bottomright < 0 || bottomright > 1 || leftbottom < 0 || leftbottom > 1 || lefttop < 0 || lefttop > 1){
            console.log(cval + " " + cval_real + " " + tl + "," + tr + "," + br + "," + bl + " " + flipped + " " + topleft + " " + topright + " " + righttop + " " + rightbottom + " " + bottomright + " " + bottomleft + " " + leftbottom + " " + lefttop);
          }

          BandGrid.cells[j][i] = {
                                    cval:         cval,
                                    cval_real:    cval_real,
                                    flipped:      flipped,
                                    topleft:      topleft,
                                    topright:     topright,
                                    righttop:     righttop,
                                    rightbottom:  rightbottom,
                                    bottomright:  bottomright,
                                    bottomleft:   bottomleft,
                                    leftbottom:   leftbottom,
                                    lefttop:      lefttop,
                                    edges:        edges
                                };
        }
      }
    }

    return BandGrid;
  };

  function BandGrid2AreaPaths(grid){
    var areas = [];
    var area_idx = 0;
    var rows = grid.rows;
    var cols = grid.cols;
    var currentPolygon = [];

    for(var j = 0; j < rows; j++){
      for(var i = 0; i < cols; i++){
        if((typeof grid.cells[j][i] !== 'undefined') && (grid.cells[j][i].edges.length > 0)){
          /* trace back polygon path starting from this cell */
          var o = 0,
              x = i,
              y = j;

          var cell = grid.cells[j][i];
          /* get start coordinates */
          var cval = cell.cval;

          var prev  = getStartXY(cell),
              next  = null,
              p     = i,
              q     = j;

          if(prev !== null){
            currentPolygon.push([ prev.p[0] + p, prev.p[1] + q ]);
            //console.log(cell);
            //console.log("coords: " + (prev.p[0] + p) + " " + (prev.p[1] + q));
          }

          do{
            //console.log(p + "," + q);
            //console.log(grid.cells[q][p]);
            //console.log(grid.cells[q][p].edges);
            //console.log("from : " + prev.x + " " + prev.y + " " + prev.o);

            next = getExitXY(grid.cells[q][p], prev.x, prev.y, prev.o);
            if(next !== null){
              //console.log("coords: " + (next.p[0] + p) + " " + (next.p[1] + q));
              currentPolygon.push([ next.p[0] + p, next.p[1] + q ]);
              p += next.x;
              q += next.y;
              prev = next;
            } else {
              //console.log("getExitXY() returned null!");
              break;
            }
            //console.log("to : " + next.x + " " + next.y + " " + next.o);
            /* special case, where we've reached the grid boundaries */
            if((q < 0) || (q >= rows) || (p < 0) || (p >= cols) || (typeof grid.cells[q][p] === 'undefined')){
              /* to create a closed path, we need to trace our way
                  arround the missing data, until we find an entry
                  point again
              */

              /* set back coordinates of current cell */
              p -= next.x;
              q -= next.y;

              //console.log("reached boundary at " + p + " " + q);

              var missing = traceOutOfGridPath(grid, p, q, next.x, next.y, next.o);
              if(missing !== null){
                missing.path.forEach(function(pp){
                  //console.log("coords: " + (pp[0]) + " " + (pp[1]));
                  currentPolygon.push(pp);
                });
                p = missing.i;
                q = missing.j;
                prev = missing;
              } else {
                break;
              }
              //console.log(grid.cells[q][p]);
            }
          } while(    (typeof grid.cells[q][p] !== 'undefined')
                   && (grid.cells[q][p].edges.length > 0));

          areas.push(currentPolygon);
          //console.log("next polygon");
          //console.log(currentPolygon);
          currentPolygon = [];
          if(grid.cells[j][i].edges.length > 0)
            { i--; }
        }
      }
    }
    return areas;
  }

  function traceOutOfGridPath(grid, i, j, d_x, d_y, d_o){
    var cell = grid.cells[j][i];
    var cval = cell.cval_real;
    var p = i + d_x,
        q = j + d_y;
    var path = [];
    var rows = grid.rows;
    var cols = grid.cols;
    var closed = false;

    while(!closed){
      //console.log("processing cell " + p + "," + q + " " + d_x + " " + d_y + " " + d_o);
      if((typeof grid.cells[q] === 'undefined') || (typeof grid.cells[q][p] === 'undefined')){
        //console.log("which is undefined");
        /* we can't move on, so we have to change direction to proceed further */

        /* go back to previous cell */
        q -= d_y;
        p -= d_x;
        cell = grid.cells[q][p];
        cval = cell.cval_real;

        /* check where we've left defined cells of the grid... */
        if(d_y === -1){ /* we came from top */
          if(d_o === 0){  /* exit left */
            if(cval & Node3){ /* lower left node is within range, so we move left */
              path.push([p, q]);
              d_x = -1;
              d_y = 0;
              d_o = 0;
            } else if(cval & Node2){ /* lower right node is within range, so we move right */
              path.push([p + 1, q]);
              d_x = 1;
              d_y = 0;
              d_o = 0;
            } else { /* close the path */
              path.push([p + cell.bottomright, q]);
              d_x = 0;
              d_y = 1;
              d_o = 1;
              closed = true;
              break;
            }
          } else {
            if(cval & Node3){
              path.push([p, q]);
              d_x = -1;
              d_y = 0;
              d_o = 0;
            } else if(cval & Node2){
              path.push([p + cell.bottomright, q]);
              d_x = 0;
              d_y = 1;
              d_o = 1;
              closed = true;
              break;
            } else {
              path.push([p + cell.bottomleft, q]);
              d_x = 0;
              d_y = 1;
              d_o = 0;
              closed = true;
              break;
            }
          }
        } else if(d_y === 1){ /* we came from bottom */
          //console.log("we came from bottom and hit a non-existing cell " + (p + d_x) + "," + (q + d_y) + "!");
          if(d_o === 0){ /* exit left */
            if(cval & Node1){ /* top right node is within range, so we move right */
              path.push([p+1,q+1]);
              d_x = 1;
              d_y = 0;
              d_o = 1;
            } else if(!(cval & Node0)){ /* found entry within same cell */
              path.push([p + cell.topright, q + 1]);
              d_x = 0;
              d_y = -1;
              d_o = 1;
              closed = true;
              //console.log("found entry from bottom at " + p + "," + q);
              break;
            } else {
              path.push([p + cell.topleft, q + 1]);
              d_x = 0;
              d_y = -1;
              d_o = 0;
              closed = true;
              break;
            }
          } else {
            if(cval & Node1){
              path.push([p+1, q+1]);
              d_x = 1;
              d_y = 0;
              d_o = 1;
            } else { /* move right */
              path.push([p+1, q+1]);
              d_x = 1;
              d_y = 0;
              d_o = 1;
              //console.log("wtf");
              //break;
            }
          }
        } else if(d_x === -1){ /* we came from right */
          //console.log("we came from right and hit a non-existing cell at " + (p + d_x) + "," + (q + d_y) + "!");
          if(d_o === 0){
            //console.log("continue at bottom");
            if(cval & Node0){
              path.push([p,q+1]);
              d_x = 0;
              d_y = 1;
              d_o = 0;
              //console.log("moving upwards to " + (p + d_x) + "," + (q + d_y) + "!");
            } else if(!(cval & Node3)){ /* there has to be an entry into the regular grid again! */
              //console.log("exiting top");
              path.push([p, q + cell.lefttop]);
              d_x = 1;
              d_y = 0;
              d_o = 1;
              closed = true;
              break;
            } else {
              //console.log("exiting bottom");
              path.push([p, q + cell.leftbottom]);
              d_x = 1;
              d_y = 0;
              d_o = 0;
              closed = true;
              break;
            }
          } else {
            //console.log("continue at top");
            if(cval & Node0){
              path.push([p,q+1]);
              d_x = 0;
              d_y = 1;
              d_o = 0;
              //console.log("moving upwards to " + (p + d_x) + "," + (q + d_y) + "!");
            } else { /* */
              console.log("wtf");
              break;
            }
          }
        } else if(d_x === 1){ /* we came from left */
          //console.log("we came from left and hit a non-existing cell " + (p + d_x) + "," + (q + d_y) + "!");
          if(d_o === 0){ /* exit bottom */
            if(cval & Node2){
              path.push([p+1,q]);
              d_x = 0;
              d_y = -1;
              d_o = 1;
            } else {
              path.push([p+1,q+cell.rightbottom]);
              d_x = -1;
              d_y = 0;
              d_o = 0;
              closed = true;
              break;
            }
          } else { /* exit top */
            if(cval & Node2){
              path.push([p+1,q]);
              d_x = 0;
              d_y = -1;
              d_o = 1;
            } else if(!(cval & Node1)){
              path.push([p + 1, q + cell.rightbottom]);
              d_x = -1;
              d_y = 0;
              d_o = 0;
              closed = true;
              break;
            } else {
              path.push([p+1,q+cell.righttop]);
              d_x = -1;
              d_y = 0;
              d_o = 1;
              break;
            }
          }
        } else { /* we came from the same cell */
          console.log("we came from nowhere!");
          break;
        }

      } else { /* try to find an entry into the regular grid again! */
        cell = grid.cells[q][p];
        cval = cell.cval_real;
        //console.log("which is defined");

        if(d_x === -1){
          if(d_o === 0){
            /* try to go downwards */
            if((typeof grid.cells[q - 1] !== 'undefined') && (typeof grid.cells[q - 1][p] !== 'undefined')){
              d_x = 0;
              d_y = -1;
              d_o = 1;
            } else if(cval & Node3){ /* proceed searching in x-direction */
              //console.log("proceeding in x-direction!");
              path.push([p, q]);
            } else { /* we must have found an entry into the regular grid */
              path.push([p + cell.bottomright, q]);
              d_x = 0;
              d_y = 1;
              d_o = 1;
              closed = true;
              //console.log("found entry from bottom at " + p + "," + q);
              break;
            }
          } else {
            if(cval & Node0) { /* proceed searchin in x-direction */
              console.log("proceeding in x-direction!");
            } else { /* we must have found an entry into the regular grid */
              console.log("found entry from top at " + p + "," + q);
              break;
            }
          }
        } else if(d_x === 1){
          if(d_o === 0){
            console.log("wtf");
            break;
          } else {
            /* try to go upwards */
            if((typeof grid.cells[q+1] !== 'undefined') && (typeof grid.cells[q+1][p] !== 'undefined')){
              d_x = 0;
              d_y = 1;
              d_o = 0;
            } else if(cval & Node1){
              path.push([p+1,q+1]);
              d_x = 1;
              d_y = 0;
              d_o = 1;
            } else { /* found an entry point into regular grid! */
              path.push([p+cell.topleft, q + 1]);
              d_x = 0;
              d_y = -1;
              d_o = 0;
              closed = true;
              //console.log("found entry from bottom at " + p + "," + q);
              break;
            }
          }
        } else if(d_y === -1){
          if(d_o === 1){
            /* try to go right */
            if(typeof grid.cells[q][p+1] !== 'undefined'){
              d_x = 1;
              d_y = 0;
              d_o = 1;
            } else if(cval & Node2){
              path.push([p+1,q]);
              d_x = 0;
              d_y = -1;
              d_o = 1;
            } else { /* found entry into regular grid! */
              path.push([p+1, q + cell.righttop]);
              d_x = -1;
              d_y = 0;
              d_o = 1;
              closed = true;
              //console.log("found entry from top at " + p + "," + q);
              break;
            }
          } else {
            console.log("wtf");
            break;
          }
        } else if(d_y === 1){
          if(d_o === 0){
            //console.log("we came from bottom left and proceed to the left");
            /* try to go left */
            if(typeof grid.cells[q][p - 1] !== 'undefined'){
              d_x = -1;
              d_y = 0;
              d_o = 0;
            } else if(cval & Node0){
              path.push([p,q+1]);
              d_x = 0;
              d_y = 1;
              d_o = 0;
            } else { /* found an entry point into regular grid! */
              path.push([p, q + cell.leftbottom]);
              d_x = 1;
              d_y = 0;
              d_o = 0;
              closed = true;
              //console.log("found entry from bottom at " + p + "," + q);
              break;
            }
          } else {
            //console.log("we came from bottom right and proceed to the right");
            console.log("wtf");
            break;
          }
        } else {
          console.log("where did we came from???");
          break;
        }

      }

      p += d_x;
      q += d_y;
      //console.log("going on to  " + p + "," + q + " via " + d_x + " " + d_y + " " + d_o);

      if((p === i) && (q === j)){ /* bail out, once we've closed a circle path */
        break;
      }

    }

    //console.log("exit with " + p + "," + q + " " + d_x + " " + d_y + " " + d_o);
    return { path: path, i: p, j: q, x: d_x, y: d_y, o: d_o };
  }

  function deleteEdge(cell, edgeIdx){
    delete cell.edges[edgeIdx];
    for(var k = edgeIdx + 1; k < cell.edges.length; k++){
      cell.edges[k-1] = cell.edges[k];
    }
    cell.edges.pop();
  }

  function getStartXY(cell){

    if(cell.edges.length > 0){
      var e = cell.edges[cell.edges.length - 1];
      //console.log("starting with edge " + e);
      var cval = cell.cval_real;
      switch(e){
        case 0:   if(cval & Node1){ /* node 1 within range */
                    return {p: [1, cell.righttop], x: -1, y: 0, o: 1};
                  } else { /* node 1 below or above threshold */
                    return {p: [cell.topleft, 1], x: 0, y: -1, o: 0};
                  }
        case 1:   if(cval & Node2){
                    return {p: [cell.topleft, 1], x: 0, y: -1, o: 0};
                  } else {
                    return {p: [1, cell.rightbottom], x: -1, y: 0, o: 0};
                  }
        case 2:   if(cval & Node2){
                    return {p: [cell.bottomright, 0], x: 0, y: 1, o: 1};
                  } else {
                    return {p: [cell.topleft, 1], x: 0, y: -1, o: 0};
                  }
        case 3:   if(cval & Node3){
                    return {p: [cell.topleft, 1], x: 0, y: -1, o: 0};
                  } else {
                    return {p: [cell.bottomleft, 0], x: 0, y: 1, o: 0};
                  }
        case 4:   if(cval & Node1){
                    return {p: [1, cell.righttop], x: -1, y: 0, o: 1};
                  } else {
                    return {p: [cell.topright, 1], x: 0, y: -1, o: 1};
                  }
        case 5:   if(cval & Node2){
                    return {p: [cell.topright, 1], x: 0, y: -1, o: 1};
                  } else {
                    return {p: [1, cell.rightbottom], x: -1, y: 0, o: 0};
                  }
        case 6:   if(cval & Node2){
                    return {p: [cell.bottomright, 0], x: 0, y: 1, o: 1};
                  } else {
                    return {p: [cell.topright, 1], x: 0, y: -1, o: 1};
                  }
        case 7:   if(cval & Node3){
                    return {p: [cell.topright, 1], x: 0, y: -1, o: 1};
                  } else {
                    return {p: [cell.bottomleft, 0], x: 0, y: 1, o: 0};
                  }
        case 8:   if(cval & Node2){
                    return {p: [cell.bottomright], x: 0, y: 1, o: 1};
                  } else {
                    return {p: [1, cell.righttop], x: -1, y: 0, o: 1};
                  }
        case 9:   if(cval & Node3){
                    return {p: [1, cell.righttop], x: -1, y: 0, o: 1};
                  } else {
                    return {p: [cell.bottomleft, 0], x: 0, y: 1, o: 0};
                  }
        case 10:  if(cval & Node3){
                    return {p: [0, cell.leftbottom], x: 1, y: 0, o: 0};
                  } else {
                    return {p: [1, cell.righttop], x: -1, y: 0, o: 1};
                  }
        case 11:  if(cval & Node0){
                    return {p: [1, cell.righttop], x: -1, y: 0, o: 1};
                  } else {
                    return {p: [0, cell.lefttop], x: 1, y: 0, o: 1};
                  }
        case 12:  if(cval & Node2){
                    return {p: [cell.bottomright, 0], x: 0, y: 1, o: 1};
                  } else {
                    return {p: [1, cell.rightbottom], x: -1, y: 0, o: 0};
                  }
        case 13:  if(cval & Node3){
                    return {p: [1, cell.rightbottom], x: -1, y: 0, o: 0};
                  } else {
                    return {p: [cell.bottomleft, 0], x: 0, y: 1, o: 0};
                  }
        case 14:  if(cval & Node3){
                    return {p: [0, cell.leftbottom], x: 1, y: 0, o: 0};
                  } else {
                    return {p: [1, cell.rightbottom], x: -1, y: 0, o: 0};
                  }
        case 15:  if(cval & Node0){
                    return {p: [1, cell.rightbottom], x: -1, y: 0, o: 0};
                  } else {
                    return {p: [0, cell.lefttop], x: 1, y: 0, o: 1};
                  }
        case 16:  if(cval & Node2){
                    return {p: [cell.bottomright, 0], x: 0, y: 1, o: 1};
                  } else {
                    return {p: [0, cell.leftbottom], x: 1, y: 0, o: 0};
                  }
        case 17:  if(cval & Node0){
                    return {p: [cell.bottomright, 0], x: 0, y: 1, o: 1};
                  } else {
                    return {p: [0, cell.lefttop], x: 1, y: 0, o: 1};
                  }
        case 18:  if(cval & Node3){
                    return {p: [0, cell.leftbottom], x: 1, y: 0, o: 0};
                  } else {
                    return {p: [cell.bottomleft, 0], x: 0, y: 1, o: 0};
                  }
        case 19:  if(cval & Node0){
                    return {p: [cell.bottomleft, 0], x: 0, y: 1, o: 0};
                  } else {
                    return {p: [0, cell.lefttop], x: 1, y: 0, o: 1};
                  }
        case 20:  if(cval & Node0){
                    return {p: [cell.topleft, 1], x: 0, y: -1, o: 0};
                  } else {
                    return {p: [0, cell.leftbottom], x: 1, y: 0, o: 0};
                  }
        case 21:  if(cval & Node1){
                    return {p: [0, cell.leftbottom], x: 1, y: 0, o: 0};
                  } else {
                    return {p: [cell.topright, 1], x: 0, y: -1, o: 1};
                  }
        case 22:  if(cval & Node0){
                    return {p: [cell.topleft, 1], x: 0, y: -1, o: 0};
                  } else {
                    return {p: [0, cell.lefttop], x: 1, y: 0, o: 1};
                  }
        case 23:  if(cval & Node1){
                    return {p: [0, cell.lefttop], x: 1, y: 0, o: 1};
                  } else {
                    return {p: [cell.topright, 1], x: 0, y: -1, o: 1};
                  }
        default:  console.log("edge index out of range!");
                  console.log(cell);
                  break;
      }
    }

    return null;
  }

  function getExitXY(cell, x, y, o){

    var e, id_x, x, y, d_x, d_y, cval = cell.cval;
    var d_o;

    switch(x){
      case -1:  switch(o){
                  case 0:   e = isoBandEdgeRB[cval];
                            d_x = isoBandNextXRB[cval];
                            d_y = isoBandNextYRB[cval];
                            d_o = isoBandNextORB[cval];
                            break;
                  default:  e = isoBandEdgeRT[cval];
                            d_x = isoBandNextXRT[cval];
                            d_y = isoBandNextYRT[cval];
                            d_o = isoBandNextORT[cval];
                            break;
                }
                break;
      case 1:   switch(o){
                  case 0:   e = isoBandEdgeLB[cval];
                            d_x = isoBandNextXLB[cval];
                            d_y = isoBandNextYLB[cval];
                            d_o = isoBandNextOLB[cval];
                            break;
                  default:  e = isoBandEdgeLT[cval];
                            d_x = isoBandNextXLT[cval];
                            d_y = isoBandNextYLT[cval];
                            d_o = isoBandNextOLT[cval];
                            break;
                }
                break;
      default:  switch(y){
                  case -1:  switch(o){
                              case 0:   e = isoBandEdgeTL[cval];
                                        d_x = isoBandNextXTL[cval];
                                        d_y = isoBandNextYTL[cval];
                                        d_o = isoBandNextOTL[cval];
                                        break;
                              default:  e = isoBandEdgeTR[cval];
                                        d_x = isoBandNextXTR[cval];
                                        d_y = isoBandNextYTR[cval];
                                        d_o = isoBandNextOTR[cval];
                                        break;
                            }
                            break;
                  case 1:   switch(o){
                              case 0:   e = isoBandEdgeBL[cval];
                                        d_x = isoBandNextXBL[cval];
                                        d_y = isoBandNextYBL[cval];
                                        d_o = isoBandNextOBL[cval];
                                        break;
                              default:  e = isoBandEdgeBR[cval];
                                        d_x = isoBandNextXBR[cval];
                                        d_y = isoBandNextYBR[cval];
                                        d_o = isoBandNextOBR[cval];
                                        break;
                            }
                            break;
                  default:  break;
                }
                break;
    }

    id_x = cell.edges.indexOf(e);
    if(typeof cell.edges[id_x] !== 'undefined'){
      deleteEdge(cell, id_x);
    } else {
      //console.log("wrong edges...");
      //console.log(x + " " + y + " " + o);
      //console.log(cell);
      return null;
    }

    cval = cell.cval_real;

    switch(e){
        case 0:   if(cval & Node1){ /* node 1 within range */
                    x = cell.topleft;
                    y = 1;
                  } else { /* node 1 below or above threshold */
                    x = 1;
                    y = cell.righttop;
                  }
                  break;
        case 1:   if(cval & Node2){
                    x = 1;
                    y = cell.rightbottom;
                  } else {
                    x = cell.topleft;
                    y = 1;
                  }
                  break;
        case 2:   if(cval & Node2){
                    x = cell.topleft;
                    y = 1;
                  } else {
                    x = cell.bottomright;
                    y = 0;
                  }
                  break;
        case 3:   if(cval & Node3){
                    x = cell.bottomleft;
                    y = 0;
                  } else {
                    x = cell.topleft;
                    y = 1;
                  }
                  break;
        case 4:   if(cval & Node1){
                    x = cell.topright;
                    y = 1;
                  } else {
                    x = 1;
                    y = cell.righttop;
                  }
                  break;
        case 5:   if(cval & Node2){
                    x = 1;
                    y = cell.rightbottom;
                  } else {
                    x = cell.topright;
                    y = 1;
                  }
                  break;
        case 6:   if(cval & Node2){
                    x = cell.topright;
                    y = 1;
                  } else {
                    x = cell.bottomright;
                    y = 0;
                  }
                  break;
        case 7:   if(cval & Node3){
                    x = cell.bottomleft;
                    y = 0;
                  } else {
                    x = cell.topright;
                    y = 1;
                  }
                  break;
        case 8:   if(cval & Node2){
                    x = 1;
                    y = cell.righttop;
                  } else {
                    x = cell.bottomright;
                    y = 0;
                  }
                  break;
        case 9:   if(cval & Node3){
                    x = cell.bottomleft;
                    y = 0;
                  } else {
                    x = 1;
                    y = cell.righttop;
                  }
                  break;
        case 10:  if(cval & Node3){
                    x = 1;
                    y = cell.righttop;
                  } else {
                    x = 0;
                    y = cell.leftbottom;
                  }
                  break;
        case 11:  if(cval & Node0){
                    x = 0;
                    y = cell.lefttop;
                  } else {
                    x = 1;
                    y = cell.righttop;
                  }
                  break;
        case 12:  if(cval & Node2){
                    x = 1;
                    y = cell.rightbottom;
                  } else {
                    x = cell.bottomright;
                    y = 0;
                  }
                  break;
        case 13:  if(cval & Node3){
                    x = cell.bottomleft;
                    y = 0;
                  } else {
                    x = 1;
                    y = cell.rightbottom;
                  }
                  break;
        case 14:  if(cval & Node3){
                    x = 1;
                    y = cell.rightbottom;
                  } else {
                    x = 0;
                    y = cell.leftbottom;
                  }
                  break;
        case 15:  if(cval & Node0){
                    x = 0;
                    y = cell.lefttop;
                  } else {
                    x = 1;
                    y = cell.rightbottom;
                  }
                  break;
        case 16:  if(cval & Node2){
                    x = 0;
                    y = cell.leftbottom;
                  } else {
                    x = cell.bottomright;
                    y = 0;
                  }
                  break;
        case 17:  if(cval & Node0){
                    x = 0;
                    y = cell.lefttop;
                  } else {
                    x = cell.bottomright;
                    y = 0;
                  }
                  break;
        case 18:  if(cval & Node3){
                    x = cell.bottomleft;
                    y = 0;
                  } else {
                    x = 0;
                    y = cell.leftbottom;
                  }
                  break;
        case 19:  if(cval & Node0){
                    x = 0;
                    y = cell.lefttop;
                  } else {
                    x = cell.bottomleft;
                    y = 0;
                  }
                  break;
        case 20:  if(cval & Node0){
                    x = 0;
                    y = cell.leftbottom;
                  } else {
                    x = cell.topleft;
                    y = 1;
                  }
                  break;
        case 21:  if(cval & Node1){
                    x = cell.topright;
                    y = 1;
                  } else {
                    x = 0;
                    y = cell.leftbottom;
                  }
                  break;
        case 22:  if(cval & Node0){
                    x = 0;
                    y = cell.lefttop;
                  } else {
                    x = cell.topleft;
                    y = 1;
                  }
                  break;
        case 23:  if(cval & Node1){
                    x = cell.topright;
                    y = 1;
                  } else {
                    x = 0;
                    y = cell.lefttop;
                  }
                  break;
        default:  console.log("edge index out of range!");
                  console.log(cell);
                  return null;
    }

    if((typeof x === 'undefined') || (typeof y === 'undefined') || (typeof d_x === 'undefined') || (typeof d_y === 'undefined') || (typeof d_o === 'undefined')){
      console.log("undefined value!");
      console.log(cell);
      console.log(x + " " + y + " " + d_x + " " + d_y + " " + d_o);
    }
    return {p: [x, y], x: d_x, y: d_y, o: d_o};
  }

  /*
  function BandGrid2Areas(grid){
    var areas = [];
    var area_idx = 0;
    var rows = grid.rows;
    var cols = grid.cols;

    grid.cells.forEach(function(g, j){
      g.forEach(function(gg, i){
        if(typeof gg !== 'undefined'){
          var a = polygon_table[gg.cval](gg);
          if((typeof a === 'object') && isArray(a)){
            if((typeof a[0] === 'object') && isArray(a[0])){
              if((typeof a[0][0] === 'object') && isArray(a[0][0])){
                a.forEach(function(aa,k){
                  aa.forEach(function(aaa){
                    aaa[0] += i;
                    aaa[1] += j;
                  });
                  areas[area_idx++] = aa;
                });
              } else {

                a.forEach(function(aa,k){
                  aa[0] += i;
                  aa[1] += j;
                });
                areas[area_idx++] = a;
              }
            } else {
              console.log("bandcell polygon with malformed coordinates");
            }
          } else {
            console.log("bandcell polygon with null coordinates");
          }
        }
      });
    });

    return areas;
  }*/

var isolines = function(data, geoTransform, intervals){
    var lines = { "type": "FeatureCollection",
    "features": []
    };
    for(var i=0; i<intervals.length; i++){
        var value = intervals[i];
        var coords = projectedIsoline(data, geoTransform, value);
       
        lines.features.push({"type": "Feature",
         "geometry": {
           "type": "MultiLineString",
          "coordinates": coords},
          "properties": [{"value": value}]}
        );
    }

    return lines;
  };

 var projectedIsoline = function(data, geoTransform, value){
    if(typeof(geoTransform) != typeof(new Array()) || geoTransform.length != 6)
        { throw new Error("GeoTransform must be a 6 elements array"); }
    var coords = isoline(data, value);

    for(var i = 0; i<coords.length; i++){
        for(var j = 0; j<coords[i].length; j++){
            var coordsGeo = applyGeoTransform$1(coords[i][j][0], coords[i][j][1], geoTransform);
            coords[i][j][0]= coordsGeo[0];
            coords[i][j][1]= coordsGeo[1];
        }
    }

    return coords;
  };

  /**
    Xgeo = GT(0) + Xpixel*GT(1) + Yline*GT(2)
    Ygeo = GT(3) + Xpixel*GT(4) + Yline*GT(5)
  */
  var applyGeoTransform$1 = function(x, y, geoTransform){
    var xgeo = geoTransform[0] + x*geoTransform[1] + y*geoTransform[2];
    var ygeo = geoTransform[3] + x*geoTransform[4] + y*geoTransform[5];
    return [xgeo, ygeo];
  };

 var isoline  = function(data, threshold, options){
    var defaultSettings = {
    successCallback:  null,
    progressCallback: null,
    verbose:          false
    };

    var settings = {};

    /* process options */
    options = options ? options : {};

    var optionKeys = Object.keys(defaultSettings);

    for(var i = 0; i < optionKeys.length; i++){
      var key = optionKeys[i];
      var val = options[key];
      val = ((typeof val !== 'undefined') && (val !== null)) ? val : defaultSettings[key];

      settings[key] = val;
    }

    if(settings.verbose)
      { console.log("computing isocontour for " + threshold); }

    var ret = ContourGrid2Paths(computeContourGrid(data, threshold));

    if(typeof settings.successCallback === 'function')
      { settings.successCallback(ret); }

    return ret;
  };

  /*
    Thats all for the public interface, below follows the actual
    implementation
  */

  /*
  ################################
  Isocontour implementation below
  ################################
  */

  /* assume that x1 == 1 &&  x0 == 0 */
  function interpolateX$1(y, y0, y1){
    return (y - y0) / (y1 - y0);
  }

  /* compute the isocontour 4-bit grid */
  function computeContourGrid(data, threshold){
    var rows = data.length - 1;
    var cols = data[0].length - 1;
    var ContourGrid = { rows: rows, cols: cols, cells: [] };

    for(var j = 0; j < rows; ++j){
      ContourGrid.cells[j] = [];
      for(var i = 0; i < cols; ++i){
        /* compose the 4-bit corner representation */
        var cval = 0;

        var tl = data[j+1][i];
        var tr = data[j+1][i+1];
        var br = data[j][i+1];
        var bl = data[j][i];

        if(isNaN(tl) || isNaN(tr) || isNaN(br) || isNaN(bl)){
          continue;
        }
        cval |= ((tl >= threshold) ? 8 : 0);
        cval |= ((tr >= threshold) ? 4 : 0);
        cval |= ((br >= threshold) ? 2 : 0);
        cval |= ((bl >= threshold) ? 1 : 0);

        /* resolve ambiguity for cval == 5 || 10 via averaging */
        var flipped = false;
        if(cval == 5 || cval == 10){
          var average = (tl + tr + br + bl) / 4;
          if(cval == 5 && (average < threshold)){
            cval = 10;
            flipped = true;
          } else if(cval == 10 && (average < threshold)){
            cval = 5;
            flipped = true;
          }
        }

        /* add cell to ContourGrid if it contains edges */
        if(cval !== 0 && cval !== 15){
          var top, bottom, left, right;
          top = bottom = left = right = 0.5;
          /* interpolate edges of cell */
          if(cval == 1){
            left    = 1 - interpolateX$1(threshold, tl, bl);
            bottom  = 1 - interpolateX$1(threshold, br, bl);
          } else if(cval == 2){
            bottom  = interpolateX$1(threshold, bl, br);
            right   = 1 - interpolateX$1(threshold, tr, br);
          } else if(cval == 3){
            left    = 1 - interpolateX$1(threshold, tl, bl);
            right   = 1 - interpolateX$1(threshold, tr, br);
          } else if(cval == 4){
            top     = interpolateX$1(threshold, tl, tr);
            right   = interpolateX$1(threshold, br, tr);
          } else if(cval == 5){
            top     = interpolateX$1(threshold, tl, tr);
            right   = interpolateX$1(threshold, br, tr);
            bottom  = 1 - interpolateX$1(threshold, br, bl);
            left    = 1 - interpolateX$1(threshold, tl, bl);
          } else if(cval == 6){
            bottom  = interpolateX$1(threshold, bl, br);
            top     = interpolateX$1(threshold, tl, tr);
          } else if(cval == 7){
            left    = 1 - interpolateX$1(threshold, tl, bl);
            top     = interpolateX$1(threshold, tl, tr);
          } else if(cval == 8){
            left    = interpolateX$1(threshold, bl, tl);
            top     = 1 - interpolateX$1(threshold, tr, tl);
          } else if(cval == 9){
            bottom  = 1 - interpolateX$1(threshold, br, bl);
            top     = 1 - interpolateX$1(threshold, tr, tl);
          } else if(cval == 10){
            top     = 1 - interpolateX$1(threshold, tr, tl);
            right   = 1 - interpolateX$1(threshold, tr, br);
            bottom  = interpolateX$1(threshold, bl, br);
            left    = interpolateX$1(threshold, bl, tl);
          } else if(cval == 11){
            top     = 1 - interpolateX$1(threshold, tr, tl);
            right   = 1 - interpolateX$1(threshold, tr, br);
          } else if(cval == 12){
            left    = interpolateX$1(threshold, bl, tl);
            right   = interpolateX$1(threshold, br, tr);
          } else if(cval == 13){
            bottom  = 1 - interpolateX$1(threshold, br, bl);
            right   = interpolateX$1(threshold, br, tr);
          } else if(cval == 14){
            left    = interpolateX$1(threshold, bl, tl);
            bottom  = interpolateX$1(threshold, bl, br);
          } else {
            console.log("Illegal cval detected: " + cval);
          }
          ContourGrid.cells[j][i] = {
                                      cval:     cval,
                                      flipped:  flipped,
                                      top:      top,
                                      right:    right,
                                      bottom:   bottom,
                                      left:     left
                                    };
        }

      }
    }

    return ContourGrid;
  }

  function isSaddle(cell){
    return cell.cval == 5 || cell.cval == 10;
  }

  function isTrivial(cell){
    return cell.cval === 0 || cell.cval == 15;
  }

  function clearCell(cell){
    if((!isTrivial(cell)) && (cell.cval != 5) && (cell.cval != 10)){
      cell.cval = 15;
    }
  }

  function getXY(cell, edge){
    if(edge === "top"){
      return [cell.top, 1.0];
    } else if(edge === "bottom"){
      return [cell.bottom, 0.0];
    } else if(edge === "right"){
      return [1.0, cell.right];
    } else if(edge === "left"){
      return [0.0, cell.left];
    }
  }

  function ContourGrid2Paths(grid){
    var paths = [];
    var path_idx = 0;
    var rows = grid.rows;
    var cols = grid.cols;
    var epsilon = 1e-7;

    grid.cells.forEach(function(g, j){
      g.forEach(function(gg, i){
        if((typeof gg !== 'undefined') && (!isSaddle(gg)) && (!isTrivial(gg))){
          var p = tracePath(grid.cells, j, i);
          var merged = false;
          /* we may try to merge paths at this point */
          if(p.info == "mergeable"){
            /*
              search backwards through the path array to find an entry
              that starts with where the current path ends...
            */
            var x = p.path[p.path.length - 1][0],
                y = p.path[p.path.length - 1][1];

            for(var k = path_idx - 1; k >= 0; k--){
              if((Math.abs(paths[k][0][0] - x) <= epsilon) && (Math.abs(paths[k][0][1] - y) <= epsilon)){
                for(var l = p.path.length - 2; l >= 0; --l){
                  paths[k].unshift(p.path[l]);
                }
                merged = true;
                break;
              }
            }
          }
          if(!merged)
            { paths[path_idx++] = p.path; }
        }
      });
    });

    return paths;
  }

  /*
    construct consecutive line segments from starting cell by
    walking arround the enclosed area clock-wise
   */
  function tracePath(grid, j, i){
    var maxj = grid.length;
    var p = [];
    var dxContour = [0, 0, 1, 1, 0, 0, 0, 0, -1, 0, 1, 1, -1, 0, -1, 0];
    var dyContour = [0, -1, 0, 0, 1, 1, 1, 1, 0, -1, 0, 0, 0, -1, 0, 0];
    var dx, dy;
    var startEdge = ["none", "left", "bottom", "left", "right", "none", "bottom", "left", "top", "top", "none", "top", "right", "right", "bottom", "none"];
    var nextEdge  = ["none", "bottom", "right", "right", "top", "top", "top", "top", "left", "bottom", "right", "right", "left", "bottom", "left", "none"];
    
    var startCell   = grid[j][i];
    var currentCell = grid[j][i];

    var cval = currentCell.cval;
    var edge = startEdge[cval];

    var pt = getXY(currentCell, edge);

    /* push initial segment */
    p.push([i + pt[0], j + pt[1]]);
    edge = nextEdge[cval];
    pt = getXY(currentCell, edge);
    p.push([i + pt[0], j + pt[1]]);
    clearCell(currentCell);

    /* now walk arround the enclosed area in clockwise-direction */
    var k = i + dxContour[cval];
    var l = j + dyContour[cval];
    var prev_cval = cval;

    while((k >= 0) && (l >= 0) && (l < maxj) && ((k != i) || (l != j))){
      currentCell = grid[l][k];
      if(typeof currentCell === 'undefined'){ /* path ends here */
        //console.log(k + " " + l + " is undefined, stopping path!");
        break;
      }
      cval = currentCell.cval;
      if((cval === 0) || (cval === 15)){
        return { path: p, info: "mergeable" };
      }
      edge  = nextEdge[cval];
      dx    = dxContour[cval];
      dy    = dyContour[cval];
      if((cval == 5) || (cval == 10)){
        /* select upper or lower band, depending on previous cells cval */
        if(cval == 5){
          if(currentCell.flipped){ /* this is actually a flipped case 10 */
            if(dyContour[prev_cval] == -1){
              edge  = "left";
              dx    = -1;
              dy    = 0;
            } else {
              edge  = "right";
              dx    = 1;
              dy    = 0;
            }
          } else { /* real case 5 */
            if(dxContour[prev_cval] == -1){
              edge  = "bottom";
              dx    = 0;
              dy    = -1;
            }
          }
        } else if(cval == 10){
          if(currentCell.flipped){ /* this is actually a flipped case 5 */
            if(dxContour[prev_cval] == -1){
              edge  = "top";
              dx    = 0;
              dy    = 1;
            } else {
              edge  = "bottom";
              dx    = 0;
              dy    = -1;
            }
          } else {  /* real case 10 */
            if(dyContour[prev_cval] == 1){
              edge  = "left";
              dx    = -1;
              dy    = 0;
            }
          }
        }
      }
      pt = getXY(currentCell, edge);
      p.push([k + pt[0], l + pt[1]]);
      clearCell(currentCell);
      k += dx;
      l += dy;
      prev_cval = cval;
    }

    return { path: p, info: "closed" };
  }

var streamlines = function(uData, vData, geotransform, density, flip){
  density = density || 1;
  var output = { "type": "FeatureCollection",
    "features": []
  };
  var num_lines = 0;
  var inst = new Streamlines(uData, vData);
  if(!geotransform){
    geotransform = [0,1,0,0,0,1];
  } else if(geotransform.length !== 6){
    throw new Error('Bad geotransform');
  }
  //Iterate different points to start lines while available pixels
  var pixel = true;
  var line = true;

  var pos = 0;
  var x, y;
  while(pixel){
    if(pos%4 === 0){
      x = 0;
      y = 0;
    } else if(pos%4 === 1){
      x = uData[0].length - 1;
      y = uData.length - 1;
    } else if(pos%4 === 2){
      x = uData[0].length - 1;
      y = 0;
    } else{
      x = 0;
      y = uData.length - 1;
    }
    //The density affects the pixel distance
    var pixelDist = Math.round(uData.length / (60 * density));
    pixelDist = pixelDist>0?pixelDist:1;

    pixel = inst.findEmptyPixel(x,y,pixelDist);
    line = inst.getLine(pixel.x, pixel.y, flip);
    if(line){
      output.features.push({"type": "Feature",
         "geometry": {
           "type": "LineString",
          "coordinates": inst.applyGeoTransform(line, geotransform)},
          "properties": {"num_line": num_lines}
        });
      num_lines++;
    }
    pos++;
  }
  return output;
};

function Streamlines(uData, vData){
  var this$1 = this;

  if(uData.length <= 1 || vData.length <= 1 || uData[0].length <= 1 || vData[0].length <= 1){
    throw new Error('Raster is too small');
  }
  this.uData = uData;
  this.vData = vData;
  this.usedPixels = [];
  for(var i = 0; i<uData.length; i++){
    var line = [];
    for(var j = 0; j<uData[0].length; j++){
      line.push(false);
    }
    this$1.usedPixels.push(line);
  }
}

Streamlines.prototype.findEmptyPixel = function(x0, y0, dist) {
  var this$1 = this;

  //Explores around the init pixel creating squares to find an empty pixel
  if(this.isPixelFree(x0, y0, dist)){
    return {x:x0, y:y0};
  }
  var maxDist = this.uData[0].length + this.uData.length;
  for(var d = 2; d <= maxDist + 1; d=d+2){
    for(var pd = 0; pd<d; pd++){
      if(this$1.isPixelFree(pd+1+x0-d/2, y0-d/2, dist)){return {x:pd+1+x0-d/2, y:y0-d/2};}
      if(this$1.isPixelFree(x0-d/2, pd+y0-d/2, dist)){return {x:x0-d/2, y:pd+y0-d/2};}
      if(this$1.isPixelFree(d+x0-d/2, pd+1+y0-d/2, dist)){return {x:d+x0-d/2, y:pd+1+y0-d/2};}
      if(this$1.isPixelFree(pd+x0-d/2, d+y0-d/2, dist)){return {x:pd+x0-d/2, y:d+y0-d/2};}
    }

  }
  return false;
};

Streamlines.prototype.isPixelFree = function(x0, y0, dist) {
  var this$1 = this;

  if(x0<0 || x0>=this.usedPixels[0].length || y0<0 || y0 >= this.usedPixels.length){
    return false;
  }
  for(var i=-dist; i<=dist;i++){
    for(var j=-dist; j<=dist;j++){
      if(y0+j>=0 &&y0+j<this$1.usedPixels.length && x0+i>=0 && x0+i<this$1.usedPixels[y0].length){
        if(this$1.usedPixels[y0+j][x0+i]){
          return false;
        }
      }
    }
  }

  return true;
};

Streamlines.prototype.getLine = function(x0, y0, flip) {
  var this$1 = this;


  var lineFound = false;
  var x = x0;
  var y = y0;
  var values;
  var outLine = [[x,y]];
  if(flip){flip = 1;} else {flip = -1;}
  while(x >= 0 && x < this.uData[0].length && y >= 0 && y < this.uData.length){
    values = this$1.getValueAtPoint(x, y);

    x = x + values.u;
    y = y + flip * values.v; //The wind convention says v goes from bottom to top
    if(values.u === 0 && values.v === 0){this$1.usedPixels[y0][x0] = true; break;} //Zero speed points are problematic
    if(x < 0 || y < 0 || x>= this$1.uData[0].length|| y >= this$1.uData.length || this$1.usedPixels[Math.floor(y)][Math.floor(x)]){break;}
    outLine.push([x,y]);
    lineFound = true;
    this$1.usedPixels[Math.floor(y)][Math.floor(x)] = true;
  }
  //repeat the operation but backwards, so strange effects in some cases are avoided.
  x = x0;
  y = y0;
  while(x >= 0 && x < this.uData[0].length && y >= 0 && y < this.uData.length){
    values = this$1.getValueAtPoint(x, y);

    x = x - values.u;
    y = y - flip * values.v; //The wind convention says v goes from bottom to top
    if(values.u === 0 && values.v === 0){this$1.usedPixels[y0][x0] = true; break;} //Zero speed points are problematic
    if(x < 0 || y < 0 || x>= this$1.uData[0].length || y >= this$1.uData.length || this$1.usedPixels[Math.floor(y)][Math.floor(x)]){break;}
    outLine.unshift([x,y]);
    lineFound = true;
    this$1.usedPixels[Math.floor(y)][Math.floor(x)] = true;
  }

  if(lineFound){
    this.usedPixels[y0][x0] = true;
    return outLine;
  } else {
    return false;
  }
};

Streamlines.prototype.applyGeoTransform = function(line, geotransform) {
  var outLine = [];
  for(var i = 0; i<line.length; i++){
    outLine.push([geotransform[0] + geotransform[1] * line[i][0] + geotransform[2] * line[i][1], geotransform[3] + geotransform[4] * line[i][0] + geotransform[5] * line[i][1]]);
  }
  return outLine;
};

Streamlines.prototype.getValueAtPoint = function(x, y) {
  var u, v, mdl, distTotal;
  var dist1 = Math.sqrt((Math.floor(x) - x) * (Math.floor(x) - x) + (Math.floor(y) - y) * (Math.floor(y) - y));
  var dist2 = Math.sqrt((Math.floor(x) - x) * (Math.floor(x) - x) + (Math.ceil(y) - y) * (Math.ceil(y) - y));
  var dist3 = Math.sqrt((Math.ceil(x) - x) * (Math.ceil(x) - x) + (Math.ceil(y) - y) * (Math.ceil(y) - y));
  var dist4 = Math.sqrt((Math.ceil(x) - x) * (Math.ceil(x) - x) + (Math.floor(y) - y) * (Math.floor(y) - y));
  if(dist1 < 0.01){
    u = this.uData[Math.floor(y)][Math.floor(x)];
    v = this.vData[Math.floor(y)][Math.floor(x)];
  } else if(dist2 < 0.01){
    u = this.uData[Math.ceil(y)][Math.floor(x)];
    v = this.vData[Math.ceil(y)][Math.floor(x)];
  } else if(dist3 < 0.01){
    u = this.uData[Math.ceil(y)][Math.ceil(x)];
    v = this.vData[Math.ceil(y)][Math.ceil(x)];
  } else if(dist4 < 0.01){
    u = this.uData[Math.floor(y)][Math.ceil(x)];
    v = this.vData[Math.floor(y)][Math.ceil(x)];
  } else {
    distTotal = 0;
    u = 0;
    v = 0;
    if(this.uData[Math.floor(y)] && this.uData[Math.floor(y)][Math.floor(x)]){
      u+=this.uData[Math.floor(y)][Math.floor(x)]/dist1;
      v+=this.vData[Math.floor(y)][Math.floor(x)]/dist1;
      distTotal+=(1/dist1);
    }
    if(this.uData[Math.ceil(y)] && this.uData[Math.ceil(y)][Math.floor(x)]){
      u+=this.uData[Math.ceil(y)][Math.floor(x)]/dist2;
      v+=this.vData[Math.ceil(y)][Math.floor(x)]/dist2;
      distTotal+=(1/dist2);
    }
    if(this.uData[Math.ceil(y)] && this.uData[Math.ceil(y)][Math.ceil(x)]){
      u+=this.uData[Math.ceil(y)][Math.ceil(x)]/dist3;
      v+=this.vData[Math.ceil(y)][Math.ceil(x)]/dist3;
      distTotal+=(1/dist3);
    }
    if(this.uData[Math.floor(y)] && this.uData[Math.floor(y)][Math.ceil(x)]){
      u+=this.uData[Math.floor(y)][Math.ceil(x)]/dist4;
      v+=this.vData[Math.floor(y)][Math.ceil(x)]/dist4;
      distTotal+=(1/dist4);
    }
    u = u/distTotal;
    v = v/distTotal;

  }
  mdl = Math.sqrt(u*u+v*v);
  if(mdl!==0 && distTotal !== 0){
    return {u:u/mdl, v:v/mdl};
  } else {
    return {u:0, v:0};
  }
};

//Parses an SVG path into an object.
//Taken from https://github.com/jkroso/parse-svg-path
//Re-written so it can be used with rollup
var length$2 = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};
var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig;

var parse$1 = function(path) {
  var data = [];
	path.replace(segment, function(_, command, args){
		var type = command.toLowerCase();
		args = parseValues(args);

		// overloaded moveTo
		if (type === 'm' && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)));
			type = 'l';
			command = command === 'm' ? 'l' : 'L';
		}

		while (args.length >= 0) {
			if (args.length === length$2[type]) {
				args.unshift(command);
				return data.push(args);
			}
			if (args.length < length$2[type]) {
        throw new Error('malformed path data');
      }
			data.push([command].concat(args.splice(0, length$2[type])));
		}
	});
  return data;
};

var number$1 = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig;

function parseValues(args) {
	var numbers = args.match(number$1);
	return numbers ? numbers.map(Number) : [];
}

//Calculate Bezier curve length and positionAtLength
//Algorithms taken from http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5, https://gist.github.com/tunght13488/6744e77c242cc7a94859 and http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier

var Bezier = function(ax, ay, bx, by, cx, cy, dx, dy) {
  return new Bezier$1(ax, ay, bx, by, cx, cy, dx, dy);
};

function Bezier$1(ax, ay, bx, by, cx, cy, dx, dy) {
  this.a = {x:ax, y:ay};
  this.b = {x:bx, y:by};
  this.c = {x:cx, y:cy};
  this.d = {x:dx, y:dy};

  if(dx !== null && dx !== undefined && dy !== null && dy !== undefined){
    this.getArcLength = getCubicArcLength;
    this.getPoint = cubicPoint;
    this.getDerivative = cubicDerivative;
  } else {
    this.getArcLength = getQuadraticArcLength;
    this.getPoint = quadraticPoint;
    this.getDerivative = quadraticDerivative;
  }

  this.init();
}

Bezier$1.prototype = {
  constructor: Bezier$1,
  init: function() {

    this.length = this.getArcLength([this.a.x, this.b.x, this.c.x, this.d.x],
                                    [this.a.y, this.b.y, this.c.y, this.d.y]);
  },

  getTotalLength: function() {
    return this.length;
  },
  getPointAtLength: function(length) {
    var t = t2length(length, this.length, this.getArcLength,
                    [this.a.x, this.b.x, this.c.x, this.d.x],
                    [this.a.y, this.b.y, this.c.y, this.d.y]);

    return this.getPoint([this.a.x, this.b.x, this.c.x, this.d.x],
                                    [this.a.y, this.b.y, this.c.y, this.d.y],
                                  t);
  },
  getTangentAtLength: function(length){
    var t = t2length(length, this.length, this.getArcLength,
                    [this.a.x, this.b.x, this.c.x, this.d.x],
                    [this.a.y, this.b.y, this.c.y, this.d.y]);

    var derivative = this.getDerivative([this.a.x, this.b.x, this.c.x, this.d.x],
                    [this.a.y, this.b.y, this.c.y, this.d.y], t);
    var mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
    var tangent;
    if (mdl > 0){
      tangent = {x: derivative.x/mdl, y: derivative.y/mdl};
    } else {
      tangent = {x: 0, y: 0};
    }
    return tangent;
  },
  getPropertiesAtLength: function(length){
    var t = t2length(length, this.length, this.getArcLength,
                    [this.a.x, this.b.x, this.c.x, this.d.x],
                    [this.a.y, this.b.y, this.c.y, this.d.y]);

    var derivative = this.getDerivative([this.a.x, this.b.x, this.c.x, this.d.x],
                    [this.a.y, this.b.y, this.c.y, this.d.y], t);
    var mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
    var tangent;
    if (mdl > 0){
      tangent = {x: derivative.x/mdl, y: derivative.y/mdl};
    } else {
      tangent = {x: 0, y: 0};
    }
    var point = this.getPoint([this.a.x, this.b.x, this.c.x, this.d.x],
                                    [this.a.y, this.b.y, this.c.y, this.d.y],
                                  t);
    return {x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y};
  }
};

function quadraticDerivative(xs, ys, t){
  return {x: (1 - t) * 2*(xs[1] - xs[0]) +t * 2*(xs[2] - xs[1]),
    y: (1 - t) * 2*(ys[1] - ys[0]) +t * 2*(ys[2] - ys[1])
  };
}

function cubicDerivative(xs, ys, t){
  var derivative = quadraticPoint(
            [3*(xs[1] - xs[0]), 3*(xs[2] - xs[1]), 3*(xs[3] - xs[2])],
            [3*(ys[1] - ys[0]), 3*(ys[2] - ys[1]), 3*(ys[3] - ys[2])],
            t);
  return derivative;
}

function t2length(length, total_length, func, xs, ys){
  var error = 1;
  var t = length/total_length;
  var step = (length - func(xs, ys, t))/total_length;

  while (error > 0.001){
    var increasedTLength = func(xs, ys, t + step);
    var decreasedTLength = func(xs, ys, t - step);
    var increasedTError = Math.abs(length - increasedTLength)/total_length;
    var decreasedTError = Math.abs(length - decreasedTLength)/total_length;
    if (increasedTError < error) {
      error = increasedTError;
      t += step;
    } else if (decreasedTError < error) {
      error = decreasedTError;
      t -= step;
    } else {
      step /= 2;
    }
  }

  return t;
}

function quadraticPoint(xs, ys, t){
  var x = (1 - t) * (1 - t) * xs[0] + 2 * (1 - t) * t * xs[1] + t * t * xs[2];
  var y = (1 - t) * (1 - t) * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2];
  return {x: x, y: y};
}

function cubicPoint(xs, ys, t){
  var x = (1 - t) * (1 - t) * (1 - t) * xs[0] + 3 * (1 - t) * (1 - t) * t * xs[1] +
  3 * (1 - t) * t * t * xs[2] + t * t * t * xs[3];
  var y = (1 - t) * (1 - t) * (1 - t) * ys[0] + 3 * (1 - t) * (1 - t) * t * ys[1] +
  3 * (1 - t) * t * t * ys[2] + t * t * t * ys[3];

  return {x: x, y: y};
}

function getQuadraticArcLength(xs, ys, t) {
  if (t === undefined) {
    t = 1;
  }
   var ax = xs[0] - 2 * xs[1] + xs[2];
   var ay = ys[0] - 2 * ys[1] + ys[2];
   var bx = 2 * xs[1] - 2 * xs[0];
   var by = 2 * ys[1] - 2 * ys[0];

   var A = 4 * (ax * ax + ay * ay);
   var B = 4 * (ax * bx + ay * by);
   var C = bx * bx + by * by;

   if(A === 0){
     return t * Math.sqrt(Math.pow(xs[2] - xs[0], 2) + Math.pow(ys[2] - ys[0], 2));
   }
   var b = B/(2*A);
   var c = C/A;
   var u = t + b;
   var k = c - b*b;

   return (Math.sqrt(A)/2)*(
     u*Math.sqrt(u*u+k)-b*Math.sqrt(b*b+k)+
     k*Math.log(Math.abs(
       (u+Math.sqrt(u*u+k))/(b+Math.sqrt(b*b+k))
     ))
   );

}

// Legendre-Gauss abscissae (xi values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
var tValues = [
  [],
  [],
  [-0.5773502691896257645091487805019574556476,0.5773502691896257645091487805019574556476],
  [0,-0.7745966692414833770358530799564799221665,0.7745966692414833770358530799564799221665],
  [-0.3399810435848562648026657591032446872005,0.3399810435848562648026657591032446872005,-0.8611363115940525752239464888928095050957,0.8611363115940525752239464888928095050957],
  [0,-0.5384693101056830910363144207002088049672,0.5384693101056830910363144207002088049672,-0.9061798459386639927976268782993929651256,0.9061798459386639927976268782993929651256],
  [0.6612093864662645136613995950199053470064,-0.6612093864662645136613995950199053470064,-0.2386191860831969086305017216807119354186,0.2386191860831969086305017216807119354186,-0.9324695142031520278123015544939946091347,0.9324695142031520278123015544939946091347],
  [0, 0.4058451513773971669066064120769614633473,-0.4058451513773971669066064120769614633473,-0.7415311855993944398638647732807884070741,0.7415311855993944398638647732807884070741,-0.9491079123427585245261896840478512624007,0.9491079123427585245261896840478512624007],
  [-0.1834346424956498049394761423601839806667,0.1834346424956498049394761423601839806667,-0.5255324099163289858177390491892463490419,0.5255324099163289858177390491892463490419,-0.7966664774136267395915539364758304368371,0.7966664774136267395915539364758304368371,-0.9602898564975362316835608685694729904282,0.9602898564975362316835608685694729904282],
  [0,-0.8360311073266357942994297880697348765441,0.8360311073266357942994297880697348765441,-0.9681602395076260898355762029036728700494,0.9681602395076260898355762029036728700494,-0.3242534234038089290385380146433366085719,0.3242534234038089290385380146433366085719,-0.6133714327005903973087020393414741847857,0.6133714327005903973087020393414741847857],
  [-0.1488743389816312108848260011297199846175,0.1488743389816312108848260011297199846175,-0.4333953941292471907992659431657841622000,0.4333953941292471907992659431657841622000,-0.6794095682990244062343273651148735757692,0.6794095682990244062343273651148735757692,-0.8650633666889845107320966884234930485275,0.8650633666889845107320966884234930485275,-0.9739065285171717200779640120844520534282,0.9739065285171717200779640120844520534282],
  [0,-0.2695431559523449723315319854008615246796,0.2695431559523449723315319854008615246796,-0.5190961292068118159257256694586095544802,0.5190961292068118159257256694586095544802,-0.7301520055740493240934162520311534580496,0.7301520055740493240934162520311534580496,-0.8870625997680952990751577693039272666316,0.8870625997680952990751577693039272666316,-0.9782286581460569928039380011228573907714,0.9782286581460569928039380011228573907714],
  [-0.1252334085114689154724413694638531299833,0.1252334085114689154724413694638531299833,-0.3678314989981801937526915366437175612563,0.3678314989981801937526915366437175612563,-0.5873179542866174472967024189405342803690,0.5873179542866174472967024189405342803690,-0.7699026741943046870368938332128180759849,0.7699026741943046870368938332128180759849,-0.9041172563704748566784658661190961925375,0.9041172563704748566784658661190961925375,-0.9815606342467192506905490901492808229601,0.9815606342467192506905490901492808229601],
  [0,-0.2304583159551347940655281210979888352115,0.2304583159551347940655281210979888352115,-0.4484927510364468528779128521276398678019,0.4484927510364468528779128521276398678019,-0.6423493394403402206439846069955156500716,0.6423493394403402206439846069955156500716,-0.8015780907333099127942064895828598903056,0.8015780907333099127942064895828598903056,-0.9175983992229779652065478365007195123904,0.9175983992229779652065478365007195123904,-0.9841830547185881494728294488071096110649,0.9841830547185881494728294488071096110649],
  [-0.1080549487073436620662446502198347476119,0.1080549487073436620662446502198347476119,-0.3191123689278897604356718241684754668342,0.3191123689278897604356718241684754668342,-0.5152486363581540919652907185511886623088,0.5152486363581540919652907185511886623088,-0.6872929048116854701480198030193341375384,0.6872929048116854701480198030193341375384,-0.8272013150697649931897947426503949610397,0.8272013150697649931897947426503949610397,-0.9284348836635735173363911393778742644770,0.9284348836635735173363911393778742644770,-0.9862838086968123388415972667040528016760,0.9862838086968123388415972667040528016760],
  [0,-0.2011940939974345223006283033945962078128,0.2011940939974345223006283033945962078128,-0.3941513470775633698972073709810454683627,0.3941513470775633698972073709810454683627,-0.5709721726085388475372267372539106412383,0.5709721726085388475372267372539106412383,-0.7244177313601700474161860546139380096308,0.7244177313601700474161860546139380096308,-0.8482065834104272162006483207742168513662,0.8482065834104272162006483207742168513662,-0.9372733924007059043077589477102094712439,0.9372733924007059043077589477102094712439,-0.9879925180204854284895657185866125811469,0.9879925180204854284895657185866125811469],
  [-0.0950125098376374401853193354249580631303,0.0950125098376374401853193354249580631303,-0.2816035507792589132304605014604961064860,0.2816035507792589132304605014604961064860,-0.4580167776572273863424194429835775735400,0.4580167776572273863424194429835775735400,-0.6178762444026437484466717640487910189918,0.6178762444026437484466717640487910189918,-0.7554044083550030338951011948474422683538,0.7554044083550030338951011948474422683538,-0.8656312023878317438804678977123931323873,0.8656312023878317438804678977123931323873,-0.9445750230732325760779884155346083450911,0.9445750230732325760779884155346083450911,-0.9894009349916499325961541734503326274262,0.9894009349916499325961541734503326274262],
  [0,-0.1784841814958478558506774936540655574754,0.1784841814958478558506774936540655574754,-0.3512317634538763152971855170953460050405,0.3512317634538763152971855170953460050405,-0.5126905370864769678862465686295518745829,0.5126905370864769678862465686295518745829,-0.6576711592166907658503022166430023351478,0.6576711592166907658503022166430023351478,-0.7815140038968014069252300555204760502239,0.7815140038968014069252300555204760502239,-0.8802391537269859021229556944881556926234,0.8802391537269859021229556944881556926234,-0.9506755217687677612227169578958030214433,0.9506755217687677612227169578958030214433,-0.9905754753144173356754340199406652765077,0.9905754753144173356754340199406652765077],
  [-0.0847750130417353012422618529357838117333,0.0847750130417353012422618529357838117333,-0.2518862256915055095889728548779112301628,0.2518862256915055095889728548779112301628,-0.4117511614628426460359317938330516370789,0.4117511614628426460359317938330516370789,-0.5597708310739475346078715485253291369276,0.5597708310739475346078715485253291369276,-0.6916870430603532078748910812888483894522,0.6916870430603532078748910812888483894522,-0.8037049589725231156824174550145907971032,0.8037049589725231156824174550145907971032,-0.8926024664975557392060605911271455154078,0.8926024664975557392060605911271455154078,-0.9558239495713977551811958929297763099728,0.9558239495713977551811958929297763099728,-0.9915651684209309467300160047061507702525,0.9915651684209309467300160047061507702525],
  [0,-0.1603586456402253758680961157407435495048,0.1603586456402253758680961157407435495048,-0.3165640999636298319901173288498449178922,0.3165640999636298319901173288498449178922,-0.4645707413759609457172671481041023679762,0.4645707413759609457172671481041023679762,-0.6005453046616810234696381649462392798683,0.6005453046616810234696381649462392798683,-0.7209661773352293786170958608237816296571,0.7209661773352293786170958608237816296571,-0.8227146565371428249789224867127139017745,0.8227146565371428249789224867127139017745,-0.9031559036148179016426609285323124878093,0.9031559036148179016426609285323124878093,-0.9602081521348300308527788406876515266150,0.9602081521348300308527788406876515266150,-0.9924068438435844031890176702532604935893,0.9924068438435844031890176702532604935893],
  [-0.0765265211334973337546404093988382110047,0.0765265211334973337546404093988382110047,-0.2277858511416450780804961953685746247430,0.2277858511416450780804961953685746247430,-0.3737060887154195606725481770249272373957,0.3737060887154195606725481770249272373957,-0.5108670019508270980043640509552509984254,0.5108670019508270980043640509552509984254,-0.6360536807265150254528366962262859367433,0.6360536807265150254528366962262859367433,-0.7463319064601507926143050703556415903107,0.7463319064601507926143050703556415903107,-0.8391169718222188233945290617015206853296,0.8391169718222188233945290617015206853296,-0.9122344282513259058677524412032981130491,0.9122344282513259058677524412032981130491,-0.9639719272779137912676661311972772219120,0.9639719272779137912676661311972772219120,-0.9931285991850949247861223884713202782226,0.9931285991850949247861223884713202782226],
  [0,-0.1455618541608950909370309823386863301163,0.1455618541608950909370309823386863301163,-0.2880213168024010966007925160646003199090,0.2880213168024010966007925160646003199090,-0.4243421202074387835736688885437880520964,0.4243421202074387835736688885437880520964,-0.5516188358872198070590187967243132866220,0.5516188358872198070590187967243132866220,-0.6671388041974123193059666699903391625970,0.6671388041974123193059666699903391625970,-0.7684399634756779086158778513062280348209,0.7684399634756779086158778513062280348209,-0.8533633645833172836472506385875676702761,0.8533633645833172836472506385875676702761,-0.9200993341504008287901871337149688941591,0.9200993341504008287901871337149688941591,-0.9672268385663062943166222149076951614246,0.9672268385663062943166222149076951614246,-0.9937521706203895002602420359379409291933,0.9937521706203895002602420359379409291933],
  [-0.0697392733197222212138417961186280818222,0.0697392733197222212138417961186280818222,-0.2078604266882212854788465339195457342156,0.2078604266882212854788465339195457342156,-0.3419358208920842251581474204273796195591,0.3419358208920842251581474204273796195591,-0.4693558379867570264063307109664063460953,0.4693558379867570264063307109664063460953,-0.5876404035069115929588769276386473488776,0.5876404035069115929588769276386473488776,-0.6944872631866827800506898357622567712673,0.6944872631866827800506898357622567712673,-0.7878168059792081620042779554083515213881,0.7878168059792081620042779554083515213881,-0.8658125777203001365364256370193787290847,0.8658125777203001365364256370193787290847,-0.9269567721871740005206929392590531966353,0.9269567721871740005206929392590531966353,-0.9700604978354287271239509867652687108059,0.9700604978354287271239509867652687108059,-0.9942945854823992920730314211612989803930,0.9942945854823992920730314211612989803930],
  [0,-0.1332568242984661109317426822417661370104,0.1332568242984661109317426822417661370104,-0.2641356809703449305338695382833096029790,0.2641356809703449305338695382833096029790,-0.3903010380302908314214888728806054585780,0.3903010380302908314214888728806054585780,-0.5095014778460075496897930478668464305448,0.5095014778460075496897930478668464305448,-0.6196098757636461563850973116495956533871,0.6196098757636461563850973116495956533871,-0.7186613631319501944616244837486188483299,0.7186613631319501944616244837486188483299,-0.8048884016188398921511184069967785579414,0.8048884016188398921511184069967785579414,-0.8767523582704416673781568859341456716389,0.8767523582704416673781568859341456716389,-0.9329710868260161023491969890384229782357,0.9329710868260161023491969890384229782357,-0.9725424712181152319560240768207773751816,0.9725424712181152319560240768207773751816,-0.9947693349975521235239257154455743605736,0.9947693349975521235239257154455743605736],
  [-0.0640568928626056260850430826247450385909,0.0640568928626056260850430826247450385909,-0.1911188674736163091586398207570696318404,0.1911188674736163091586398207570696318404,-0.3150426796961633743867932913198102407864,0.3150426796961633743867932913198102407864,-0.4337935076260451384870842319133497124524,0.4337935076260451384870842319133497124524,-0.5454214713888395356583756172183723700107,0.5454214713888395356583756172183723700107,-0.6480936519369755692524957869107476266696,0.6480936519369755692524957869107476266696,-0.7401241915785543642438281030999784255232,0.7401241915785543642438281030999784255232,-0.8200019859739029219539498726697452080761,0.8200019859739029219539498726697452080761,-0.8864155270044010342131543419821967550873,0.8864155270044010342131543419821967550873,-0.9382745520027327585236490017087214496548,0.9382745520027327585236490017087214496548,-0.9747285559713094981983919930081690617411,0.9747285559713094981983919930081690617411,-0.9951872199970213601799974097007368118745,0.9951872199970213601799974097007368118745]
];

// Legendre-Gauss weights (wi values, defined by a function linked to in the Bezier primer article)
var cValues = [
  [],[],
  [1.0,1.0],
  [0.8888888888888888888888888888888888888888,0.5555555555555555555555555555555555555555,0.5555555555555555555555555555555555555555],
  [0.6521451548625461426269360507780005927646,0.6521451548625461426269360507780005927646,0.3478548451374538573730639492219994072353,0.3478548451374538573730639492219994072353],
  [0.5688888888888888888888888888888888888888,0.4786286704993664680412915148356381929122,0.4786286704993664680412915148356381929122,0.2369268850561890875142640407199173626432,0.2369268850561890875142640407199173626432],
  [0.3607615730481386075698335138377161116615,0.3607615730481386075698335138377161116615,0.4679139345726910473898703439895509948116,0.4679139345726910473898703439895509948116,0.1713244923791703450402961421727328935268,0.1713244923791703450402961421727328935268],
  [0.4179591836734693877551020408163265306122,0.3818300505051189449503697754889751338783,0.3818300505051189449503697754889751338783,0.2797053914892766679014677714237795824869,0.2797053914892766679014677714237795824869,0.1294849661688696932706114326790820183285,0.1294849661688696932706114326790820183285],
  [0.3626837833783619829651504492771956121941,0.3626837833783619829651504492771956121941,0.3137066458778872873379622019866013132603,0.3137066458778872873379622019866013132603,0.2223810344533744705443559944262408844301,0.2223810344533744705443559944262408844301,0.1012285362903762591525313543099621901153,0.1012285362903762591525313543099621901153],
  [0.3302393550012597631645250692869740488788,0.1806481606948574040584720312429128095143,0.1806481606948574040584720312429128095143,0.0812743883615744119718921581105236506756,0.0812743883615744119718921581105236506756,0.3123470770400028400686304065844436655987,0.3123470770400028400686304065844436655987,0.2606106964029354623187428694186328497718,0.2606106964029354623187428694186328497718],
  [0.2955242247147528701738929946513383294210,0.2955242247147528701738929946513383294210,0.2692667193099963550912269215694693528597,0.2692667193099963550912269215694693528597,0.2190863625159820439955349342281631924587,0.2190863625159820439955349342281631924587,0.1494513491505805931457763396576973324025,0.1494513491505805931457763396576973324025,0.0666713443086881375935688098933317928578,0.0666713443086881375935688098933317928578],
  [0.2729250867779006307144835283363421891560,0.2628045445102466621806888698905091953727,0.2628045445102466621806888698905091953727,0.2331937645919904799185237048431751394317,0.2331937645919904799185237048431751394317,0.1862902109277342514260976414316558916912,0.1862902109277342514260976414316558916912,0.1255803694649046246346942992239401001976,0.1255803694649046246346942992239401001976,0.0556685671161736664827537204425485787285,0.0556685671161736664827537204425485787285],
  [0.2491470458134027850005624360429512108304,0.2491470458134027850005624360429512108304,0.2334925365383548087608498989248780562594,0.2334925365383548087608498989248780562594,0.2031674267230659217490644558097983765065,0.2031674267230659217490644558097983765065,0.1600783285433462263346525295433590718720,0.1600783285433462263346525295433590718720,0.1069393259953184309602547181939962242145,0.1069393259953184309602547181939962242145,0.0471753363865118271946159614850170603170,0.0471753363865118271946159614850170603170],
  [0.2325515532308739101945895152688359481566,0.2262831802628972384120901860397766184347,0.2262831802628972384120901860397766184347,0.2078160475368885023125232193060527633865,0.2078160475368885023125232193060527633865,0.1781459807619457382800466919960979955128,0.1781459807619457382800466919960979955128,0.1388735102197872384636017768688714676218,0.1388735102197872384636017768688714676218,0.0921214998377284479144217759537971209236,0.0921214998377284479144217759537971209236,0.0404840047653158795200215922009860600419,0.0404840047653158795200215922009860600419],
  [0.2152638534631577901958764433162600352749,0.2152638534631577901958764433162600352749,0.2051984637212956039659240656612180557103,0.2051984637212956039659240656612180557103,0.1855383974779378137417165901251570362489,0.1855383974779378137417165901251570362489,0.1572031671581935345696019386238421566056,0.1572031671581935345696019386238421566056,0.1215185706879031846894148090724766259566,0.1215185706879031846894148090724766259566,0.0801580871597602098056332770628543095836,0.0801580871597602098056332770628543095836,0.0351194603317518630318328761381917806197,0.0351194603317518630318328761381917806197],
  [0.2025782419255612728806201999675193148386,0.1984314853271115764561183264438393248186,0.1984314853271115764561183264438393248186,0.1861610000155622110268005618664228245062,0.1861610000155622110268005618664228245062,0.1662692058169939335532008604812088111309,0.1662692058169939335532008604812088111309,0.1395706779261543144478047945110283225208,0.1395706779261543144478047945110283225208,0.1071592204671719350118695466858693034155,0.1071592204671719350118695466858693034155,0.0703660474881081247092674164506673384667,0.0703660474881081247092674164506673384667,0.0307532419961172683546283935772044177217,0.0307532419961172683546283935772044177217],
  [0.1894506104550684962853967232082831051469,0.1894506104550684962853967232082831051469,0.1826034150449235888667636679692199393835,0.1826034150449235888667636679692199393835,0.1691565193950025381893120790303599622116,0.1691565193950025381893120790303599622116,0.1495959888165767320815017305474785489704,0.1495959888165767320815017305474785489704,0.1246289712555338720524762821920164201448,0.1246289712555338720524762821920164201448,0.0951585116824927848099251076022462263552,0.0951585116824927848099251076022462263552,0.0622535239386478928628438369943776942749,0.0622535239386478928628438369943776942749,0.0271524594117540948517805724560181035122,0.0271524594117540948517805724560181035122],
  [0.1794464703562065254582656442618856214487,0.1765627053669926463252709901131972391509,0.1765627053669926463252709901131972391509,0.1680041021564500445099706637883231550211,0.1680041021564500445099706637883231550211,0.1540457610768102880814315948019586119404,0.1540457610768102880814315948019586119404,0.1351363684685254732863199817023501973721,0.1351363684685254732863199817023501973721,0.1118838471934039710947883856263559267358,0.1118838471934039710947883856263559267358,0.0850361483171791808835353701910620738504,0.0850361483171791808835353701910620738504,0.0554595293739872011294401653582446605128,0.0554595293739872011294401653582446605128,0.0241483028685479319601100262875653246916,0.0241483028685479319601100262875653246916],
  [0.1691423829631435918406564701349866103341,0.1691423829631435918406564701349866103341,0.1642764837458327229860537764659275904123,0.1642764837458327229860537764659275904123,0.1546846751262652449254180038363747721932,0.1546846751262652449254180038363747721932,0.1406429146706506512047313037519472280955,0.1406429146706506512047313037519472280955,0.1225552067114784601845191268002015552281,0.1225552067114784601845191268002015552281,0.1009420441062871655628139849248346070628,0.1009420441062871655628139849248346070628,0.0764257302548890565291296776166365256053,0.0764257302548890565291296776166365256053,0.0497145488949697964533349462026386416808,0.0497145488949697964533349462026386416808,0.0216160135264833103133427102664524693876,0.0216160135264833103133427102664524693876],
  [0.1610544498487836959791636253209167350399,0.1589688433939543476499564394650472016787,0.1589688433939543476499564394650472016787,0.1527660420658596667788554008976629984610,0.1527660420658596667788554008976629984610,0.1426067021736066117757461094419029724756,0.1426067021736066117757461094419029724756,0.1287539625393362276755157848568771170558,0.1287539625393362276755157848568771170558,0.1115666455473339947160239016817659974813,0.1115666455473339947160239016817659974813,0.0914900216224499994644620941238396526609,0.0914900216224499994644620941238396526609,0.0690445427376412265807082580060130449618,0.0690445427376412265807082580060130449618,0.0448142267656996003328381574019942119517,0.0448142267656996003328381574019942119517,0.0194617882297264770363120414644384357529,0.0194617882297264770363120414644384357529],
  [0.1527533871307258506980843319550975934919,0.1527533871307258506980843319550975934919,0.1491729864726037467878287370019694366926,0.1491729864726037467878287370019694366926,0.1420961093183820513292983250671649330345,0.1420961093183820513292983250671649330345,0.1316886384491766268984944997481631349161,0.1316886384491766268984944997481631349161,0.1181945319615184173123773777113822870050,0.1181945319615184173123773777113822870050,0.1019301198172404350367501354803498761666,0.1019301198172404350367501354803498761666,0.0832767415767047487247581432220462061001,0.0832767415767047487247581432220462061001,0.0626720483341090635695065351870416063516,0.0626720483341090635695065351870416063516,0.0406014298003869413310399522749321098790,0.0406014298003869413310399522749321098790,0.0176140071391521183118619623518528163621,0.0176140071391521183118619623518528163621],
  [0.1460811336496904271919851476833711882448,0.1445244039899700590638271665537525436099,0.1445244039899700590638271665537525436099,0.1398873947910731547221334238675831108927,0.1398873947910731547221334238675831108927,0.1322689386333374617810525744967756043290,0.1322689386333374617810525744967756043290,0.1218314160537285341953671771257335983563,0.1218314160537285341953671771257335983563,0.1087972991671483776634745780701056420336,0.1087972991671483776634745780701056420336,0.0934444234560338615532897411139320884835,0.0934444234560338615532897411139320884835,0.0761001136283793020170516533001831792261,0.0761001136283793020170516533001831792261,0.0571344254268572082836358264724479574912,0.0571344254268572082836358264724479574912,0.0369537897708524937999506682993296661889,0.0369537897708524937999506682993296661889,0.0160172282577743333242246168584710152658,0.0160172282577743333242246168584710152658],
  [0.1392518728556319933754102483418099578739,0.1392518728556319933754102483418099578739,0.1365414983460151713525738312315173965863,0.1365414983460151713525738312315173965863,0.1311735047870623707329649925303074458757,0.1311735047870623707329649925303074458757,0.1232523768105124242855609861548144719594,0.1232523768105124242855609861548144719594,0.1129322960805392183934006074217843191142,0.1129322960805392183934006074217843191142,0.1004141444428809649320788378305362823508,0.1004141444428809649320788378305362823508,0.0859416062170677274144436813727028661891,0.0859416062170677274144436813727028661891,0.0697964684245204880949614189302176573987,0.0697964684245204880949614189302176573987,0.0522933351526832859403120512732112561121,0.0522933351526832859403120512732112561121,0.0337749015848141547933022468659129013491,0.0337749015848141547933022468659129013491,0.0146279952982722006849910980471854451902,0.0146279952982722006849910980471854451902],
  [0.1336545721861061753514571105458443385831,0.1324620394046966173716424647033169258050,0.1324620394046966173716424647033169258050,0.1289057221880821499785953393997936532597,0.1289057221880821499785953393997936532597,0.1230490843067295304675784006720096548158,0.1230490843067295304675784006720096548158,0.1149966402224113649416435129339613014914,0.1149966402224113649416435129339613014914,0.1048920914645414100740861850147438548584,0.1048920914645414100740861850147438548584,0.0929157660600351474770186173697646486034,0.0929157660600351474770186173697646486034,0.0792814117767189549228925247420432269137,0.0792814117767189549228925247420432269137,0.0642324214085258521271696151589109980391,0.0642324214085258521271696151589109980391,0.0480376717310846685716410716320339965612,0.0480376717310846685716410716320339965612,0.0309880058569794443106942196418845053837,0.0309880058569794443106942196418845053837,0.0134118594871417720813094934586150649766,0.0134118594871417720813094934586150649766],
  [0.1279381953467521569740561652246953718517,0.1279381953467521569740561652246953718517,0.1258374563468282961213753825111836887264,0.1258374563468282961213753825111836887264,0.1216704729278033912044631534762624256070,0.1216704729278033912044631534762624256070,0.1155056680537256013533444839067835598622,0.1155056680537256013533444839067835598622,0.1074442701159656347825773424466062227946,0.1074442701159656347825773424466062227946,0.0976186521041138882698806644642471544279,0.0976186521041138882698806644642471544279,0.0861901615319532759171852029837426671850,0.0861901615319532759171852029837426671850,0.0733464814110803057340336152531165181193,0.0733464814110803057340336152531165181193,0.0592985849154367807463677585001085845412,0.0592985849154367807463677585001085845412,0.0442774388174198061686027482113382288593,0.0442774388174198061686027482113382288593,0.0285313886289336631813078159518782864491,0.0285313886289336631813078159518782864491,0.0123412297999871995468056670700372915759,0.0123412297999871995468056670700372915759]
];

// LUT for binomial coefficient arrays per curve order 'n'
var binomialCoefficients = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];

// Look up what the binomial coefficient is for pair {n,k}
function binomials(n, k) {
  return binomialCoefficients[n][k];
}

/**
 * Compute the curve derivative (hodograph) at t.
 */
function getDerivative(derivative, t, vs) {
  // the derivative of any 't'-less function is zero.
  var n = vs.length - 1,
      _vs,
      value,
      k;
  if (n === 0) {
    return 0;
  }

  // direct values? compute!
  if (derivative === 0) {
    value = 0;
    for (k = 0; k <= n; k++) {
      value += binomials(n, k) * Math.pow(1 - t, n - k) * Math.pow(t, k) * vs[k];
    }
    return value;
  } else {
    // Still some derivative? go down one order, then try
    // for the lower order curve's.
    _vs = new Array(n);
    for (k = 0; k < n; k++) {
      _vs[k] = n * (vs[k + 1] - vs[k]);
    }
    return getDerivative(derivative - 1, t, _vs);
  }
}

function B$1(xs, ys, t) {
  var xbase = getDerivative(1, t, xs);
  var ybase = getDerivative(1, t, ys);
  var combined = xbase * xbase + ybase * ybase;
  return Math.sqrt(combined);
}

function getCubicArcLength(xs, ys, t) {
  var z, sum, i, correctedT;

  /*if (xs.length >= tValues.length) {
    throw new Error('too high n bezier');
  }*/

  if (t === undefined) {
    t = 1;
  }
  var n = 20;

  z = t / 2;
  sum = 0;
  for (i = 0; i < n; i++) {
    correctedT = z * tValues[n][i] + z;
    sum += cValues[n][i] * B$1(xs, ys, correctedT);
  }
  return z * sum;
}

var LinearPosition = function(x0, x1, y0, y1) {
  return new LinearPosition$1(x0, x1, y0, y1);

};

function LinearPosition$1(x0, x1, y0, y1){
  this.x0 = x0;
  this.x1 = x1;
  this.y0 = y0;
  this.y1 = y1;
}

LinearPosition$1.prototype.getTotalLength = function(){
  return Math.sqrt(Math.pow(this.x0 - this.x1, 2) +
         Math.pow(this.y0 - this.y1, 2));
};

LinearPosition$1.prototype.getPointAtLength = function(pos){
  var fraction = pos/ (Math.sqrt(Math.pow(this.x0 - this.x1, 2) +
         Math.pow(this.y0 - this.y1, 2)));

  var newDeltaX = (this.x1 - this.x0)*fraction;
  var newDeltaY = (this.y1 - this.y0)*fraction;
  return { x: this.x0 + newDeltaX, y: this.y0 + newDeltaY };
};
LinearPosition$1.prototype.getTangentAtLength = function(){
  var module = Math.sqrt((this.x1 - this.x0) * (this.x1 - this.x0) +
              (this.y1 - this.y0) * (this.y1 - this.y0));
  return { x: (this.x1 - this.x0)/module, y: (this.y1 - this.y0)/module };
};
LinearPosition$1.prototype.getPropertiesAtLength = function(pos){
  var point = this.getPointAtLength(pos);
  var tangent = this.getTangentAtLength();
  return {x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y};
};

var svgPathProperties = function(svgString) {
  var length = 0;
  var partial_lengths = [];
  var functions = [];

  function svgProperties(string){
    if(!string){return null;}
    var parsed = parse$1(string);
    var cur = [0, 0];
    var prev_point = [0, 0];
    var curve;
    for (var i = 0; i < parsed.length; i++){
      //moveTo
      if(parsed[i][0] === "M"){
        cur = [parsed[i][1], parsed[i][2]];
        functions.push(null);
      } else if(parsed[i][0] === "m"){
        cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
        functions.push(null);
      }
      //lineTo
      else if(parsed[i][0] === "L"){
        length = length + Math.sqrt(Math.pow(cur[0] - parsed[i][1], 2) + Math.pow(cur[1] - parsed[i][2], 2));
        functions.push(new LinearPosition(cur[0], parsed[i][1], cur[1], parsed[i][2]));
        cur = [parsed[i][1], parsed[i][2]];
      } else if(parsed[i][0] === "l"){
        length = length + Math.sqrt(Math.pow(parsed[i][1], 2) + Math.pow(parsed[i][2], 2));
        functions.push(new LinearPosition(cur[0], parsed[i][1] + cur[0], cur[1], parsed[i][2] + cur[1]));
        cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
      } else if(parsed[i][0] === "H"){
        length = length + Math.abs(cur[0] - parsed[i][1]);
        functions.push(new LinearPosition(cur[0], parsed[i][1], cur[1], cur[1]));
        cur[0] = parsed[i][1];
      } else if(parsed[i][0] === "h"){
        length = length + Math.abs(parsed[i][1]);
        functions.push(new LinearPosition(cur[0], cur[0] + parsed[i][1], cur[1], cur[1]));
        cur[0] = parsed[i][1] + cur[0];
      } else if(parsed[i][0] === "V"){
        length = length + Math.abs(cur[1] - parsed[i][1]);
        functions.push(new LinearPosition(cur[0], cur[0], cur[1], parsed[i][1]));
        cur[1] = parsed[i][1];
      } else if(parsed[i][0] === "v"){
        length = length + Math.abs(parsed[i][1]);
        functions.push(new LinearPosition(cur[0], cur[0], cur[1], cur[1] + parsed[i][1]));
        cur[1] = parsed[i][1] + cur[1];
      //Close path
      }  else if(parsed[i][0] === "z" || parsed[i][0] === "Z"){
        length = length + Math.sqrt(Math.pow(parsed[0][1] - cur[0], 2) + Math.pow(parsed[0][2] - cur[1], 2));
        functions.push(new LinearPosition(cur[0], parsed[0][1], cur[1], parsed[0][2]));
        cur = [parsed[0][1], parsed[0][2]];
      }
      //Cubic Bezier curves
      else if(parsed[i][0] === "C"){
        curve = new Bezier(cur[0], cur[1] , parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4] , parsed[i][5], parsed[i][6]);
        length = length + curve.getTotalLength();
        cur = [parsed[i][5], parsed[i][6]];
        functions.push(curve);
      } else if(parsed[i][0] === "c"){
        curve = new Bezier(cur[0], cur[1] , cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4] , cur[0] + parsed[i][5], cur[1] + parsed[i][6]);
        length = length + curve.getTotalLength();
        cur = [parsed[i][5] + cur[0], parsed[i][6] + cur[1]];
        functions.push(curve);
      } else if(parsed[i][0] === "S"){
        if(i>0 && ["C","c","S","s"].indexOf(parsed[i-1][0]) > -1){
          curve = new Bezier(cur[0], cur[1] , 2*cur[0] - parsed[i-1][parsed[i-1].length - 4], 2*cur[1] - parsed[i-1][parsed[i-1].length - 3], parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4]);
        } else {
          curve = new Bezier(cur[0], cur[1] , cur[0], cur[1], parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4]);
        }
        length = length + curve.getTotalLength();
        cur = [parsed[i][3], parsed[i][4]];
        functions.push(curve);
      }  else if(parsed[i][0] === "s"){ //240 225
        if(i>0 && ["C","c","S","s"].indexOf(parsed[i-1][0]) > -1){
          curve = new Bezier(cur[0], cur[1] , cur[0] + curve.d.x - curve.c.x, cur[1] + curve.d.y - curve.c.y, cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
        } else {
          curve = new Bezier(cur[0], cur[1] , cur[0], cur[1], cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
        }
        length = length + curve.getTotalLength();
        cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
        functions.push(curve);
      }
      //Quadratic Bezier curves
      else if(parsed[i][0] === "Q"){
        curve = new Bezier(cur[0], cur[1] , parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4]);
        length = length + curve.getTotalLength();
        functions.push(curve);
        cur = [parsed[i][3], parsed[i][4]];
        prev_point = [parsed[i][1], parsed[i][2]];

      }  else if(parsed[i][0] === "q"){
        curve = new Bezier(cur[0], cur[1] , cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
        length = length + curve.getTotalLength();
        prev_point = [cur[0] + parsed[i][1], cur[1] + parsed[i][2]];
        cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
        functions.push(curve);
      } else if(parsed[i][0] === "T"){
        if(i>0 && ["Q","q","T","t"].indexOf(parsed[i-1][0]) > -1){
          curve = new Bezier(cur[0], cur[1] , 2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1] , parsed[i][1], parsed[i][2]);
        } else {
          curve = new LinearPosition(cur[0], parsed[i][1], cur[1], parsed[i][2]);
        }
        functions.push(curve);
        length = length + curve.getTotalLength();
        prev_point = [2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1]];
        cur = [parsed[i][1], parsed[i][2]];

      } else if(parsed[i][0] === "t"){
        if(i>0 && ["Q","q","T","t"].indexOf(parsed[i-1][0]) > -1){
          curve = new Bezier(cur[0], cur[1] , 2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1] , cur[0] + parsed[i][1], cur[1] + parsed[i][2]);
        } else {
          curve = new LinearPosition(cur[0], cur[0] + parsed[i][1], cur[1], cur[1] + parsed[i][2]);
        }
        length = length + curve.getTotalLength();
        prev_point = [2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1]];
        cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[0]];
        functions.push(curve);
      }
      partial_lengths.push(length);

    }
    return svgProperties;
  }

 svgProperties.getTotalLength = function(){
    return length;
  };

  svgProperties.getPointAtLength = function(fractionLength){
    var fractionPart = getPartAtLength(fractionLength);
    return functions[fractionPart.i].getPointAtLength(fractionPart.fraction);
  };

  svgProperties.getTangentAtLength = function(fractionLength){
    var fractionPart = getPartAtLength(fractionLength);
    return functions[fractionPart.i].getTangentAtLength(fractionPart.fraction);
  };

  svgProperties.getPropertiesAtLength = function(fractionLength){
    var fractionPart = getPartAtLength(fractionLength);
    return functions[fractionPart.i].getPropertiesAtLength(fractionPart.fraction);
  };

  var getPartAtLength = function(fractionLength){
    if(fractionLength < 0){
      fractionLength = 0;
    } else if(fractionLength > length){
      fractionLength = length;
    }

    var i = partial_lengths.length - 1;

    while(partial_lengths[i] >= fractionLength && partial_lengths[i] > 0){
      i--;
    }
    i++;
    return {fraction: fractionLength-partial_lengths[i-1], i: i};
  };

  return svgProperties(svgString);
};

/**
Aquest fitxer té tots els mèdoted epr a dibuixar dades
*/
/**
 * drawData crida la funció de dibuix que toqui segons la configuració
 * @property {Object} activeDataLayers - La capa d'*activeDataLayers* que es vol iterar i dibuixar
 * @property {Object} mapContext - El Canvas context on es dibuixaran les dades
 * @property {Object} path - El path de d3 amb la projecció
 * @return {Void}
 */
 function drawData(activeDataLayers, mapContext, path){
   var layersToDraw = {};
   Object.keys(activeDataLayers).forEach(function(varName){
     activeDataLayers[varName]['type'].forEach(function(drawType){
       layersToDraw[drawType] = varName;
     });
   });

   if(layersToDraw.hasOwnProperty('isobands')){
     drawIsobands(activeDataLayers[layersToDraw['isobands']], mapContext, path);
   }
   if(layersToDraw.hasOwnProperty('streamlines')){
     drawStreamlines(activeDataLayers[layersToDraw['streamlines']], mapContext, path);
   }
   if(layersToDraw.hasOwnProperty('isolines')){
     drawIsolinesLabels(activeDataLayers[layersToDraw['isolines']], mapContext, path);
   }
   if(layersToDraw.hasOwnProperty('barbs')){
     drawBarbs(activeDataLayers[layersToDraw['barbs']], mapContext, path);
   }

}

/**
 * Dibuixa isobandes al Canvas. Cridat des de drawData
 * @property {Object} dataLayer - L'objecte activeDataLayer a dibuixar
 * @property {Object} mapContext - El Canvas context on es dibuixaran les dades
 * @property {Object} path - El path de d3 amb la projecció
 * @return {Void}
 */
function drawIsobands(dataLayer, mapContext, path){
  mapContext.save();
  if(!dataLayer.bands){
    dataLayer.bands = isobands(dataLayer.data,
                dataLayer.geoTransform,
                dataLayer.activeScale.map(function(d){return d.value;})); //Posar scale a activeDataLayers
  }
  dataLayer.bands.features.forEach(function(d, i) {
    mapContext.beginPath();
    mapContext.globalAlpha = 1; //TODO: Configurable!
    mapContext.strokeStyle = "#000000";
    mapContext.lineWidth = 0.2;
    mapContext.fillStyle = dataLayer.activeScale[i].color;
    path(d);
    mapContext.fill();
    mapContext.stroke();
  });
  mapContext.restore();
}

/**
 * Funció idèntica a *drawIsolines*, però que afegeix etiquetes a les isolínies
 * @property {Object} dataLayer - L'objecte activeDataLayer a dibuixar
 * @property {Object} mapContext - El Canvas context on es dibuixaran les dades
 * @property {Object} path - El path de d3 amb la projecció
 */
function drawIsolinesLabels(dataLayer, mapContext, path){
  var separation = 300;
  if(!dataLayer.isolines){
    dataLayer.isolines = isolines(dataLayer.data,
                dataLayer.geoTransform,
                dataLayer.intervals);
  }

  var width = mapContext.canvas.width;
  var height = mapContext.canvas.height;
  var hiddenCanvas = select("body").append("canvas")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "hiddenCanvas")
        .style("display","none");
  var hiddenContext = hiddenCanvas.node().getContext("2d");

  var hiddenPathSVG = geoPath()
        .projection(path.projection());
  var hiddenPath = geoPath()
        .projection(path.projection()).context(hiddenContext);

  if(dataLayer.strokeStyle){
    hiddenContext.strokeStyle = dataLayer.strokeStyle;
  } else {
    hiddenContext.strokeStyle = "#000000";
  }
  if(dataLayer.lineWidth){
    hiddenContext.lineWidth = dataLayer.lineWidth;
  } else {
    hiddenContext.lineWidth = 1;
  }

  dataLayer.isolines.features.forEach(function(d, i) {
    var properties = svgPathProperties(hiddenPathSVG(d));

    hiddenContext.beginPath();
    hiddenPath(d);
    hiddenContext.stroke();
    if(properties!==null){
    for(var j = 0; j< Math.floor(properties.getTotalLength()/separation); j++){
        var pos = properties.getPropertiesAtLength(separation/(1+i%3) + separation*j);
        var degrees = Math.atan(pos.tangentY/pos.tangentX);
        var text = d.properties[0].value;
        hiddenContext.save();

        hiddenContext.translate(pos.x, pos.y);
        hiddenContext.rotate(degrees);

        hiddenContext.font="15px Georgia";

        hiddenContext.clearRect(-2-hiddenContext.measureText(text).width/2 , -8, 4 + hiddenContext.measureText(text).width, 19);
        hiddenContext.fillStyle = "#500";
    		hiddenContext.fillText(text, -hiddenContext.measureText(text).width/2, 7.5);
        hiddenContext.restore();
      }}
  });
  mapContext.drawImage(hiddenCanvas.node(), 0, 0, width, height);
}

/**
 * Dibuixa barbes de vent. Cridat des de drawData. La mida, intèrval, etc de les barbes es pot canviar des de la configuració.
 * @property {Object} dataLayer - L'objecte activeDataLayer a dibuixar
 * @property {Object} mapContext - El Canvas context on es dibuixaran les dades
 * @property {Object} path - El path de d3 amb la projecció
 * @return {Void}
 */
function drawBarbs(dataLayer, mapContext, path){
  var barbSize = ("barbSize" in dataLayer)?dataLayer.barbSize:40;
  var lineWidth = ("lineWidth" in dataLayer)?dataLayer.lineWidth:1;
  var strokeStyle = ("strokeStyle" in dataLayer)?dataLayer.strokeStyle:"#444";
  var width = mapContext.canvas.clientWidth;
  var height = mapContext.canvas.clientHeight;
  var xPos = range$1(barbSize, width, barbSize);
  var yPos = range$1(barbSize, height, barbSize);

  xPos.forEach(function(x){
    yPos.forEach(function(y){
      var coords = path.projection().invert([x,y]);
      var px = Math.round((coords[0] - dataLayer.geoTransform[0]) / dataLayer.geoTransform[1]);
      var py = Math.round((coords[1] - dataLayer.geoTransform[3]) / dataLayer.geoTransform[5]);
      if(py >= 0 && px >= 0 && py < dataLayer.data.length && px <= dataLayer.data[0].length){
        var spd5 = dataLayer.data[py][px]/5;
        var angle = dataLayer.dirData[py][px];
        if(!isNaN(spd5) && !isNaN(angle)){
        spd5 = Math.round(spd5);
        var spd10 = Math.floor(spd5/2);
        spd5 = spd5%2;
        var spd50 = Math.floor(spd10/5);
        spd10 = spd10%5;
        mapContext.save();
        mapContext.translate(x, y);
        mapContext.rotate(angle);
        mapContext.beginPath();
        mapContext.strokeStyle = strokeStyle;
        mapContext.lineWidth = lineWidth;

        var pos = -barbSize/2;
        var separation = 3;

        for(var i=0; i<spd50; i++){
          mapContext.moveTo(pos, 0);
          mapContext.lineTo(pos+barbSize/8, barbSize/4);
          mapContext.lineTo(pos+barbSize/4, 0);
          pos = pos + barbSize/4 + separation;
          mapContext.fill();
        }
        for(var i$1=0; i$1<spd10; i$1++){
          mapContext.moveTo(pos, 0);
          mapContext.lineTo(pos, barbSize/3);
          pos = pos + separation;
        }
        if(spd5===1){
          if (pos === -barbSize/2){
            pos = pos + separation;
          }
          mapContext.moveTo(pos, 0);
          mapContext.lineTo(pos, barbSize/6);
        }
        if(spd5 === 0 && spd10 === 0 && spd50 === 0){
          mapContext.arc(0, 0, 4, 0, 2 * Math.PI, false);
        } else {
          mapContext.moveTo(-barbSize/2,0);
          mapContext.lineTo(barbSize/2,0);
        }
        mapContext.stroke();
        mapContext.restore();
      }}
    });
  });

}

/**
 * Dibuixa línies de corrent. Cridat des de drawData
 * strokeStyle and lineWidth can be changed in the config file.
 * @property {Object} dataLayer - L'objecte activeDataLayer a dibuixar
 * @property {Object} mapContext - El Canvas context on es dibuixaran les dades
 * @property {Object} path - El path de d3 amb la projecció
 * @return {Void}
 */
function drawStreamlines(dataLayer, mapContext, path){
  mapContext.save();
  if(!dataLayer.streamlines){
    dataLayer.streamlines = streamlines(dataLayer.dataU, dataLayer.dataV, dataLayer.geoTransform);
  }
  dataLayer.streamlines.features.forEach(function(d) {
    mapContext.beginPath();
    mapContext.globalAlpha = 0.7; //TODO: Configurable!
    if(dataLayer.strokeStyle){
      mapContext.strokeStyle = dataLayer.strokeStyle;
    } else {
      mapContext.strokeStyle = "#000000";
    }
    if(dataLayer.lineWidth){
      mapContext.lineWidth = dataLayer.lineWidth;
    } else {
      mapContext.lineWidth = 1;
    }
    path(d);
    mapContext.stroke();
    });
    mapContext.restore();
}

/**
* Aquest fitxer conté les funcions per mostrar i canviar les escales de colors
*/
/**
 * Funció principal. És un *closure*, pel que les variables seran provades i
 * retorna la classe ColorScaleClass.
 * Els mètodes estan fets seguint l'exemple de D3. Es poden cridar de manera encadenada
 * per poder anar canviant les propietats per defecte.
 */
function ColorScale(){
var squareWidth = 20, squareHeight = 20, squareSeparation = 2;
var title = '', textSize = 12;
var scaleValues = [];
var parent, scaleG;
var editable = false;
var dispatcher = dispatch("change");

/**
 * Aquesta és la classe que realment mostra i canvia les escales de colors
 * @class
 * @property {Object} rootDiv - L'element del DOM on s'afegirà la visualització de l'escala
 */
function ColorScaleClass(rootDiv){
  parent = rootDiv;
  rootDiv.selectAll("svg")
    .transition()
    .attr('opacity', 0)
    .remove();

  var svg = rootDiv.append("svg")
    .attr("height", 45 + (squareHeight+squareSeparation)*scaleValues.length)
    .attr('opacity', 0);

  if(editable===true){
    svg.append("image")
      .attr("xlink:href", "img/plus.svg")
      .attr("y", 10)
      .attr("x", 85)
      .attr("width", 12)
      .attr("height", 12)
      .on("click", function(){
          svg.attr("height", svg.attr("height") + squareHeight+squareSeparation);

          var newValue = {value: 0, color: "#ffffff"};
          scaleValues.push(newValue);
          draw();
          form(newValue);
      });
  }

  svg.append("image")
    .attr("xlink:href", "img/close.svg")
    .attr("y", 10)
    .attr("x", 100)
    .attr("width", 12)
    .attr("height", 12)
    .on("click", function() {
      rootDiv.selectAll("svg")
      .transition()
      .attr('opacity', 0)
      .remove();
    });

    svg.append("g")
      .attr("transform", "translate(5,35)")
      .append("text")
      .text(title);

    scaleG = svg.append("g")
      .attr("transform", "translate(5,45)");

  draw();
  svg
  .transition()
  .attr('opacity', 1);
}

  /**
  * Canvia l'amplada del quadrat amb el color de l'escala
  * @property {integer} L'amplada
  * @return {Object} La classe per poder continuar cridant mètodes en cadena
  */
  ColorScaleClass.squareWidth = function(_){
    squareWidth = _;
    return ColorScaleClass;
  };

  /**
  * Canvia l'alçada del quadrat amb el color de l'escala
  * @property {integer} L'alçada
  * @return {Object} La classe per poder continuar cridant mètodes en cadena
  */
  ColorScaleClass.squareHeight = function(_){
    squareHeight = _;
    return ColorScaleClass;
  };

  /**
  * Canvia la separació entre els quadrats amb el color de l'escala
  * @property {integer} La separació
  * @return {Object} La classe per poder continuar cridant mètodes en cadena
  */
  ColorScaleClass.squareSeparation = function(_){
    squareSeparation = _;
    return ColorScaleClass;
  };

  /**
  * Canvia el títol de l'escala
  * @property {String} El títol
  * @return {Object} La classe per poder continuar cridant mètodes en cadena
  */
  ColorScaleClass.title = function(_){
    title = _;
    return ColorScaleClass;
  };

  /**
  * Canvia la mida de les lletres de l'escala
  * @property {integer} La mida del text
  * @return {Object} La classe per poder continuar cridant mètodes en cadena
  */
  ColorScaleClass.textSize = function(_){
    textSize = _;
    return ColorScaleClass;
  };

  /**
  * Determina si l'escala de color serà editable o no
  * @property {boolean} El permís d'edició
  * @return {Object} La classe per poder continuar cridant mètodes en cadena
  */
  ColorScaleClass.editable = function(_){
    editable = _;
    return ColorScaleClass;
  };

  /**
  * L'array amb els valors a representar a l'escala
  * @property {Array.Object} La llista de valors. Cada un ha de tenir els camps *value* i +color*
  * @return {Object} La classe per poder continuar cridant mètodes en cadena
  */
  ColorScaleClass.scaleValues = function(_){
    scaleValues = JSON.parse(JSON.stringify(_));
    return ColorScaleClass;
  };

  /**
  * Emet un event. Permet cridar funcions quan es faci click, passi per sobre, etc. sobre els elements
  * @return {Object} El dispatcher. Serà una cosa o altra depenent de l'event
  */
  ColorScaleClass.on = function(){
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? ColorScaleClass : value;
  };

/**
* La funció que dibuixa l'escala. Es crida des del constructor de la classe, no cal cridar-la mai
*/
function draw(){
  var colorSelection = scaleG.selectAll(".step")
    .data(scaleValues.sort(function(a, b){
        return b.value-a.value;
    }), function(d) { return(d.value+d.color); });


    var colorSelectionEnter = colorSelection
      .enter()
      .append("g")
      .attr("class","step")
      .attr("transform", function(d, i){return"translate(10, "+i*(squareHeight+squareSeparation)+")";})
      .on("mouseover", function(){
          select(this)
            .selectAll(".close")
            .style("opacity", 1);
      })
      .on("mouseout", function(){
        select(this)
          .selectAll(".close")
          .style("opacity", 0);
      });

    colorSelectionEnter.append("rect")
      .attr("width", squareWidth)
      .attr("height", squareHeight)
      .attr("x", 0)
      .attr("y", 0)
      .style("fill",function(d, i){return (i===0)?"#ffffff":d.color;})
      .style("stroke", "#000")
      .on("click", function(d){
        if(editable===true){
          form(d);
        }
      });

    colorSelectionEnter.append("text")
      .attr("x", squareWidth + squareWidth/8)
      .attr("y", 30*squareHeight/40)
      .style("fill", "#333")
      .style("font-size", textSize+"px")
      .style("font-family", "Verdana")
      .text(function(d, i){return (i===0)?">"+d.value:d.value+" a "+scaleValues[i-1].value;});

    //remove
    if(editable===true){
      colorSelectionEnter.append("path")
        .attr("class", "close")
        .attr("d", "M387.128,170.748L306,251.915l-81.128-81.167l-54.124,54.124L251.915,306l-81.128,81.128l54.085,54.086L306,360.086     l81.128,81.128l54.086-54.086L360.086,306l81.128-81.128L387.128,170.748z M522.38,89.62 c-119.493-119.493-313.267-119.493-432.76,0c-119.493,119.493-119.493,313.267,0,432.76 c119.493,119.493,313.267,119.493,432.76,0C641.873,402.888,641.873,209.113,522.38,89.62z M468.295,468.295 c-89.62,89.619-234.932,89.619-324.551,0c-89.62-89.62-89.62-234.932,0-324.551c89.62-89.62,234.931-89.62,324.551,0 C557.914,233.363,557.914,378.637,468.295,468.295z")
        .attr("transform", "translate(1,1) scale(0.018)")
        .style("fill", function(d){return [1, 3, 5].reduce(function(a, b){return a + parseInt(d.color.substr(b,2),16);}, 0)<382?"#ffffff":"#000000";})
        .style("stroke", "#000")
        .style("opacity", 0)
        .on("click", function(d) {
            scaleValues = scaleValues.filter(function ( obj ) {
            return obj.value !== d.value;
            });
            dispatcher.call("change", {},
              scaleValues.slice(0).sort(function(a, b){ //slice(0) per evitar bugs clonant
                return a.value-b.value;
              }));
            draw();
        });
      }

    //Treure un element
    colorSelection.exit()
      .transition()
      .duration(1000)
      .style("opacity", 0)

      .remove();

    //canviar un element ja existent(update)
    colorSelection
      .transition()
      .delay(1000)
      .duration(1000)
      .attr("transform", function(d, i){return"translate(10, "+i*(squareHeight+squareSeparation)+")";});

    colorSelection.each(function(d, i) {
      select(this).selectAll('text')
          .text(function(e){return (i===0)?">"+d.value:d.value+" a "+scaleValues[i-1].value;});
      select(this).selectAll('rect')
            .style("fill",function(d, i){return d.color;});
    });

  }

  /**
  * La funció que dibuixa el selector de valors i color quan es vol editar.
  * S'executa des d'events a l'escala dibuixada a *draw*
  */
  function form(obj){
    parent.selectAll(".colorScaleForm")
      .remove();

    var formDiv = select("body")
      .append("div")
      .attr("class", "colorScaleForm")
      .style("position", "absolute")
      .style("left", (20+event.pageX)+"px")
      .style("top", event.pageY+"px")
      .style("background-color","rgba(128, 128, 128, 0.55)")
      .style("border-radius","5px")
      .style("padding","5px");

    formDiv.append("label")
    .text("Value");

    formDiv.append("input")
    .attr("class", "valueField")
    .attr("type", "text")
    .attr("pattern", "[0-9]+([\.,][0-9]+)?") //Permetre comes i punts
    .attr("size", 8)
    .attr("value", obj.value);

    formDiv.append("label")
    .text("Color");

    formDiv.append("input")
    .attr("class", "colorField")
    .attr("type", "color")
    .attr("value", obj.color);

    formDiv.append("button")
    .text("Set")
    .on("click", function(){
      var value = Number(formDiv.select(".valueField").node().value.replace(",","."));
      if(!isNaN(value)){
        scaleValues[scaleValues.indexOf(obj)] = {value: value,
                                                color: formDiv.select(".colorField").node().value};
        dispatcher.call("change", {},
        scaleValues.slice(0).sort(function(a, b){ //slice(0) crea array nou per evitar bugs
          return a.value-b.value;
        }));
        draw();

        formDiv.transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();
    }
    });

    formDiv.append("button")
    .text("Cancel")
    .on("click", function(){
      formDiv.transition()
      .duration(1000)
      .style("opacity", 0)
      .remove();
    });
  }

return ColorScaleClass;
}

/**
 * El modul principal. Tot comença aquí.
 */
/**
 * Viewer és la classe que permet la interacció.
 * Pot activar i desactivar capes, veure quines estan actives, animaer-les, etc.
 * Veure els mètodes per saber-ne totes les possibilitats.
 * El constructor crea funcions privades per a dibuixar, respondre als clicks, etc.
 *
 * @class
 * @param {Object} config - L'objecte de configuració carregat des de config.json
 * @param {Function} callback - La callback function que es cridarà quan la capa s'hagi carregat
 */
function viewer(rootDiv, configFile, callback) {
  this.config = null;
  this.dataManager = null;
  this.playStatus = false;
  var that = this;
  json(configFile, function(error, config) {
    that.config = config;

    var mapWidth = config.width,
        mapHeight = config.height;

    var projection = setProjection(config);


    var mapCanvas = rootDiv.append("canvas")
      .attr("width", mapWidth)
      .attr("height", mapHeight)
      .style("float", "left")
      .on("wheel.zoom",function(){
        var currScale = projection.scale();
        var newScale = Math.max(config.minScale,Math.min(
          config.maxScale, currScale - (event.deltaY/Math.abs(event.deltaY)) * ((config.maxScale - config.minScale)/30)));
        projection.scale(newScale);
        that.draw();
      })
      .call(drag().on("drag", function(){
        var currTranslate = projection.translate();
        projection.translate([currTranslate[0] + event.dx,
                              currTranslate[1] + event.dy]);
        that.draw();
      }));

    that.scaleArea = rootDiv.append("div")
        .attr("id", "scaleArea")
        .style("height", config.height+"px")
        .style("width", "200px")
        .style("float", "left");

    var statusArea = rootDiv.append("div")
        .attr("id", "statusArea")
        .style("width", config.width+"px");

    that.dateArea = statusArea.append("div")
        .attr("id", "dateArea");
    that.layersArea = statusArea.append("div")
        .attr("id", "layersArea");

    var toolTip = rootDiv.append("div")
      .attr("id", "toolTip")
      .style("position", "absolute")
      .style("z-index", 10)
      .style("height", "auto") //Evitem calcular-ne l'alçada
      .style("transition", ".2s") //Evitem moviments de transició
      .style("opacity", 0);

    toolTip.append("img")
        .attr("src", "img/close.svg")
        .attr("width", "15px")
        .style("position", "absolute")
        .style("top", "3px")
        .style("right", "5px")
        .style("pointer-events", "all")
        .on("click", function() {
          toolTip.transition()
            .duration(1000)
            .style("opacity", 0);
        });

    var toolTipText = toolTip.append("div");

    /**
     * El comportament del tooltip quan es fa click al mapa
     */
    mapCanvas.on("click", function() {
      var screenCoords = mouse(this);
      var coords = projection.invert(screenCoords);
      var activeDataLayers = that.dataManager.getActiveDataLayers();
      var tooltipString = "";
      Object.keys(activeDataLayers).forEach(function(layerName){
        var xTiff = (coords[0] - activeDataLayers[layerName].geoTransform[0])/activeDataLayers[layerName].geoTransform[1];
        var yTiff = (coords[1] - activeDataLayers[layerName].geoTransform[3])/activeDataLayers[layerName].geoTransform[5];
        var value = null;
        var dirValue = null;
        if(activeDataLayers[layerName].data[Math.round(yTiff)]){
          value = activeDataLayers[layerName].data[Math.round(yTiff)][Math.round(xTiff)];
        }
        if("dirData" in activeDataLayers[layerName]){
          dirValue = (180/3.14)*activeDataLayers[layerName].dirData[Math.round(yTiff)][Math.round(xTiff)];
        }
        if(value!=null){
          if(tooltipString!==""){tooltipString += "</br>";}
          tooltipString += activeDataLayers[layerName].model + "-" + activeDataLayers[layerName].variable +
          "-" + activeDataLayers[layerName].level + "<br/>" + value.toFixed(1) + " " +
          activeDataLayers[layerName].units;
          if(dirValue){
            tooltipString += " - " + dirValue.toFixed(0) + "º";
          }
        }
      });

      toolTip
        .style("left", screenCoords[0] + "px")
        .style("top", screenCoords[1] + "px");
      toolTipText.html(tooltipString);

      if(toolTip.style("opacity") !== 1){
        toolTip.transition()
          .duration(1000)
          .style("opacity", 1);
      }


    });

    var mapContext = mapCanvas.node().getContext("2d");

    var path = geoPath()
      .projection(projection)
      .context(mapContext);

  /**
  * Calls the necessary funtions to draw all the map. Including both backgrounds and data layers.
  * Sets the current status text
  * Called as a callback function after loading the data
  */
   that.draw = function(){
      var activeDataLayers = that.dataManager.getActiveDataLayers();
      var activeBackgroundLayers = that.dataManager.getActiveBackgroundLayers();

      path.projection(projection);
      mapContext.clearRect(0, 0, mapWidth, mapHeight);

      //background de sota
      Object.keys(activeBackgroundLayers).forEach(function(varName){
        if('bottomFill' in activeBackgroundLayers[varName]){
          var pathData = activeBackgroundLayers[varName].data;
          mapContext.fillStyle = activeBackgroundLayers[varName].bottomFill;
          mapContext.beginPath();
          path(pathData);
          mapContext.fill();
        }
      });

      //Dibuix de les dades
      drawData(activeDataLayers, mapContext, path);

      //background de dalt
      Object.keys(activeBackgroundLayers).forEach(function(varName){
        if('topStroke' in activeBackgroundLayers[varName]){
          var pathData = activeBackgroundLayers[varName].data;
          mapContext.strokeStyle = activeBackgroundLayers[varName].topStroke;
          mapContext.beginPath();
          path(pathData);
          mapContext.stroke();
        } else if(activeBackgroundLayers[varName]['type'] === 'points'){
          mapContext.fillStyle = activeBackgroundLayers[varName].pointFill;
          mapContext.font = activeBackgroundLayers[varName].font;
          activeBackgroundLayers[varName].data.features.forEach(function(d){
            var coords = projection(d.geometry.coordinates);
            mapContext.fillRect(coords[0]-2.5, coords[1]-2.5, 5, 5);
            mapContext.fillText(d.properties.name,coords[0] + 3, coords[1] - 3);
          });
        }
      });
    //Escrivint les dades d'informació (data i capes actives)
    var day = that.dataManager.getDate().getUTCDay();
    day = day<10?"0"+day:day;
    var month = that.dataManager.getDate().getUTCMonth() + 1;
    month = month<10?"0"+month:month;
    var hour = that.dataManager.getDate().getUTCHours();
    hour = hour<10?"0"+hour:hour;

    that.dateArea.text(that.dataManager.getDate().getUTCFullYear() + "-" +
                       month + "-" + day + " " + hour + ":00 UTC +" +
                     that.dataManager.getCurrentHours());

    var layersText = "";
     Object.keys(activeDataLayers).forEach(function(layerName){
       layersText += activeDataLayers[layerName].model + " - " +
                    activeDataLayers[layerName].variable + " - " +
                    activeDataLayers[layerName].level + " / ";
     });
    that.layersArea.text(layersText.substring(0, layersText.length - 3));

    };

    that.dataManager = new dataManager(config, that.draw);
    if(callback){callback();} //No tinc clar que no hi sigui sempre
    });

}

/**
 * Retorna l'objecte de configuració
 * @return {Object} L'objecte de configuració
 */
viewer.prototype.getConfig = function(){
  return this.config;
};

/**
 * Retorna l'objecte de capes de dades actives (activeDataLayers)
 * @return {Object} L'objecte activeDataLayers
 */
viewer.prototype.getActiveDataLayers = function(){
  return this.dataManager.getActiveDataLayers();
};

/**
 * Retorna l'objecte de capes de fons actives (activeBackgroundLayers)
 * @return {Object}  L'objecte activeBackgroundLayers
 */
viewer.prototype.getActiveBackgroundLayers = function(){
  return this.dataManager.getActiveBackgroundLayers();
};

/**
 * Afegeix una capa de fons al mapa
 * @param {String} layerName - El nom de la capa com ve definit a l'arxiu de configuració
 * @return {Void}
 */
viewer.prototype.addBackgroundLayer = function(layerName){
  this.dataManager.addBackgroundLayer(this.config.backgroundLayers[layerName], layerName, this.draw);
};

/**
 * Elimina una capa de fons del mapa
 * @param {String} layerName - El nom de la capa com ve definit a l'arxiu de configuració
 * @return {Void}
 */
viewer.prototype.removeBackgroundLayer = function(layerName){
  this.dataManager.removeBackgroundLayer(layerName, this.draw);
};

/**
 * Afegeix una capa de dades al mapa. Si la capa ja hi és, la treu.
 * Si hi ha alguna capa de tipus incompatible activa, la desactivarà abans d'afegir la nova.
 * @param {String} layerName - El nom de la capa escrit com a la clau a la secció dataLayers de config.json
 * @param {String} typeName - El tipus de visualització, d'entre les disponibles a la configuració (p.e. isolines. És opcional. Si només hi ha una possibilitat, es pot deixar buit.
 * @return {Void}
 */
viewer.prototype.toggleDataLayer = function(layerName, typeName){
  var activeDataLayers = this.dataManager.getActiveDataLayers();

  if(!(layerName in activeDataLayers)) {
    this.dataManager.addDataLayer(this.config.dataLayers[layerName], layerName, this.draw, typeName);
  } else if(!typeName){
    this.dataManager.removeDataLayer(layerName, this.draw);
  } else if(activeDataLayers[layerName].type.indexOf(typeName)===-1){
    activeDataLayers[layerName].type.push(typeName);
    this.draw();
  } else {
    var newType = [];
    activeDataLayers[layerName].type.forEach(function(activeTypeName){
      if(activeTypeName!==typeName){
        newType.push(activeTypeName);
      }
    });
    activeDataLayers[layerName].type = newType;
    if(activeDataLayers[layerName].type.length === 0){
      this.dataManager.removeDataLayer(layerName, this.draw);
    } else {
      this.draw();
    }
  }

};

/**
* Avança la data un intèrval (hora, tres hores, el que toqui). Si no es pot, no es fa res.
* @return {Void}
*/
viewer.prototype.ff = function(){
  var playParameters = this.dataManager.getPlayParameters();
  var currentHour;
  if(this.dataManager.getCurrentHours() < playParameters.maxTime){
    currentHour = this.dataManager.incrementCurrentTime(playParameters.timeStep, this.draw);
  }
  if(currentHour >= playParameters.maxTime) {return false;} else {return true;}
};


/**
* Retrocedeix la data un intèrval (hora, tres hores, el que toqui). Si no es pot, no es fa res.
* @return {Void}
*/
viewer.prototype.fb = function(){
  var playParameters = this.dataManager.getPlayParameters();
  var currentHour;
  if(this.dataManager.getCurrentHours() > 0){
    currentHour = this.dataManager.incrementCurrentTime(-1*playParameters.timeStep, this.draw);
  }
  if(currentHour <= 0) {return false;} else {return true;}
};

/**
* Posa en marxa i atura l'animació. En canvia l'estat.
* @return {Void}
*/
viewer.prototype.playStop = function(){
  var playParameters = this.dataManager.getPlayParameters();
  var that = this;
  if(!this.playStatus){
    this.playStatus = true;
    this.playInterval= interval$1(function() {
      var currentHour = that.dataManager.getCurrentHours();
      if(currentHour + playParameters.timeStep <= playParameters.maxTime){
        that.dataManager.incrementCurrentTime(playParameters.timeStep, that.draw);
      } else {
        that.dataManager.setCurrentTime(0, that.draw);
      }

    }, 1000);
  } else {
    this.playStatus = false;
    this.playInterval.stop();
  }
};

/**
* Canvia la data de la sortida dels models
* @param {Date} date - La nova data
* @return {Void}
*/
viewer.prototype.setDate = function(date){
  this.dataManager.setDate(date, this.draw);
};

/**
* Canvia l'escala de color de les isobandes.
* @param {String} layerName - el nom de la capa
* @param {String} scaleName - el nom de l'escala, dels disponibles a la configuració
* @return {Void}
*/
viewer.prototype.setScale = function(layerName, scaleName){
  var dataLayer = this.dataManager.getActiveDataLayers()[layerName];
  dataLayer['activeScale'] = this.config.scales[scaleName];
  dataLayer['activeScaleName'] = scaleName;

  this.scaleArea.selectAll("svg")
    .attr("opacity", 1)
    .transition()
    .attr("opacity", 0)
    .remove(); //Remove editor if open
  delete dataLayer.bands; //So it will be calculated again, with the new intervals
  this.draw();
};

/**
* Mostra l'escala de colors de les isobandes. Si és l'escala activa, serà editable.
* @param {String} layerName - el nom de la capa
* @param {String} scaleName - el nom de l'escala, dels disponibles a la configuració
* @return {Void}
*/
viewer.prototype.showScale = function(layerName, scaleName){
  var dataLayer = this.dataManager.getActiveDataLayers()[layerName];
  var that = this;
  var scale = new ColorScale()
    .squareWidth(20)
    .squareHeight(20)
    .squareSeparation(this.config.scaleRectSep)
    .textSize(this.config.scaleTextSize)
    .title(this.config.dataLayers[layerName].variable + " ("+this.config.dataLayers[layerName].units+")")
    .scaleValues(this.config.scales[scaleName])
    .editable(scaleName === dataLayer.activeScaleName)
    .on("change", function(d){
      dataLayer.activeScale = d;
      delete dataLayer.bands;
      that.draw();
    });
  this.scaleArea.call(scale);

};

/**
* Funció que generaq la projecció d3js per a mostrar les dades. Es crida des dela classe viewer
* @param {Object} config - L'objecte de configuració carregat des de l'arxui de configuració
* @return {Void}
*/
function setProjection(config){
  var projection = null;
  if(config.projection.name === "geoMercator"){
    projection = geoMercator();
  } else if(config.projection.name === "geoConicConformal"){
    projection = geoConicConformal();
  }
  if(config.projection.rotate){
    projection.rotate(config.projection.rotate);
  }
  if(config.projection.center){
    projection.center(config.projection.center);
  }

  projection.translate([config.width / 2, config.height / 2])
  .scale(config.projection.iniScale);
  return projection;
}

exports.select = select;
exports.viewer = viewer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
