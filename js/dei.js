/*! decimal.js v5.0.8 https://github.com/MikeMcl/decimal.js/LICENCE */
;(function (globalScope) {
  'use strict';


  /*
   *  decimal.js v5.0.8
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2016 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Expat Licence
   */


  // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //


    // The maximum exponent magnitude.
    // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
  var EXP_LIMIT = 9e15,                      // 0 to 9e15

    // The limit on the value of `precision`, and on the value of the first argument to
    // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
    MAX_DIGITS = 1e9,                        // 0 to 1e9

    // The base 88 alphabet used by `toJSON` and `fromJSON`.
    // 7 printable ASCII characters omitted (space) \ " & ' < >
    NUMERALS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./:;=?@[]^_`{|}~',

    // The natural logarithm of 10 (1025 digits).
    LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',

    // Pi (1025 digits).
    PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',


    // The initial configuration properties of the Decimal constructor.
    Decimal = {

      // These values must be integers within the stated ranges (inclusive).
      // Most of these values can be changed during run-time using `Decimal.config`.

      // The maximum number of significant digits of the result of a calculation or base conversion.
      // E.g. `Decimal.config({ precision: 20 });`
      precision: 20,                         // 1 to MAX_DIGITS

      // The rounding mode used when rounding to `precision`.
      //
      // ROUND_UP         0 Away from zero.
      // ROUND_DOWN       1 Towards zero.
      // ROUND_CEIL       2 Towards +Infinity.
      // ROUND_FLOOR      3 Towards -Infinity.
      // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      //
      // E.g.
      // `Decimal.rounding = 4;`
      // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
      rounding: 4,                           // 0 to 8

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP         0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
      // FLOOR      3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN  6 The IEEE 754 remainder function.
      // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
      //
      // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
      // division (9) are commonly used for the modulus operation. The other rounding modes can also
      // be used, but they may not give useful results.
      modulo: 1,                             // 0 to 9

      // The exponent value at and beneath which `toString` returns exponential notation.
      // JavaScript numbers: -7
      toExpNeg: -7,                          // 0 to -EXP_LIMIT

      // The exponent value at and above which `toString` returns exponential notation.
      // JavaScript numbers: 21
      toExpPos:  21,                         // 0 to EXP_LIMIT

      // The minimum exponent value, beneath which underflow to zero occurs.
      // JavaScript numbers: -324  (5e-324)
      minE: -EXP_LIMIT,                      // -1 to -EXP_LIMIT

      // The maximum exponent value, above which overflow to Infinity occurs.
      // JavaScript numbers: 308  (1.7976931348623157e+308)
      maxE: EXP_LIMIT,                       // 1 to EXP_LIMIT

      // Whether to use cryptographically-secure random number generation, if available.
      crypto: void 0                         // true/false/undefined
    },


  // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //


    inexact, noConflict, quadrant,
    cryptoObject = typeof crypto != 'undefined' ? crypto : null,
    external = true,

    decimalError = '[DecimalError] ',
    invalidArgument = decimalError + 'Invalid argument: ',
    precisionLimitExceeded = decimalError + 'Precision limit exceeded',

    mathfloor = Math.floor,
    mathpow = Math.pow,

    isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
    isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
    isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
    isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

    BASE = 1e7,
    LOG_BASE = 7,
    MAX_SAFE_INTEGER = 9007199254740991,

    LN10_PRECISION = LN10.length - 1,
    PI_PRECISION = PI.length - 1,

    // Decimal.prototype object
    P = {};


  // Decimal prototype methods


  /*
   *  absoluteValue             abs
   *  ceil
   *  comparedTo                cmp
   *  cosine                    cos
   *  cubeRoot                  cbrt
   *  decimalPlaces             dp
   *  dividedBy                 div
   *  dividedToIntegerBy        divToInt
   *  equals                    eq
   *  floor
   *  greaterThan               gt
   *  greaterThanOrEqualTo      gte
   *  hyperbolicCosine          cosh
   *  hyperbolicSine            sinh
   *  hyperbolicTangent         tanh
   *  inverseCosine             acos
   *  inverseHyperbolicCosine   acosh
   *  inverseHyperbolicSine     asinh
   *  inverseHyperbolicTangent  atanh
   *  inverseSine               asin
   *  inverseTangent            atan
   *  isFinite
   *  isInteger                 isInt
   *  isNaN
   *  isNegative                isNeg
   *  isPositive                isPos
   *  isZero
   *  lessThan                  lt
   *  lessThanOrEqualTo         lte
   *  logarithm                 log
   *  [maximum]                 [max]
   *  [minimum]                 [min]
   *  minus                     sub
   *  modulo                    mod
   *  naturalExponential        exp
   *  naturalLogarithm          ln
   *  negated                   neg
   *  plus                      add
   *  precision                 sd
   *  round
   *  sine                      sin
   *  squareRoot                sqrt
   *  tangent                   tan
   *  times                     mul
   *  toBinary
   *  toDecimalPlaces           toDP
   *  toExponential
   *  toFixed
   *  toFraction
   *  toHexadecimal             toHex
   *  toJSON
   *  toNearest
   *  toNumber
   *  toOctal
   *  toPower                   pow
   *  toPrecision
   *  toSignificantDigits       toSD
   *  toString
   *  truncated                 trunc
   *  valueOf
   */


  /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */
  P.absoluteValue = P.abs = function () {
    var x = new this.constructor(this);
    if (x.s < 0) x.s = 1;
    return finalise(x);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */
  P.ceil = function () {
    return finalise(new this.constructor(this), this.e + 1, 2);
  };


  /*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */
  P.comparedTo = P.cmp = function (y) {
    var i, j, xdL, ydL,
      x = this,
      xd = x.d,
      yd = (y = new x.constructor(y)).d,
      xs = x.s,
      ys = y.s;

    // Either NaN or Â±Infinity?
    if (!xd || !yd) {
      return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
    }

    // Either zero?
    if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;

    // Signs differ?
    if (xs !== ys) return xs;

    // Compare exponents.
    if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;

    xdL = xd.length;
    ydL = yd.length;

    // Compare digit by digit.
    for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
      if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
    }

    // Compare lengths.
    return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
  };


  /*
   * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * cos(0)         = 1
   * cos(-0)        = 1
   * cos(Infinity)  = NaN
   * cos(-Infinity) = NaN
   * cos(NaN)       = NaN
   *
   */
  P.cosine = P.cos = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.d) return new Ctor(NaN);

    // cos(0) = cos(-0) = 1
    if (!x.d[0]) return new Ctor(1);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = cosine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
  };


  /*
   *
   * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   *  cbrt(0)  =  0
   *  cbrt(-0) = -0
   *  cbrt(1)  =  1
   *  cbrt(-1) = -1
   *  cbrt(N)  =  N
   *  cbrt(-I) = -I
   *  cbrt(I)  =  I
   *
   * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
   *
   */
  P.cubeRoot = P.cbrt = function () {
    var e, m, n, r, rep, s, sd, t, t3, t3plusx,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    external = false;

    // Initial estimate.
    s = x.s * Math.pow(x.s * x, 1 / 3);

     // Math.cbrt underflow/overflow?
     // Pass x to Math.pow as integer, then adjust the exponent of the result.
    if (!s || Math.abs(s) == 1 / 0) {
      n = digitsToString(x.d);
      e = x.e;

      // Adjust n exponent so it is a multiple of 3 away from x exponent.
      if (s = (e - n.length + 1) % 3) n += (s == 1 || s == -2 ? '0' : '00');
      s = Math.pow(n, 1 / 3);

      // Rarely, e may be one less than the result exponent value.
      e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
      r.s = x.s;
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Halley's method.
    // TODO? Compare Newton's method.
    for (;;) {
      t = r;
      t3 = t.times(t).times(t);
      t3plusx = t3.plus(x);
      r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
        // , i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return the number of decimal places of the value of this Decimal.
   *
   */
  P.decimalPlaces = P.dp = function () {
    var w,
      d = this.d,
      n = NaN;

    if (d) {
      w = d.length - 1;
      n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last word.
      w = d[w];
      if (w) for (; w % 10 == 0; w /= 10) n--;
      if (n < 0) n = 0;
    }

    return n;
  };


  /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedBy = P.div = function (y) {
    return divide(this, new this.constructor(y));
  };


  /*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedToIntegerBy = P.divToInt = function (y) {
    var x = this,
      Ctor = x.constructor;
    return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
  };


  /*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */
  P.equals = P.eq = function (y) {
    return this.cmp(y) === 0;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */
  P.floor = function () {
    return finalise(new this.constructor(this), this.e + 1, 3);
  };


  /*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */
  P.greaterThan = P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */
  P.greaterThanOrEqualTo = P.gte = function (y) {
    var k = this.cmp(y);
    return k == 1 || k === 0;
  };


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [1, Infinity]
   *
   * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
   *
   * cosh(0)         = 1
   * cosh(-0)        = 1
   * cosh(Infinity)  = Infinity
   * cosh(-Infinity) = Infinity
   * cosh(NaN)       = NaN
   *
   *  x        time taken (ms)   result
   * 1000      9                 9.8503555700852349694e+433
   * 10000     25                4.4034091128314607936e+4342
   * 100000    171               1.4033316802130615897e+43429
   * 1000000   3817              1.5166076984010437725e+434294
   * 10000000  abandoned after 2 minute wait
   *
   * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
   *
   */
  P.hyperbolicCosine = P.cosh = function () {
    var k, n, pr, rm, len,
      x = this,
      Ctor = x.constructor,
      one = new Ctor(1);

    if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
    if (x.isZero()) return one;

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
    // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))

    // Estimate the optimum number of times to use the argument reduction.
    // TODO? Estimation reused from cosine() and may not be optimal here.
    if (len < 32) {
      k = Math.ceil(len / 3);
      n = Math.pow(4, -k).toString();
    } else {
      k = 16;
      n = '2.3283064365386962890625e-10';
    }

    x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);

    // Reverse argument reduction
    var cosh2_x,
      i = k,
      d8 = new Ctor(8);
    for (; i--;) {
      cosh2_x = x.times(x);
      x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
    }

    return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
   *
   * sinh(0)         = 0
   * sinh(-0)        = -0
   * sinh(Infinity)  = Infinity
   * sinh(-Infinity) = -Infinity
   * sinh(NaN)       = NaN
   *
   * x        time taken (ms)
   * 10       2 ms
   * 100      5 ms
   * 1000     14 ms
   * 10000    82 ms
   * 100000   886 ms            1.4033316802130615897e+43429
   * 200000   2613 ms
   * 300000   5407 ms
   * 400000   8824 ms
   * 500000   13026 ms          8.7080643612718084129e+217146
   * 1000000  48543 ms
   *
   * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
   *
   */
  P.hyperbolicSine = P.sinh = function () {
    var k, pr, rm, len,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    if (len < 3) {
      x = taylorSeries(Ctor, 2, x, x, true);
    } else {

      // Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
      // i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
      // 3 multiplications and 1 addition

      // Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
      // i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
      // 4 multiplications and 2 additions

      // Estimate the optimum number of times to use the argument reduction.
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;

      x = x.times(Math.pow(5, -k));

      x = taylorSeries(Ctor, 2, x, x, true);

      // Reverse argument reduction
      var sinh2_x,
        d5 = new Ctor(5),
        d16 = new Ctor(16),
        d20 = new Ctor(20);
      for (; k--;) {
        sinh2_x = x.times(x);
        x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
      }
    }

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * tanh(x) = sinh(x) / cosh(x)
   *
   * tanh(0)         = 0
   * tanh(-0)        = -0
   * tanh(Infinity)  = 1
   * tanh(-Infinity) = -1
   * tanh(NaN)       = NaN
   *
   */
  P.hyperbolicTangent = P.tanh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(x.s);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 7;
    Ctor.rounding = 1;

    return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
  };


  /*
   * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
   * this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [0, pi]
   *
   * acos(x) = pi/2 - asin(x)
   *
   * acos(0)       = pi/2
   * acos(-0)      = pi/2
   * acos(1)       = 0
   * acos(-1)      = pi
   * acos(1/2)     = pi/3
   * acos(-1/2)    = 2*pi/3
   * acos(|x| > 1) = NaN
   * acos(NaN)     = NaN
   *
   */
  P.inverseCosine = P.acos = function () {
    var halfPi,
      x = this,
      Ctor = x.constructor,
      k = x.abs().cmp(1),
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (k !== -1) {
      return k === 0
        // |x| is 1
        ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0)
        // |x| > 1 or x is NaN
        : new Ctor(NaN);
    }

    if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);

    // TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.asin();
    halfPi = getPi(Ctor, pr + 4, rm).times(0.5);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return halfPi.minus(x);
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
   * value of this Decimal.
   *
   * Domain: [1, Infinity]
   * Range: [0, Infinity]
   *
   * acosh(x) = ln(x + sqrt(x^2 - 1))
   *
   * acosh(x < 1)     = NaN
   * acosh(NaN)       = NaN
   * acosh(Infinity)  = Infinity
   * acosh(-Infinity) = NaN
   * acosh(0)         = NaN
   * acosh(-0)        = NaN
   * acosh(1)         = 0
   * acosh(-1)        = NaN
   *
   */
  P.inverseHyperbolicCosine = P.acosh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
    if (!x.isFinite()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).minus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * asinh(x) = ln(x + sqrt(x^2 + 1))
   *
   * asinh(NaN)       = NaN
   * asinh(Infinity)  = Infinity
   * asinh(-Infinity) = -Infinity
   * asinh(0)         = 0
   * asinh(-0)        = -0
   *
   */
  P.inverseHyperbolicSine = P.asinh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).plus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
   * value of this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [-Infinity, Infinity]
   *
   * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
   *
   * atanh(|x| > 1)   = NaN
   * atanh(NaN)       = NaN
   * atanh(Infinity)  = NaN
   * atanh(-Infinity) = NaN
   * atanh(0)         = 0
   * atanh(-0)        = -0
   * atanh(1)         = Infinity
   * atanh(-1)        = -Infinity
   *
   */
  P.inverseHyperbolicTangent = P.atanh = function () {
    var pr, rm, wpr, xsd,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    xsd = x.sd();

    if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);

    Ctor.precision = wpr = xsd - x.e;

    x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);

    Ctor.precision = pr + 4;
    Ctor.rounding = 1;

    x = x.ln();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(0.5);
  };


  /*
   * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
   *
   * asin(0)       = 0
   * asin(-0)      = -0
   * asin(1/2)     = pi/6
   * asin(-1/2)    = -pi/6
   * asin(1)       = pi/2
   * asin(-1)      = -pi/2
   * asin(|x| > 1) = NaN
   * asin(NaN)     = NaN
   *
   * TODO? Compare performance of Taylor series.
   *
   */
  P.inverseSine = P.asin = function () {
    var halfPi, k,
      pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.isZero()) return new Ctor(x);

    k = x.abs().cmp(1);
    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (k !== -1) {

      // |x| is 1
      if (k === 0) {
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        halfPi.s = x.s;
        return halfPi;
      }

      // |x| > 1 or x is NaN
      return new Ctor(NaN);
    }

    // TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(2);
  };


  /*
   * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
   *
   * atan(0)         = 0
   * atan(-0)        = -0
   * atan(1)         = pi/4
   * atan(-1)        = -pi/4
   * atan(Infinity)  = pi/2
   * atan(-Infinity) = -pi/2
   * atan(NaN)       = NaN
   *
   */
  P.inverseTangent = P.atan = function () {
    var i, j, k, n, px, t, r, wpr, x2,
      x = this,
      Ctor = x.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (!x.isFinite()) {
      if (!x.s) return new Ctor(NaN);
      if (pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.5);
        r.s = x.s;
        return r;
      }
    } else if (x.isZero()) {
      return new Ctor(x);
    } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.25);
      r.s = x.s;
      return r;
    }

    Ctor.precision = wpr = pr + 10;
    Ctor.rounding = 1;

    // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);

    // Argument reduction
    // Ensure |x| < 0.42
    // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))

    k = Math.min(28, wpr / LOG_BASE + 2 | 0);

    for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));

    external = false;

    j = Math.ceil(wpr / LOG_BASE);
    n = 1;
    x2 = x.times(x);
    r = new Ctor(x);
    px = x;

    // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
    for (; i !== -1;) {
      px = px.times(x2);
      t = r.minus(px.div(n += 2));

      px = px.times(x2);
      r = t.plus(px.div(n += 2));

      if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--;);
    }

    if (k) r = r.times(2 << (k - 1));

    external = true;

    return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */
  P.isFinite = function () {
    return !!this.d;
  };


  /*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */
  P.isInteger = P.isInt = function () {
    return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
  };


  /*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */
  P.isNegative = P.isNeg = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */
  P.isPositive = P.isPos = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */
  P.isZero = function () {
    return !!this.d && this.d[0] === 0;
  };


  /*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */
  P.lessThan = P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */
  P.lessThanOrEqualTo = P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * If no base is specified, return log[10](arg).
   *
   * log[base](arg) = ln(arg) / ln(base)
   *
   * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
   * otherwise:
   *
   * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
   * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
   * between the result and the correctly rounded result will be one ulp (unit in the last place).
   *
   * log[-b](a)       = NaN
   * log[0](a)        = NaN
   * log[1](a)        = NaN
   * log[NaN](a)      = NaN
   * log[Infinity](a) = NaN
   * log[b](0)        = -Infinity
   * log[b](-0)       = -Infinity
   * log[b](-a)       = NaN
   * log[b](1)        = 0
   * log[b](Infinity) = Infinity
   * log[b](NaN)      = NaN
   *
   * [base] {number|string|Decimal} The base of the logarithm.
   *
   */
  P.logarithm = P.log = function (base) {
    var isBase10, d, denominator, k, inf, num, sd, r,
      arg = this,
      Ctor = arg.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding,
      guard = 5;

    // Default base is 10.
    if (base == null) {
      base = new Ctor(10);
      isBase10 = true;
    } else {
      base = new Ctor(base);
      d = base.d;

      // Return NaN if base is negative, or non-finite, or is 0 or 1.
      if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);

      isBase10 = base.eq(10);
    }

    d = arg.d;

    // Is arg negative, non-finite, 0 or 1?
    if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
      return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
    }

    // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
    // integer power of 10.
    if (isBase10) {
      if (d.length > 1) {
        inf = true;
      } else {
        for (k = d[0]; k % 10 === 0;) k /= 10;
        inf = k !== 1;
      }
    }

    external = false;
    sd = pr + guard;
    num = naturalLogarithm(arg, sd);
    denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);

    // The result will have 5 rounding digits.
    r = divide(num, denominator, sd, 1);

    // If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
    // calculate 10 further digits.
    //
    // If the result is known to have an infinite decimal expansion, repeat this until it is clear
    // that the result is above or below the boundary. Otherwise, if after calculating the 10
    // further digits, the last 14 are nines, round up and assume the result is exact.
    // Also assume the result is exact if the last 14 are zero.
    //
    // Example of a result that will be incorrectly rounded:
    // log[1048576](4503599627370502) = 2.60000000000000009610279511444746...
    // The above result correctly rounded using ROUND_CEIL to 1 decimal place should be 2.7, but it
    // will be given as 2.6 as there are 15 zeros immediately after the requested decimal place, so
    // the exact result would be assumed to be 2.6, which rounded using ROUND_CEIL to 1 decimal
    // place is still 2.6.
    if (checkRoundingDigits(r.d, k = pr, rm)) {

      do {
        sd += 10;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        r = divide(num, denominator, sd, 1);

        if (!inf) {

          // Check for 14 nines from the 2nd rounding digit, as the first may be 4.
          if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }

          break;
        }
      } while (checkRoundingDigits(r.d, k += 10, rm));
    }

    external = true;

    return finalise(r, pr, rm);
  };


  /*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */


  /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */


  /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.minus = P.sub = function (y) {
    var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return y negated if x is finite and y is Â±Infinity.
      else if (x.d) y.s = -y.s;

      // Return x if y is finite and x is Â±Infinity.
      // Return x if both are Â±Infinity with different signs.
      // Return NaN if both are Â±Infinity with the same sign.
      else y = new Ctor(y.d || x.s !== y.s ? x : NaN);

      return y;
    }

    // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.plus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return y negated if x is zero and y is non-zero.
      if (yd[0]) y.s = -y.s;

      // Return x if y is zero and x is non-zero.
      else if (xd[0]) y = new Ctor(x);

      // Return zero if both are zero.
      // From IEEE 754 (2008) 6.3: 0 - 0 = -0 - -0 = -0 when rounding to -Infinity.
      else return new Ctor(rm === 3 ? -0 : 0);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    e = mathfloor(y.e / LOG_BASE);
    xe = mathfloor(x.e / LOG_BASE);

    xd = xd.slice();
    k = xe - e;

    // If base 1e7 exponents differ...
    if (k) {
      xLTy = k < 0;

      if (xLTy) {
        d = xd;
        k = -k;
        len = yd.length;
      } else {
        d = yd;
        e = xe;
        len = xd.length;
      }

      // Numbers with massively different exponents would result in a very high number of
      // zeros needing to be prepended, but this can be avoided while still ensuring correct
      // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
      i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

      if (k > i) {
        k = i;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents.
      d.reverse();
      for (i = k; i--;) d.push(0);
      d.reverse();

    // Base 1e7 exponents equal.
    } else {

      // Check digits to determine which is the bigger number.

      i = xd.length;
      len = yd.length;
      xLTy = i < len;
      if (xLTy) len = i;

      for (i = 0; i < len; i++) {
        if (xd[i] != yd[i]) {
          xLTy = xd[i] < yd[i];
          break;
        }
      }

      k = 0;
    }

    if (xLTy) {
      d = xd;
      xd = yd;
      yd = d;
      y.s = -y.s;
    }

    len = xd.length;

    // Append zeros to `xd` if shorter.
    // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
    for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

    // Subtract yd from xd.
    for (i = yd.length; i > k;) {

      if (xd[--i] < yd[i]) {
        for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
        --xd[j];
        xd[i] += BASE;
      }

      xd[i] -= yd[i];
    }

    // Remove trailing zeros.
    for (; xd[--len] === 0;) xd.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xd[0] === 0; xd.shift()) --e;

    // Zero?
    if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * The result depends on the modulo mode.
   *
   */
  P.modulo = P.mod = function (y) {
    var q,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // Return NaN if x is Â±Infinity or NaN, or y is NaN or Â±0.
    if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);

    // Return x if y is Â±Infinity or x is Â±0.
    if (!y.d || x.d && !x.d[0]) {
      return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
    }

    // Prevent rounding of intermediate calculations.
    external = false;

    if (Ctor.modulo == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // result = x - q * y    where  0 <= result < abs(y)
      q = divide(x, y.abs(), 0, 3, 1);
      q.s *= y.s;
    } else {
      q = divide(x, y, 0, Ctor.modulo, 1);
    }

    q = q.times(y);

    external = true;

    return x.minus(q);
  };


  /*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.naturalExponential = P.exp = function () {
    return naturalExponential(this);
  };


  /*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.naturalLogarithm = P.ln = function () {
    return naturalLogarithm(this);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */
  P.negated = P.neg = function () {
    var x = new this.constructor(this);
    x.s = -x.s;
    return finalise(x);
  };


  /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.plus = P.add = function (y) {
    var carry, d, e, i, k, len, pr, rm, xd, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return x if y is finite and x is Â±Infinity.
      // Return x if both are Â±Infinity with the same sign.
      // Return NaN if both are Â±Infinity with different signs.
      // Return y if x is finite and y is Â±Infinity.
      else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);

      return y;
    }

     // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return x if y is zero.
      // Return y if y is non-zero.
      if (!yd[0]) y = new Ctor(x);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    k = mathfloor(x.e / LOG_BASE);
    e = mathfloor(y.e / LOG_BASE);

    xd = xd.slice();
    i = k - e;

    // If base 1e7 exponents differ...
    if (i) {

      if (i < 0) {
        d = xd;
        i = -i;
        len = yd.length;
      } else {
        d = yd;
        e = k;
        len = xd.length;
      }

      // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
      k = Math.ceil(pr / LOG_BASE);
      len = k > len ? k + 1 : len + 1;

      if (i > len) {
        i = len;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
      d.reverse();
      for (; i--;) d.push(0);
      d.reverse();
    }

    len = xd.length;
    i = yd.length;

    // If yd is longer than xd, swap xd and yd so xd points to the longer array.
    if (len - i < 0) {
      i = len;
      d = yd;
      yd = xd;
      xd = d;
    }

    // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
    for (carry = 0; i;) {
      carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
      xd[i] %= BASE;
    }

    if (carry) {
      xd.unshift(carry);
      ++e;
    }

    // Remove trailing zeros.
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    for (len = xd.length; xd[--len] == 0;) xd.pop();

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */
  P.precision = P.sd = function (z) {
    var k,
      x = this;

    if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

    if (x.d) {
      k = getPrecision(x.d);
      if (z && x.e + 1 > k) k = x.e + 1;
    } else {
      k = NaN;
    }

    return k;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */
  P.round = function () {
    var x = this,
      Ctor = x.constructor;

    return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
  };


  /*
   * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * sin(x) = x - x^3/3! + x^5/5! - ...
   *
   * sin(0)         = 0
   * sin(-0)        = -0
   * sin(Infinity)  = NaN
   * sin(-Infinity) = NaN
   * sin(NaN)       = NaN
   *
   */
  P.sine = P.sin = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = sine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   *  sqrt(-n) =  N
   *  sqrt(N)  =  N
   *  sqrt(-I) =  N
   *  sqrt(I)  =  I
   *  sqrt(0)  =  0
   *  sqrt(-0) = -0
   *
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, sd, r, rep, t,
      x = this,
      d = x.d,
      e = x.e,
      s = x.s,
      Ctor = x.constructor;

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !d || !d[0]) {
      return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
    }

    external = false;

    // Initial estimate.
    s = Math.sqrt(+x);

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = digitsToString(d);

      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(n);
      e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '1e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Newton-Raphson iteration.
    for (;;) {
      t = r;
      r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
        // 4999, i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * tan(0)         = 0
   * tan(-0)        = -0
   * tan(Infinity)  = NaN
   * tan(-Infinity) = NaN
   * tan(NaN)       = NaN
   *
   */
  P.tangent = P.tan = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 10;
    Ctor.rounding = 1;

    x = x.sin();
    x.s = 1;
    x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
  };


  /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   */
  P.times = P.mul = function (y) {
    var carry, e, i, k, r, rL, t, xdL, ydL,
      x = this,
      Ctor = x.constructor,
      xd = x.d,
      yd = (y = new Ctor(y)).d;

    y.s *= x.s;

     // If either is NaN, Â±Infinity or Â±0...
    if (!xd || !xd[0] || !yd || !yd[0]) {

      return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd

        // Return NaN if either is NaN.
        // Return NaN if x is Â±0 and y is Â±Infinity, or y is Â±0 and x is Â±Infinity.
        ? NaN

        // Return Â±Infinity if either is Â±Infinity.
        // Return Â±0 if either is Â±0.
        : !xd || !yd ? y.s / 0 : y.s * 0);
    }

    e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
    xdL = xd.length;
    ydL = yd.length;

    // Ensure xd points to the longer array.
    if (xdL < ydL) {
      r = xd;
      xd = yd;
      yd = r;
      rL = xdL;
      xdL = ydL;
      ydL = rL;
    }

    // Initialise the result array with zeros.
    r = [];
    rL = xdL + ydL;
    for (i = rL; i--;) r.push(0);

    // Multiply!
    for (i = ydL; --i >= 0;) {
      carry = 0;
      for (k = xdL + i; k > i;) {
        t = r[k] + yd[i] * xd[k - i - 1] + carry;
        r[k--] = t % BASE | 0;
        carry = t / BASE | 0;
      }

      r[k] = (r[k] + carry) % BASE | 0;
    }

    // Remove trailing zeros.
    for (; !r[--rL];) r.pop();

    if (carry) ++e;
    else r.shift();

    // Remove trailing zeros.
    for (i = r.length; !r[--i];) r.pop();

    y.d = r;
    y.e = getBase10Exponent(r, e);

    return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
  };


  /*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toBinary = function (sd, rm) {
    return toStringBinary(this, 2, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toDecimalPlaces = P.toDP = function (dp, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);
    if (dp === void 0) return x;

    checkInt32(dp, 0, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);

    return finalise(x, dp + x.e + 1, rm);
  };


  /*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toExponential = function (dp, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x, true);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), dp + 1, rm);
      str = finiteToString(x, true, dp + 1);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
   * omitted.
   *
   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   * (-0).toFixed(3) is '0.000'.
   * (-0.5).toFixed(0) is '-0'.
   *
   */
  P.toFixed = function (dp, rm) {
    var str, y,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      y = finalise(new Ctor(x), dp + x.e + 1, rm);
      str = finiteToString(y, false, dp + y.e + 1);
    }

    // To determine whether to add the minus sign look at the value before it was rounded,
    // i.e. look at `x` rather than `y`.
    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */
  P.toFraction = function (maxD) {
    var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r,
      x = this,
      xd = x.d,
      Ctor = x.constructor;

    if (!xd) return new Ctor(x);

    n1 = d0 = new Ctor(1);
    d1 = n0 = new Ctor(0);

    d = new Ctor(d1);
    e = d.e = getPrecision(xd) - x.e - 1;
    k = e % LOG_BASE;
    d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);

    if (maxD == null) {

      // d is 10**e, the minimum max-denominator needed.
      maxD = e > 0 ? d : n1;
    } else {
      n = new Ctor(maxD);
      if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
      maxD = n.gt(d) ? (e > 0 ? d : n1) : n;
    }

    external = false;
    n = new Ctor(digitsToString(xd));
    pr = Ctor.precision;
    Ctor.precision = e = xd.length * LOG_BASE * 2;

    for (;;)  {
      q = divide(n, d, 0, 1, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.cmp(maxD) == 1) break;
      d0 = d1;
      d1 = d2;
      d2 = n1;
      n1 = n0.plus(q.times(d2));
      n0 = d2;
      d2 = d;
      d = n.minus(q.times(d2));
      n = d2;
    }

    d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;

    // Determine which fraction is closer to x, n0/d0 or n1/d1?
    r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1
        ? [n1, d1] : [n0, d0];

    Ctor.precision = pr;
    external = true;

    return r;
  };


  /*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toHexadecimal = P.toHex = function (sd, rm) {
    return toStringBinary(this, 16, sd, rm);
  };


  /*
   * Return a string representing the exact value of this Decimal in a compact base-88 based format.
   *
   * The number of characters of the string will always be equal to or less than the number of
   * characters returned by `toString` or `toExponential` - usually just over half as many.
   *
   * The original Decimal value can be recreated by passing the string to `Decimal.fromJSON`.
   *
   * Base 88 alphabet:
   * 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./:;=?@[]^_`{|}~
   *
   * The following 7 printable ASCII characters are not used
   * (space) \ " & ' < >
   * so the return value is safe for strings, HTML, JSON, and XML.
   *
   *     0   0     g  16    w  32    M  48    $  64    ]  80
   *     1   1     h  17    x  33    N  49    %  65    ^  81
   *     2   2     i  18    y  34    O  50    (  66    _  82
   *     3   3     j  19    z  35    P  51    )  67    `  83
   *     4   4     k  20    A  36    Q  52    *  68    {  84
   *     5   5     l  21    B  37    R  53    +  69    |  85
   *     6   6     m  22    C  38    S  54    ,  70    }  86
   *     7   7     n  23    D  39    T  55    -  71    ~  87
   *     8   8     o  24    E  40    U  56    .  72
   *     9   9     p  25    F  41    V  57    /  73
   *     a  10     q  26    G  42    W  58    :  74
   *     b  11     r  27    H  43    X  59    ;  75
   *     c  12     s  28    I  44    Y  60    =  76
   *     d  13     t  29    J  45    Z  61    ?  77
   *     e  14     u  30    K  46    !  62    @  78
   *     f  15     v  31    L  47    #  63    [  79
   *
   * If the return value is just one character, it represents:
   * 0-81  [[0, 40][-0, -40]]
   * 82    -Infinity
   * 83    +Infinity
   * 84    NaN
   * 85-87 free
   *
   *   64 32 16  8  4  2  1
   *    1  0  1  0  1  1  1 = 87
   *
   */
   P.toJSON = function () {
    var arr, e, i, k, len, n, r, str,
      x = this,
      isNeg = x.s < 0;

    // -Infinity/Infinity/NaN.
    if (!x.d) return NUMERALS.charAt(x.s ? isNeg ? 82 : 83 : 84);
    e = x.e;

    // Small integer.
    if (x.d.length === 1 && e < 4 && e >= 0) {
      n = x.d[0];

      if (n < 2857) {

        // One character.
        // [[0, 40][-0, -40]]
        if (n < 41) return NUMERALS.charAt(isNeg ? n + 41 : n);

        // Two characters. High bit of first character unset.
        // 0XXXXXX
        // 63*88 + 87 = 5631 = 5632 values, 5632/2 = 2816
        // [[0, 2815][2816, 5631]]  (2816 * 2 = 5632 values)
        // [[0, 2815][-0, -2815]]
        // [[41, 2856][-41, -2856]]
        n -= 41;
        if (isNeg) n += 2816;
        k = n / 88 | 0;

        return NUMERALS.charAt(k) + NUMERALS.charAt(n - k * 88);
      }
    }

    str = digitsToString(x.d);
    r = '';

    // Values with a small exponent. Set high bit.
    // Positive value: 100XXXX
    // 1 0 0 {exponent [0, 15] -> [-7, 8]}
    if (!isNeg && e <= 8 && e >= -7) {
      k = 64 + e + 7;

    // Negative value: 1010XXX
    // 1 0 1 0 {exponent [0, 7] -> [-3, 4]}
    } else if (isNeg && e <= 4 && e >= -3) {
      k = 64 + 16 + e + 3;

    // Integer without trailing zeros: 0X00000
    // 0 {is negative} 0 0 0 0 0
    } else if (str.length === e + 1) {
      k = 32 * isNeg;

    // All remaining values: 0XXXXXX
    // Result will have at least 3 characters.
    // 0 {is negative} {is exponent negative} {exponent character count [1, 15]}
    } else {
      k = 32 * isNeg + 16 * (e < 0);
      e = Math.abs(e);

      // One character to represent the exponent.
      if (e < 88)  {
        k += 1;
        r = NUMERALS.charAt(e);

      // Two characters to represent the exponent.
      // 87*88 + 87 = 7743
      } else if (e < 7744) {
        k += 2;
        n = e / 88 | 0;
        r = NUMERALS.charAt(n) + NUMERALS.charAt(e - n * 88);

      // More than two characters to represent the exponent.
      } else {
        arr = convertBase(String(e), 10, 88);
        len = arr.length;
        k += len;
        for (i = 0; i < len; i++) r += NUMERALS.charAt(arr[i]);
      }
    }

    // At this point r contains the characters in base 88 representing the exponent value.
    // Prepend the first character, which describes the sign, the exponent sign, and the number of
    // characters that follow which represent the exponent value.
    r = NUMERALS.charAt(k) + r;
    arr = convertBase(str, 10, 88);
    len = arr.length;

    // Add the base 88 characters that represent the significand.
    for (i = 0; i < len; i++) r += NUMERALS.charAt(arr[i]);

    return r;
  };


  /*
   * Returns a new Decimal whose value is the nearest multiple of the magnitude of `y` to the value
   * of this Decimal.
   *
   * If the value of this Decimal is equidistant from two multiples of `y`, the rounding mode `rm`,
   * or `Decimal.rounding` if `rm` is omitted, determines the direction of the nearest multiple.
   *
   * In the context of this method, rounding mode 4 (ROUND_HALF_UP) is the same as rounding mode 0
   * (ROUND_UP), and so on.
   *
   * The return value will always have the same sign as this Decimal, unless either this Decimal
   * or `y` is NaN, in which case the return value will be also be NaN.
   *
   * The return value is not affected by the value of `precision`.
   *
   * y {number|string|Decimal} The magnitude to round to a multiple of.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toNearest() rounding mode not an integer: {rm}'
   * 'toNearest() rounding mode out of range: {rm}'
   *
   */
  P.toNearest = function (y, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);

    if (y == null) {

      // If x is not finite, return x.
      if (!x.d) return x;

      y = new Ctor(1);
      rm = Ctor.rounding;
    } else {
      y = new Ctor(y);
      if (rm !== void 0) checkInt32(rm, 0, 8);

      // If x is not finite, return x if y is not NaN, else NaN.
      if (!x.d) return y.s ? x : y;

      // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
      if (!y.d) {
        if (y.s) y.s = x.s;
        return y;
      }
    }

    // If y is not zero, calculate the nearest multiple of y to x.
    if (y.d[0]) {
      external = false;
      if (rm < 4) rm = [4, 5, 7, 8][rm];
      x = divide(x, y, 0, rm, 1).times(y);
      external = true;
      finalise(x);

    // If y is zero, return zero with the sign of x.
    } else {
      y.s = x.s;
      x = y;
    }

    return x;
  };


  /*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */
  P.toNumber = function () {
    return +this;
  };


  /*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toOctal = function (sd, rm) {
    return toStringBinary(this, 8, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
   * to `precision` significant digits using rounding mode `rounding`.
   *
   * ECMAScript compliant.
   *
   *   pow(x, NaN)                           = NaN
   *   pow(x, Â±0)                            = 1

   *   pow(NaN, non-zero)                    = NaN
   *   pow(abs(x) > 1, +Infinity)            = +Infinity
   *   pow(abs(x) > 1, -Infinity)            = +0
   *   pow(abs(x) == 1, Â±Infinity)           = NaN
   *   pow(abs(x) < 1, +Infinity)            = +0
   *   pow(abs(x) < 1, -Infinity)            = +Infinity
   *   pow(+Infinity, y > 0)                 = +Infinity
   *   pow(+Infinity, y < 0)                 = +0
   *   pow(-Infinity, odd integer > 0)       = -Infinity
   *   pow(-Infinity, even integer > 0)      = +Infinity
   *   pow(-Infinity, odd integer < 0)       = -0
   *   pow(-Infinity, even integer < 0)      = +0
   *   pow(+0, y > 0)                        = +0
   *   pow(+0, y < 0)                        = +Infinity
   *   pow(-0, odd integer > 0)              = -0
   *   pow(-0, even integer > 0)             = +0
   *   pow(-0, odd integer < 0)              = -Infinity
   *   pow(-0, even integer < 0)             = +Infinity
   *   pow(finite x < 0, finite non-integer) = NaN
   *
   * For non-integer or very large exponents pow(x, y) is calculated using
   *
   *   x^y = exp(y*ln(x))
   *
   * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
   * probability of an incorrectly rounded result
   * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
   * i.e. 1 in 250,000,000,000,000
   *
   * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
   *
   * y {number|string|Decimal} The power to which to raise this Decimal.
   *
   */
  P.toPower = P.pow = function (y) {
    var e, k, pr, r, rm, sign, yIsInt,
      x = this,
      Ctor = x.constructor,
      yn = +(y = new Ctor(y));

    // Either Â±Infinity, NaN or Â±0?
    if (!x.d || !y.d || !x.d[0] || !y.d[0]) return  new Ctor(mathpow(+x, yn));

    x = new Ctor(x);

    if (x.eq(1)) return x;

    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (y.eq(1)) return finalise(x, pr, rm);

    e = mathfloor(y.e / LOG_BASE);
    k = y.d.length - 1;
    yIsInt = e >= k;
    sign = x.s;

    if (!yIsInt) {
      if (sign < 0) return new Ctor(NaN);

    // If y is a small integer use the 'exponentiation by squaring' algorithm.
    } else if ((k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
      r = intPow(Ctor, x, k, pr);
      return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
    }

    // Result is negative if x is negative and the last digit of integer y is odd.
    sign = sign < 0 && y.d[Math.max(e, k)] & 1 ? -1 : 1;

    // Estimate result exponent.
    // x^y = 10^e,  where e = y * log10(x)
    // log10(x) = log10(x_significand) + x_exponent
    // log10(x_significand) = ln(x_significand) / ln(10)
    k = mathpow(+x, yn);
    e = k == 0 || !isFinite(k)
      ? mathfloor(yn * (Math.log('0.' + digitsToString(x.d)) / Math.LN10 + x.e + 1))
      : new Ctor(k + '').e;

    // Estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.

    // Overflow/underflow?
    if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? sign / 0 : 0);

    external = false;
    Ctor.rounding = x.s = 1;

    // Estimate the extra guard digits needed to ensure five correct rounding digits from
    // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
    // new Decimal(2.32456).pow('2087987436534566.46411')
    // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
    k = Math.min(12, (e + '').length);

    // r = x^y = exp(y*ln(x))
    r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);

    // Truncate to the required precision plus five rounding digits.
    r = finalise(r, pr + 5, 1);

    // If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
    // the result.
    if (checkRoundingDigits(r.d, pr, rm)) {
      e = pr + 10;

      // Truncate to the increased precision plus five rounding digits.
      r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);

      // Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
      if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
        r = finalise(r, pr + 1, 0);
      }
    }

    r.s = sign;
    external = true;
    Ctor.rounding = rm;

    return finalise(r, pr, rm);
  };


  /*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toPrecision = function (sd, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), sd, rm);
      str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
   * omitted.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toSD() digits out of range: {sd}'
   * 'toSD() digits not an integer: {sd}'
   * 'toSD() rounding mode not an integer: {rm}'
   * 'toSD() rounding mode out of range: {rm}'
   *
   */
  P.toSignificantDigits = P.toSD = function (sd, rm) {
    var x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    }

    return finalise(new Ctor(x), sd, rm);
  };


  /*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */
  P.toString = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */
  P.truncated = P.trunc = function () {
    return finalise(new this.constructor(this), this.e + 1, 1);
  };


  /*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */
  P.valueOf = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() ? '-' + str : str;
  };


  /*
  // Add aliases to match BigDecimal method names.
  // P.add = P.plus;
  P.subtract = P.minus;
  P.multiply = P.times;
  P.divide = P.div;
  P.remainder = P.mod;
  P.compareTo = P.cmp;
  P.negate = P.neg;
   */


  // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


  /*
   *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toJSON,
   *                           P.toPower, finiteToString, naturalExponential, naturalLogarithm
   *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
   *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
   *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
   *  convertBase              P.toJSON, toStringBinary, fromJSON, parseOther
   *  cos                      P.cos
   *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
   *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
   *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
   *                           taylorSeries, atan2, parseOther
   *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
   *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
   *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
   *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
   *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
   *                           P.truncated, divide, getLn10, getPi, naturalExponential,
   *                           naturalLogarithm, ceil, floor, round, trunc
   *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
   *                           toStringBinary
   *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
   *  getLn10                  P.logarithm, naturalLogarithm
   *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
   *  getPrecision             P.precision, P.toFraction
   *  getZeroString            digitsToString, finiteToString
   *  intPow                   P.toPower, parseOther
   *  isOdd                    toLessThanHalfPi
   *  maxOrMin                 max, min
   *  naturalExponential       P.naturalExponential, P.toPower
   *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
   *                           P.toPower, naturalExponential
   *  nonFiniteToString        finiteToString, toStringBinary
   *  parseDecimal             Decimal
   *  parseOther               Decimal
   *  sin                      P.sin
   *  taylorSeries             P.cosh, P.sinh, cos, sin
   *  toLessThanHalfPi         P.cos, P.sin
   *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
   *  truncate                 intPow
   *
   *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
   *                           naturalLogarithm, config, fromJSON, parseOther, random, Decimal           *
   */


  function digitsToString(d) {
    var i, k, ws,
      indexOfLastWord = d.length - 1,
      str = '',
      w = d[0];

    if (indexOfLastWord > 0) {
      str += w;
      for (i = 1; i < indexOfLastWord; i++) {
        ws = d[i] + '';
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
        str += ws;
      }

      w = d[i];
      ws = w + '';
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
    } else if (w === 0) {
      return '0';
    }

    // Remove trailing zeros of last w.
    for (; w % 10 === 0;) w /= 10;

    return str + w;
  }


  function checkInt32(i, min, max) {
    if (i !== ~~i || i < min || i > max) {
      throw Error(invalidArgument + i);
    }
  }


  /*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */
  function checkRoundingDigits(d, i, rm, repeating) {
    var di, k, r, rd;

    // Get the length of the first word of the array d.
    for (k = d[0]; k >= 10; k /= 10) --i;

    // Is the rounding digit in the first word of d?
    if (--i < 0) {
      i += LOG_BASE;
      di = 0;
    } else {
      di = Math.ceil((i + 1) / LOG_BASE);
      i %= LOG_BASE;
    }

    // i is the index (0 - 6) of the rounding digit.
    // E.g. if within the word 3487563 the first rounding digit is 5,
    // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
    k = mathpow(10, LOG_BASE - i);
    rd = d[di] % k | 0;

    if (repeating == null) {
      if (i < 3) {
        if (i == 0) rd = rd / 100 | 0;
        else if (i == 1) rd = rd / 10 | 0;
        r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 50000 || rd == 0;
      } else {
        r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) &&
          (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 ||
            (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
      }
    } else {
      if (i < 4) {
        if (i == 0) rd = rd / 1000 | 0;
        else if (i == 1) rd = rd / 100 | 0;
        else if (i == 2) rd = rd / 10 | 0;
        r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
      } else {
        r = ((repeating || rm < 4) && rd + 1 == k ||
        (!repeating && rm > 3) && rd + 1 == k / 2) &&
          (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
      }
    }

    return r;
  }


  // Convert string of `baseIn` to an array of numbers of `baseOut`.
  // Eg. convertBase('255', 10, 16) returns [15, 15].
  // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
  function convertBase(str, baseIn, baseOut) {
    var j,
      arr = [0],
      arrL,
      i = 0,
      strL = str.length;

    for (; i < strL;) {
      for (arrL = arr.length; arrL--;) arr[arrL] *= baseIn;
      arr[0] += NUMERALS.indexOf(str.charAt(i++));
      for (j = 0; j < arr.length; j++) {
        if (arr[j] > baseOut - 1) {
          if (arr[j + 1] === void 0) arr[j + 1] = 0;
          arr[j + 1] += arr[j] / baseOut | 0;
          arr[j] %= baseOut;
        }
      }
    }

    return arr.reverse();
  }


  /*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */
  function cosine(Ctor, x) {
    var k, y,
      len = x.d.length;

    // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
    // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1

    // Estimate the optimum number of times to use the argument reduction.
    if (len < 32) {
      k = Math.ceil(len / 3);
      y = Math.pow(4, -k).toString();
    } else {
      k = 16;
      y = '2.3283064365386962890625e-10';
    }

    Ctor.precision += k;

    x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));

    // Reverse argument reduction
    for (var i = k; i--;) {
      var cos2x = x.times(x);
      x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
    }

    Ctor.precision -= k;

    return x;
  }


  /*
   * Perform division in the specified base.
   */
  var divide = (function () {

    // Assumes non-zero x and k, and hence non-zero result.
    function multiplyInteger(x, k, base) {
      var temp,
        carry = 0,
        i = x.length;

      for (x = x.slice(); i--;) {
        temp = x[i] * k + carry;
        x[i] = temp % base | 0;
        carry = temp / base | 0;
      }

      if (carry) x.unshift(carry);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, r;

      if (aL != bL) {
        r = aL > bL ? 1 : -1;
      } else {
        for (i = r = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            r = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return r;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1;) a.shift();
    }

    return function (x, y, pr, rm, dp, base) {
      var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0,
        yL, yz,
        Ctor = x.constructor,
        sign = x.s == y.s ? 1 : -1,
        xd = x.d,
        yd = y.d;

      // Either NaN, Infinity or 0?
      if (!xd || !xd[0] || !yd || !yd[0]) {

        return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN :

          // Return Â±0 if x is 0 or y is Â±Infinity, or return Â±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
      }

      if (base) {
        logBase = 1;
        e = x.e - y.e;
      } else {
        base = BASE;
        logBase = LOG_BASE;
        e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
      }

      yL = yd.length;
      xL = xd.length;
      q = new Ctor(sign);
      qd = q.d = [];

      // Result exponent may be one less than e.
      // The digit array of a Decimal from toStringBinary may have trailing zeros.
      for (i = 0; yd[i] == (xd[i] || 0); i++);

      if (yd[i] > (xd[i] || 0)) e--;

      if (pr == null) {
        sd = pr = Ctor.precision;
        rm = Ctor.rounding;
      } else if (dp) {
        sd = pr + (x.e - y.e) + 1;
      } else {
        sd = pr;
      }

      if (sd < 0) {
        qd.push(1);
        more = true;
      } else {

        // Convert precision in number of base 10 digits to base 1e7 digits.
        sd = sd / logBase + 2 | 0;
        i = 0;

        // divisor < 1e7
        if (yL == 1) {
          k = 0;
          yd = yd[0];
          sd++;

          // k is the carry.
          for (; (i < xL || k) && sd--; i++) {
            t = k * base + (xd[i] || 0);
            qd[i] = t / yd | 0;
            k = t % yd | 0;
          }

          more = k || i < xL;

        // divisor >= 1e7
        } else {

          // Normalise xd and yd so highest order digit of yd is >= base/2
          k = base / (yd[0] + 1) | 0;

          if (k > 1) {
            yd = multiplyInteger(yd, k, base);
            xd = multiplyInteger(xd, k, base);
            yL = yd.length;
            xL = xd.length;
          }

          xi = yL;
          rem = xd.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL;) rem[remL++] = 0;

          yz = yd.slice();
          yz.unshift(0);
          yd0 = yd[0];

          if (yd[1] >= base / 2) ++yd0;

          do {
            k = 0;

            // Compare divisor and remainder.
            cmp = compare(yd, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, k.
              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // k will be how many times the divisor goes into the current remainder.
              k = rem0 / yd0 | 0;

              //  Algorithm:
              //  1. product = divisor * trial digit (k)
              //  2. if product > remainder: product -= divisor, k--
              //  3. remainder -= product
              //  4. if product was < remainder at 2:
              //    5. compare new remainder and divisor
              //    6. If remainder > divisor: remainder -= divisor, k++

              if (k > 1) {
                if (k >= base) k = base - 1;

                // product = divisor * trial digit.
                prod = multiplyInteger(yd, k, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                cmp = compare(prod, rem, prodL, remL);

                // product > remainder.
                if (cmp == 1) {
                  k--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yd, prodL, base);
                }
              } else {

                // cmp is -1.
                // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                if (k == 0) cmp = k = 1;
                prod = yd.slice();
              }

              prodL = prod.length;
              if (prodL < remL) prod.unshift(0);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);

              // If product was < previous remainder.
              if (cmp == -1) {
                remL = rem.length;

                // Compare divisor and new remainder.
                cmp = compare(yd, rem, yL, remL);

                // If divisor < new remainder, subtract divisor from remainder.
                if (cmp < 1) {
                  k++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yd, remL, base);
                }
              }

              remL = rem.length;
            } else if (cmp === 0) {
              k++;
              rem = [0];
            }    // if cmp === 1, k will be 0

            // Add the next digit, k, to the result array.
            qd[i++] = k;

            // Update the remainder.
            if (cmp && rem[0]) {
              rem[remL++] = xd[xi] || 0;
            } else {
              rem = [xd[xi]];
              remL = 1;
            }

          } while ((xi++ < xL || rem[0] !== void 0) && sd--);

          more = rem[0] !== void 0;
        }

        // Leading zero?
        if (!qd[0]) qd.shift();
      }

      // logBase is 1 when divide is being used for base conversion.
      if (logBase == 1) {
        q.e = e;
        inexact = more;
      } else {

        // To calculate q.e, first get the number of digits of qd[0].
        for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
        q.e = i + e * logBase - 1;

        finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
      }

      return q;
    };
  })();


  /*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */
   function finalise(x, sd, rm, isTruncated) {
    var digits, i, j, k, rd, roundUp, w, xd, xdi,
      Ctor = x.constructor;

    // Don't round if sd is null or undefined.
    out: if (sd != null) {
      xd = x.d;

      // Infinity/NaN.
      if (!xd) return x;

      // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
      // w: the word of xd containing rd, a base 1e7 number.
      // xdi: the index of w within xd.
      // digits: the number of digits of w.
      // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
      // they had leading zeros)
      // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

      // Get the length of the first word of the digits array xd.
      for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
      i = sd - digits;

      // Is the rounding digit in the first word of xd?
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];

        // Get the rounding digit at index j of w.
        rd = w / mathpow(10, digits - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {

            // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
            for (; k++ <= xdi;) xd.push(0);
            w = rd = 0;
            digits = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];

          // Get the number of digits of w.
          for (digits = 1; k >= 10; k /= 10) digits++;

          // Get the index of rd within w.
          i %= LOG_BASE;

          // Get the index of rd within w, adjusted for leading zeros.
          // The number of leading zeros of w is given by LOG_BASE - digits.
          j = i - LOG_BASE + digits;

          // Get the rounding digit at index j of w.
          rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
        }
      }

      // Are there any non-zero digits after the rounding digit?
      isTruncated = isTruncated || sd < 0 ||
        xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));

      // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
      // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
      // will give 714.

      roundUp = rm < 4
        ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
        : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
            rm == (x.s < 0 ? 8 : 7));

      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {

          // Convert sd to decimal places.
          sd -= x.e + 1;

          // 1, 0.1, 0.01, 0.001, 0.0001 etc.
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {

          // Zero.
          xd[0] = x.e = 0;
        }

        return x;
      }

      // Remove excess digits.
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);

        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
        // j > 0 means i > number of leading zeros of w.
        xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
      }

      if (roundUp) {
        for (;;) {

          // Is the digit to be rounded up in the first word of xd?
          if (xdi == 0) {

            // i will be the length of xd[0] before k is added.
            for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10) k++;

            // if i != k the length has increased.
            if (i != k) {
              x.e++;
              if (xd[0] == BASE) xd[0] = 1;
            }

            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE) break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }

      // Remove trailing zeros.
      for (i = xd.length; xd[--i] === 0;) xd.pop();
    }

    if (external) {

      // Overflow?
      if (x.e > Ctor.maxE) {

        // Infinity.
        x.d = null;
        x.e = NaN;

      // Underflow?
      } else if (x.e < Ctor.minE) {

        // Zero.
        x.e = 0;
        x.d = [0];
        // Ctor.underflow = true;
      } // else Ctor.underflow = false;
    }

    return x;
  }


  function finiteToString(x, isExp, sd) {
    if (!x.isFinite()) return nonFiniteToString(x);
    var k,
      e = x.e,
      str = digitsToString(x.d),
      len = str.length;

    if (isExp) {
      if (sd && (k = sd - len) > 0) {
        str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
      } else if (len > 1) {
        str = str.charAt(0) + '.' + str.slice(1);
      }

      str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
    } else if (e < 0) {
      str = '0.' + getZeroString(-e - 1) + str;
      if (sd && (k = sd - len) > 0) str += getZeroString(k);
    } else if (e >= len) {
      str += getZeroString(e + 1 - len);
      if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
    } else {
      if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
      if (sd && (k = sd - len) > 0) {
        if (e + 1 === len) str += '.';
        str += getZeroString(k);
      }
    }

    return str;
  }


  // Calculate the base 10 exponent from the base 1e7 exponent.
  function getBase10Exponent(digits, e) {

    // First get the number of digits of the first word of the digits array.
    for (var i = 1, w = digits[0]; w >= 10; w /= 10) i++;
    return i + e * LOG_BASE - 1;
  }


   function getLn10(Ctor, sd, pr) {
    if (sd > LN10_PRECISION) {

      // Reset global state in case the exception is caught.
      external = true;
      if (pr) Ctor.precision = pr;
      throw Error(precisionLimitExceeded);
    }
    return finalise(new Ctor(LN10), sd, 1, true);
  }


  function getPi(Ctor, sd, rm) {
    if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
    return finalise(new Ctor(PI), sd, rm, true);
  }


  function getPrecision(digits) {
    var w = digits.length - 1,
      len = w * LOG_BASE + 1;

    w = digits[w];

    // If non-zero...
    if (w) {

      // Subtract the number of trailing zeros of the last word.
      for (; w % 10 == 0; w /= 10) len--;

      // Add the number of digits of the first word.
      for (w = digits[0]; w >= 10; w /= 10) len++;
    }

    return len;
  }


  function getZeroString(k) {
    var zs = '';
    for (; k--;) zs += '0';
    return zs;
  }


  /*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */
  function intPow(Ctor, x, n, pr) {
    var isTruncated,
      r = new Ctor(1),

      // Max n of 9007199254740991 takes 53 loop iterations.
      // Maximum digits array length; leaves [28, 34] guard digits.
      k = Math.ceil(pr / LOG_BASE + 4);

    external = false;

    for (;;) {
      if (n % 2) {
        r = r.times(x);
        if (truncate(r.d, k)) isTruncated = true;
      }

      n = mathfloor(n / 2);
      if (n === 0) {

        // To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
        n = r.d.length - 1;
        if (isTruncated && r.d[n] === 0) ++r.d[n];
        break;
      }

      x = x.times(x);
      truncate(x.d, k);
    }

    external = true;

    return r;
  }


  function isOdd(n) {
    return n.d[n.d.length - 1] & 1;
  }


  /*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */
  function maxOrMin(Ctor, args, ltgt) {
    var y,
      x = new Ctor(args[0]),
      i = 0;

    for (; ++i < args.length;) {
      y = new Ctor(args[i]);
      if (!y.s) {
        x = y;
        break;
      } else if (x[ltgt](y)) {
        x = y;
      }
    }

    return x;
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
   * digits.
   *
   * Taylor/Maclaurin series.
   *
   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
   *
   * Argument reduction:
   *   Repeat x = x / 32, k += 5, until |x| < 0.1
   *   exp(x) = exp(x / 2^k)^(2^k)
   *
   * Previously, the argument was initially reduced by
   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
   * found to be slower than just dividing repeatedly by 32 as above.
   *
   * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
   * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
   *
   *  exp(Infinity)  = Infinity
   *  exp(-Infinity) = 0
   *  exp(NaN)       = NaN
   *  exp(Â±0)        = 1
   *
   *  exp(x) is non-terminating for any finite, non-zero x.
   *
   *  The result will always be correctly rounded.
   *
   */
  function naturalExponential(x, sd) {
    var denominator, guard, j, pow, sum, t, wpr,
      rep = 0,
      i = 0,
      k = 0,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // 0/NaN/Infinity?
    if (!x.d || !x.d[0] || x.e > 17) {

      return new Ctor(x.d
        ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0
        : x.s ? x.s < 0 ? 0 : x : 0 / 0);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    t = new Ctor(0.03125);

    // while abs(x) >= 0.1
    while (x.e > -2) {

      // x = x / 2^5
      x = x.times(t);
      k += 5;
    }

    // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
    // necessary to ensure the first 4 rounding digits are correct.
    guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
    wpr += guard;
    denominator = pow = sum = new Ctor(1);
    Ctor.precision = wpr;

    for (;;) {
      pow = finalise(pow.times(x), wpr, 1);
      denominator = denominator.times(++i);
      t = sum.plus(divide(pow, denominator, wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        j = k;
        while (j--) sum = finalise(sum.times(sum), wpr, 1);

        // Check to see if the first 4 rounding digits are [49]999.
        // If so, repeat the summation with a higher precision, otherwise
        // e.g. with precision: 18, rounding: 1
        // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {

          if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += 10;
            denominator = pow = t = new Ctor(1);
            i = 0;
            rep++;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
    }
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
   * digits.
   *
   *  ln(-n)        = NaN
   *  ln(0)         = -Infinity
   *  ln(-0)        = -Infinity
   *  ln(1)         = 0
   *  ln(Infinity)  = Infinity
   *  ln(-Infinity) = NaN
   *  ln(NaN)       = NaN
   *
   *  ln(n) (n != 1) is non-terminating.
   *
   */
  function naturalLogarithm(y, sd) {
    var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2,
      n = 1,
      guard = 10,
      x = y,
      xd = x.d,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // Is x negative or Infinity, NaN, 0 or 1?
    if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
      return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    Ctor.precision = wpr += guard;
    c = digitsToString(xd);
    c0 = c.charAt(0);

    if (Math.abs(e = x.e) < 1.5e15) {

      // Argument reduction.
      // The series converges faster the closer the argument is to 1, so using
      // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
      // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
      // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
      // later be divided by this number, then separate out the power of 10 using
      // ln(a*10^b) = ln(a) + b*ln(10).

      // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
      //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
      // max n is 6 (gives 0.7 - 1.3)
      while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
        x = x.times(y);
        c = digitsToString(x.d);
        c0 = c.charAt(0);
        n++;
      }

      e = x.e;

      if (c0 > 1) {
        x = new Ctor('0.' + c);
        e++;
      } else {
        x = new Ctor(c0 + '.' + c.slice(1));
      }
    } else {

      // The argument reduction method above may result in overflow if the argument y is a massive
      // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
      // function using ln(x*10^e) = ln(x) + e*ln(10).
      t = getLn10(Ctor, wpr + 2, pr).times(e + '');
      x = naturalLogarithm(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);
      Ctor.precision = pr;

      return sd == null ? finalise(x, pr, rm, external = true) : x;
    }

    // x1 is x reduced to a value near 1.
    x1 = x;

    // Taylor series.
    // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
    // where x = (y - 1)/(y + 1)    (|x| < 1)
    sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
    x2 = finalise(x.times(x), wpr, 1);
    denominator = 3;

    for (;;) {
      numerator = finalise(numerator.times(x2), wpr, 1);
      t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        sum = sum.times(2);

        // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
        // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
        if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
        sum = divide(sum, new Ctor(n), wpr, 1);

        // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
        // been repeated previously) and the first 4 rounding digits 9999?
        // If so, restart the summation with a higher precision, otherwise
        // e.g. with precision: 12, rounding: 1
        // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {
          if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += guard;
            t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
            x2 = finalise(x.times(x), wpr, 1);
            denominator = rep = 1;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
      denominator += 2;
    }
  }


  // Â±Infinity, NaN.
  function nonFiniteToString(x) {
    // Unsigned.
    return String(x.s * x.s / 0);
  }


  /*
   * Parse the value of a new Decimal `x` from string `str`.
   */
  function parseDecimal(x, str) {
    var e, i, len;

    // Decimal point?
    if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

    // Exponential form?
    if ((i = str.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +str.slice(i + 1);
      str = str.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(len - 1) === 48; --len);
    str = str.slice(i, len);

    if (str) {
      len -= i;
      x.e = e = e - i - 1;
      x.d = [];

      // Transform base

      // e is the base 10 exponent.
      // i is where to slice str to get the first word of the digits array.
      i = (e + 1) % LOG_BASE;
      if (e < 0) i += LOG_BASE;

      if (i < len) {
        if (i) x.d.push(+str.slice(0, i));
        for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
        str = str.slice(i);
        i = LOG_BASE - str.length;
      } else {
        i -= len;
      }

      for (; i--;) str += '0';
      x.d.push(+str);

      if (external) {

        // Overflow?
        if (x.e > x.constructor.maxE) {

          // Infinity.
          x.d = null;
          x.e = NaN;

        // Underflow?
        } else if (x.e < x.constructor.minE) {

          // Zero.
          x.e = 0;
          x.d = [0];
          // x.constructor.underflow = true;
        } // else x.constructor.underflow = false;
      }
    } else {

      // Zero.
      x.e = 0;
      x.d = [0];
    }

    return x;
  }


  /*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */
  function parseOther(x, str) {
    var base, Ctor, divisor, i, isFloat, len, p, xd, xe;

    if (str === 'Infinity' || str === 'NaN') {
      if (!+str) x.s = NaN;
      x.e = NaN;
      x.d = null;
      return x;
    }

    if (isHex.test(str))  {
      base = 16;
      str = str.toLowerCase();
    } else if (isBinary.test(str))  {
      base = 2;
    } else if (isOctal.test(str))  {
      base = 8;
    } else {
      throw Error(invalidArgument + str);
    }

    // Is there a binary exponent part?
    i = str.search(/p/i);

    if (i > 0) {
      p = +str.slice(i + 1);
      str = str.substring(2, i);
    } else {
      str = str.slice(2);
    }

    // Convert `str` as an integer then divide the result by `base` raised to a power such that the
    // fraction part will be restored.
    i = str.indexOf('.');
    isFloat = i >= 0;
    Ctor = x.constructor;

    if (isFloat) {
      str = str.replace('.', '');
      len = str.length;
      i = len - i;

      // log[10](16) = 1.2041... , log[10](88) = 1.9444....
      divisor = intPow(Ctor, new Ctor(base), i, i * 2);
    }

    xd = convertBase(str, base, BASE);
    xe = xd.length - 1;

    // Remove trailing zeros.
    for (i = xe; xd[i] === 0; --i) xd.pop();
    if (i < 0) return new Ctor(x.s * 0);
    x.e = getBase10Exponent(xd, xe);
    x.d = xd;
    external = false;

    // At what precision to perform the division to ensure exact conversion?
    // maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
    // log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
    // E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
    // maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
    // Therefore using 4 * the number of digits of str will always be enough.
    if (isFloat) x = divide(x, divisor, len * 4);

    // Multiply by the binary exponent part if present.
    if (p) x = x.times(Math.abs(p) < 54 ? Math.pow(2, p) : Decimal.pow(2, p));
    external = true;

    return x;
  }


  /*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */
  function sine(Ctor, x) {
    var k,
      len = x.d.length;

    if (len < 3) return taylorSeries(Ctor, 2, x, x);

    // Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
    // i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
    // and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))

    // Estimate the optimum number of times to use the argument reduction.
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;

    // Max k before Math.pow precision loss is 22
    x = x.times(Math.pow(5, -k));
    x = taylorSeries(Ctor, 2, x, x);

    // Reverse argument reduction
    var sin2_x,
      d5 = new Ctor(5),
      d16 = new Ctor(16),
      d20 = new Ctor(20);
    for (; k--;) {
      sin2_x = x.times(x);
      x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
    }

    return x;
  }


  // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
  function taylorSeries(Ctor, n, x, y, isHyperbolic) {
    var j, t, u, x2,
      i = 1,
      pr = Ctor.precision,
      k = Math.ceil(pr / LOG_BASE);

    external = false;
    x2 = x.times(x);
    u = new Ctor(y);

    for (;;) {
      t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
      u = isHyperbolic ? y.plus(t) : y.minus(t);
      y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
      t = u.plus(y);

      if (t.d[k] !== void 0) {
        for (j = k; t.d[j] === u.d[j] && j--;);
        if (j == -1) break;
      }

      j = u;
      u = y;
      y = t;
      t = j;
      i++;
    }

    external = true;
    t.d.length = k + 1;

    return t;
  }


  // Return the absolute value of `x` reduced to less than or equal to half pi.
  function toLessThanHalfPi(Ctor, x) {
    var t,
      isNeg = x.s < 0,
      pi = getPi(Ctor, Ctor.precision, 1),
      halfPi = pi.times(0.5);

    x = x.abs();

    if (x.lte(halfPi)) {
      quadrant = isNeg ? 4 : 1;
      return x;
    }

    t = x.divToInt(pi);

    if (t.isZero()) {
      quadrant = isNeg ? 3 : 2;
    } else {
      x = x.minus(t.times(pi));

      // 0 <= x < pi
      if (x.lte(halfPi)) {
        quadrant = isOdd(t) ? (isNeg ? 2 : 3) : (isNeg ? 4 : 1);
        return x;
      }

      quadrant = isOdd(t) ? (isNeg ? 1 : 4) : (isNeg ? 3 : 2);
    }

    return x.minus(pi).abs();
  }


  /*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */
  function toStringBinary(x, baseOut, sd, rm) {
    var base, e, i, k, len, roundUp, str, xd, y,
      Ctor = x.constructor,
      isExp = sd !== void 0;

    if (isExp) {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    } else {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    }

    if (!x.isFinite()) {
      str = nonFiniteToString(x);
    } else {
      str = finiteToString(x);
      i = str.indexOf('.');

      // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
      // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
      // minBinaryExponent = floor(decimalExponent * log[2](10))
      // log[2](10) = 3.321928094887362347870319429489390175864

      if (isExp) {
        base = 2;
        if (baseOut == 16) {
          sd = sd * 4 - 3;
        } else if (baseOut == 8) {
          sd = sd * 3 - 2;
        }
      } else {
        base = baseOut;
      }

      // Convert the number as an integer then divide the result by its base raised to a power such
      // that the fraction part will be restored.

      // Non-integer.
      if (i >= 0) {
        str = str.replace('.', '');
        y = new Ctor(1);
        y.e = str.length - i;
        y.d = convertBase(finiteToString(y), 10, base);
        y.e = y.d.length;
      }

      xd = convertBase(str, 10, base);
      e = len = xd.length;

      // Remove trailing zeros.
      for (; xd[--len] == 0;) xd.pop();

      if (!xd[0]) {
        str = isExp ? '0p+0' : '0';
      } else {
        if (i < 0) {
          e--;
        } else {
          x = new Ctor(x);
          x.d = xd;
          x.e = e;
          x = divide(x, y, sd, rm, 0, base);
          xd = x.d;
          e = x.e;
          roundUp = inexact;
        }

        // The rounding digit, i.e. the digit after the digit that may be rounded up.
        i = xd[sd];
        k = base / 2;
        roundUp = roundUp || xd[sd + 1] !== void 0;

        roundUp = rm < 4
          ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2))
          : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 ||
            rm === (x.s < 0 ? 8 : 7));

        xd.length = sd;

        if (roundUp) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (; ++xd[--sd] > base - 1;) {
            xd[sd] = 0;
            if (!sd) {
              ++e;
              xd.unshift(1);
            }
          }
        }

        // Determine trailing zeros.
        for (len = xd.length; !xd[len - 1]; --len);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i < len; i++) str += NUMERALS.charAt(xd[i]);

        // Add binary exponent suffix?
        if (isExp) {
          if (len > 1) {
            if (baseOut == 16 || baseOut == 8) {
              i = baseOut == 16 ? 4 : 3;
              for (--len; len % i; len++) str += '0';
              xd = convertBase(str, base, baseOut);
              for (len = xd.length; !xd[len - 1]; --len);

              // xd[0] will always be be 1
              for (i = 1, str = '1.'; i < len; i++) str += NUMERALS.charAt(xd[i]);
            } else {
              str = str.charAt(0) + '.' + str.slice(1);
            }
          }

          str =  str + (e < 0 ? 'p' : 'p+') + e;
        } else if (e < 0) {
          for (; ++e;) str = '0' + str;
          str = '0.' + str;
        } else {
          if (++e > len) for (e -= len; e-- ;) str += '0';
          else if (e < len) str = str.slice(0, e) + '.' + str.slice(e);
        }
      }

      str = (baseOut == 16 ? '0x' : baseOut == 2 ? '0b' : baseOut == 8 ? '0o' : '') + str;
    }

    return x.s < 0 ? '-' + str : str;
  }


  // Does not strip trailing zeros.
  function truncate(arr, len) {
    if (arr.length > len) {
      arr.length = len;
      return true;
    }
  }


  // Decimal methods


  /*
   *  abs
   *  acos
   *  acosh
   *  add
   *  asin
   *  asinh
   *  atan
   *  atanh
   *  atan2
   *  cbrt
   *  ceil
   *  clone
   *  config
   *  cos
   *  cosh
   *  div
   *  exp
   *  floor
   *  fromJSON
   *  hypot
   *  ln
   *  log
   *  log2
   *  log10
   *  max
   *  min
   *  mod
   *  mul
   *  pow
   *  random
   *  round
   *  sign
   *  sin
   *  sinh
   *  sqrt
   *  sub
   *  tan
   *  tanh
   *  trunc
   */


  /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function abs(x) {
    return new this(x).abs();
  }


  /*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function acos(x) {
    return new this(x).acos();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function acosh(x) {
    return new this(x).acosh();
  }


  /*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function add(x, y) {
    return new this(x).plus(y);
  }


  /*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function asin(x) {
    return new this(x).asin();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function asinh(x) {
    return new this(x).asinh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function atan(x) {
    return new this(x).atan();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function atanh(x) {
    return new this(x).atanh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
   * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi, pi]
   *
   * y {number|string|Decimal} The y-coordinate.
   * x {number|string|Decimal} The x-coordinate.
   *
   * atan2(Â±0, -0)               = Â±pi
   * atan2(Â±0, +0)               = Â±0
   * atan2(Â±0, -x)               = Â±pi for x > 0
   * atan2(Â±0, x)                = Â±0 for x > 0
   * atan2(-y, Â±0)               = -pi/2 for y > 0
   * atan2(y, Â±0)                = pi/2 for y > 0
   * atan2(Â±y, -Infinity)        = Â±pi for finite y > 0
   * atan2(Â±y, +Infinity)        = Â±0 for finite y > 0
   * atan2(Â±Infinity, x)         = Â±pi/2 for finite x
   * atan2(Â±Infinity, -Infinity) = Â±3*pi/4
   * atan2(Â±Infinity, +Infinity) = Â±pi/4
   * atan2(NaN, x) = NaN
   * atan2(y, NaN) = NaN
   *
   */
  function atan2(y, x) {
    y = new this(y);
    x = new this(x);
    var r,
      pr = this.precision,
      rm = this.rounding,
      wpr = pr + 4;

    // Either NaN
    if (!y.s || !x.s) {
      r = new this(NaN);

    // Both Â±Infinity
    } else if (!y.d && !x.d) {
      r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
      r.s = y.s;

    // x is Â±Infinity or y is Â±0
    } else if (!x.d || y.isZero()) {
      r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
      r.s = y.s;

    // y is Â±Infinity or x is Â±0
    } else if (!y.d || x.isZero()) {
      r = getPi(this, wpr, 1).times(0.5);
      r.s = y.s;

    // Both non-zero and finite
    } else if (x.s < 0) {
      this.precision = wpr;
      this.rounding = 1;
      r = this.atan(divide(y, x, wpr, 1));
      x = getPi(this, wpr, 1);
      this.precision = pr;
      this.rounding = rm;
      r = y.s < 0 ? r.minus(x) : r.plus(x);
    } else {
      r = this.atan(divide(y, x, wpr, 1));
    }

    return r;
  }


  /*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function cbrt(x) {
    return new this(x).cbrt();
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */
  function ceil(x) {
    return finalise(x = new this(x), x.e + 1, 2);
  }


  /*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *   maxE       {number}
   *   minE       {number}
   *   modulo     {number}
   *   crypto     {boolean|number|undefined}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */
  function config(obj) {
    if (!obj || typeof obj !== 'object') throw Error(decimalError + 'Object expected');
    var i, p, v,
      ps = [
        'precision', 1, MAX_DIGITS,
        'rounding', 0, 8,
        'toExpNeg', -EXP_LIMIT, 0,
        'toExpPos', 0, EXP_LIMIT,
        'maxE', 0, EXP_LIMIT,
        'minE', -EXP_LIMIT, 0,
        'modulo', 0, 9
      ];

    for (i = 0; i < ps.length; i += 3) {
      if ((v = obj[p = ps[i]]) !== void 0) {
        if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }

    if (obj.hasOwnProperty(p = 'crypto')) {
      if ((v = obj[p]) === void 0) {
        this[p] = v;
      } else if (v === true || v === false || v === 0 || v === 1) {
        this[p] = !!(v && cryptoObject &&
            (cryptoObject.getRandomValues || cryptoObject.randomBytes));
      } else {
        throw Error(invalidArgument + p + ': ' + v);
      }
    }

    return this;
  }


  /*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cos(x) {
    return new this(x).cos();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cosh(x) {
    return new this(x).cosh();
  }


  /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */
  function clone(obj) {
    var i, p, ps;

    /*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */
    function Decimal(v) {
      var e, i, t,
        x = this;

      // Decimal called without new.
      if (!(x instanceof Decimal)) return new Decimal(v);

      // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
      // which points to Object.
      x.constructor = Decimal;

      // Duplicate.
      if (v instanceof Decimal) {
        x.s = v.s;
        x.e = v.e;
        x.d = (v = v.d) ? v.slice() : v;
        return;
      }

      t = typeof v;

      if (t === 'number') {
        if (v === 0) {
          x.s = 1 / v < 0 ? -1 : 1;
          x.e = 0;
          x.d = [0];
          return;
        }

        if (v < 0) {
          v = -v;
          x.s = -1;
        } else {
          x.s = 1;
        }

        // Fast path for small integers.
        if (v === ~~v && v < 1e7) {
          for (e = 0, i = v; i >= 10; i /= 10) e++;
          x.e = e;
          x.d = [v];
          return;

        // Infinity, NaN.
        } else if (v * 0 !== 0) {
          if (!v) x.s = NaN;
          x.e = NaN;
          x.d = null;
          return;
        }

        return parseDecimal(x, v.toString());

      } else if (t !== 'string') {
        throw Error(invalidArgument + v);
      }

      // Minus sign?
      if (v.charCodeAt(0) === 45) {
        v = v.slice(1);
        x.s = -1;
      } else {
        x.s = 1;
      }

      return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
    }

    Decimal.prototype = P;

    Decimal.ROUND_UP = 0;
    Decimal.ROUND_DOWN = 1;
    Decimal.ROUND_CEIL = 2;
    Decimal.ROUND_FLOOR = 3;
    Decimal.ROUND_HALF_UP = 4;
    Decimal.ROUND_HALF_DOWN = 5;
    Decimal.ROUND_HALF_EVEN = 6;
    Decimal.ROUND_HALF_CEIL = 7;
    Decimal.ROUND_HALF_FLOOR = 8;
    Decimal.EUCLID = 9;

    Decimal.config = config;
    Decimal.clone = clone;

    Decimal.abs = abs;
    Decimal.acos = acos;
    Decimal.acosh = acosh;        // ES6
    Decimal.add = add;
    Decimal.asin = asin;
    Decimal.asinh = asinh;        // ES6
    Decimal.atan = atan;
    Decimal.atanh = atanh;        // ES6
    Decimal.atan2 = atan2;
    Decimal.cbrt = cbrt;          // ES6
    Decimal.ceil = ceil;
    Decimal.cos = cos;
    Decimal.cosh = cosh;          // ES6
    Decimal.div = div;
    Decimal.exp = exp;
    Decimal.floor = floor;
    Decimal.fromJSON = fromJSON;
    Decimal.hypot = hypot;        // ES6
    Decimal.ln = ln;
    Decimal.log = log;
    Decimal.log10 = log10;        // ES6
    Decimal.log2 = log2;          // ES6
    Decimal.max = max;
    Decimal.min = min;
    Decimal.mod = mod;
    Decimal.mul = mul;
    Decimal.pow = pow;
    Decimal.random = random;
    Decimal.round = round;
    Decimal.sign = sign;          // ES6
    Decimal.sin = sin;
    Decimal.sinh = sinh;          // ES6
    Decimal.sqrt = sqrt;
    Decimal.sub = sub;
    Decimal.tan = tan;
    Decimal.tanh = tanh;          // ES6
    Decimal.trunc = trunc;        // ES6

    if (obj === void 0) obj = {};
    if (obj) {
      ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'maxE', 'minE', 'modulo', 'crypto'];
      for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
    }

    Decimal.config(obj);

    return Decimal;
  }


  /*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function div(x, y) {
    return new this(x).div(y);
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */
  function exp(x) {
    return new this(x).exp();
  }


  /*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */
  function floor(x) {
    return finalise(x = new this(x), x.e + 1, 3);
  }


  /*
   * Return a new Decimal from `str`, a string value created by `toJSON`.
   *
   * Base 88 alphabet:
   * 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./:;=?@[]^_`{|}~
   *
   * If `str` is just one character:
   * 0-81  [[0, 40][-0, -40]]
   * 82    -Infinity
   * 83    +Infinity
   * 84    NaN
   *
   *   64 32 16  8  4  2  1
   *    1  0  1  0  1  1  1 = 87
   *
   */
  function fromJSON(str) {
    var e, isNeg, k, n;

    if (typeof str !== 'string' || !str) throw Error(invalidArgument + str);
    k = str.length;
    n = NUMERALS.indexOf(str.charAt(0));

    //  [0, 81] -> [[0, 40][-0, -40]]
    if (k === 1) {
      return new this(n > 81 ? [-1 / 0, 1 / 0, 0 / 0][n - 82] : n > 40 ? -(n - 41) : n);
    } else if (n & 64) {
      isNeg = n & 16;

      // e = isNeg ? [-3, 4] : [-7, 8]
      e = isNeg ? (n & 7) - 3 : (n & 15) - 7;
      k = 1;
    } else if (k === 2) {
      n = n * 88 + NUMERALS.indexOf(str.charAt(1));

      // [0, 5631] -> [[0, 2815][-0, -2815]] -> [[41, 2856][-41, -2856]]
      return new this(n >= 2816 ? -(n - 2816) - 41 : n + 41);
    } else {

      // 0XXXXXX
      // 0 {is negative} {is exponent negative} {exponent digit count [0, 15]}
      isNeg = n & 32;

      // Has an exponent been specified?
      if (n & 31) {
        e = n & 15;    // Exponent character count [1, 15]
        k = e + 1;     // Index of first character of the significand.

        if (e === 1)  {
          e = NUMERALS.indexOf(str.charAt(1));
        } else if (e === 2) {
          e = NUMERALS.indexOf(str.charAt(1)) * 88 +
            NUMERALS.indexOf(str.charAt(2));
        } else {
          e = +convertBase(str.slice(1, k), 88, 10).join('');
        }

        // Negative exponent?
        if (n & 16) e = -e;
      } else {

        // Integer without trailing zeros.
        // 0X00000
        // 0 {is negative} 0 0 0 0 0
        str = convertBase(str.slice(1), 88, 10).join('');
        return new this(isNeg ? '-' + str : str);
      }
    }

    str = convertBase(str.slice(k), 88, 10).join('');
    e = e - str.length + 1;
    str = str + 'e' + e;

    return new this(isNeg ? '-' + str : str);
  }


  /*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   */
  function hypot() {
    var i, n,
      t = new this(0);

    external = false;

    for (i = 0; i < arguments.length;) {
      n = new this(arguments[i++]);
      if (!n.d) {
        if (n.s) {
          external = true;
          return new this(1 / 0);
        }
        t = n;
      } else if (t.d) {
        t = t.plus(n.times(n));
      }
    }

    external = true;

    return t.sqrt();
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function ln(x) {
    return new this(x).ln();
  }


  /*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */
  function log(x, y) {
    return new this(x).log(y);
  }


  /*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log2(x) {
    return new this(x).log(2);
  }


  /*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log10(x) {
    return new this(x).log(10);
  }


  /*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function max() {
    return maxOrMin(this, arguments, 'lt');
  }


  /*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function min() {
    return maxOrMin(this, arguments, 'gt');
  }


  /*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mod(x, y) {
    return new this(x).mod(y);
  }


  /*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mul(x, y) {
    return new this(x).mul(y);
  }


  /*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */
  function pow(x, y) {
    return new this(x).pow(y);
  }


  /*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */
  function random(sd) {
    var d, e, k, n,
      i = 0,
      r = new this(1),
      rd = [];

    if (sd === void 0) sd = this.precision;
    else checkInt32(sd, 1, MAX_DIGITS);

    k = Math.ceil(sd / LOG_BASE);

    if (this.crypto === false) {
      for (; i < k;) rd[i++] = Math.random() * 1e7 | 0;

    // Browsers supporting crypto.getRandomValues.
    } else if (cryptoObject && cryptoObject.getRandomValues) {
      d = cryptoObject.getRandomValues(new Uint32Array(k));

      for (; i < k;) {
        n = d[i];

        // 0 <= n < 4294967296
        // Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
        if (n >= 4.29e9) {
          d[i] = cryptoObject.getRandomValues(new Uint32Array(1))[0];
        } else {

          // 0 <= n <= 4289999999
          // 0 <= (n % 1e7) <= 9999999
          rd[i++] = n % 1e7;
        }
      }

    // Node.js supporting crypto.randomBytes.
    } else if (cryptoObject && cryptoObject.randomBytes) {

      // buffer
      d = cryptoObject.randomBytes(k *= 4);

      for (; i < k;) {

        // 0 <= n < 2147483648
        n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 0x7f) << 24);

        // Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
        if (n >= 2.14e9) {
          cryptoObject.randomBytes(4).copy(d, i);
        } else {

          // 0 <= n <= 2139999999
          // 0 <= (n % 1e7) <= 9999999
          rd.push(n % 1e7);
          i += 4;
        }
      }

      i = k / 4;
    } else if (this.crypto) {
      throw Error(decimalError + 'crypto unavailable');
    } else {
      for (; i < k;) rd[i++] = Math.random() * 1e7 | 0;
    }

    k = rd[--i];
    sd %= LOG_BASE;

    // Convert trailing digits to zeros according to sd.
    if (k && sd) {
      n = mathpow(10, LOG_BASE - sd);
      rd[i] = (k / n | 0) * n;
    }

    // Remove trailing words which are zero.
    for (; rd[i] === 0; i--) rd.pop();

    // Zero?
    if (i < 0) {
      e = 0;
      rd = [0];
    } else {
      e = -1;

      // Remove leading words which are zero and adjust exponent accordingly.
      for (; rd[0] === 0; e -= LOG_BASE) rd.shift();

      // Count the digits of the first word of rd to determine leading zeros.
      for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;

      // Adjust the exponent for leading zeros of the first word of rd.
      if (k < LOG_BASE) e -= LOG_BASE - k;
    }

    r.e = e;
    r.d = rd;

    return r;
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */
  function round(x) {
    return finalise(x = new this(x), x.e + 1, this.rounding);
  }


  /*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   */
  function sign(x) {
    x = new this(x);
    return x.d ? (x.d[0] ? x.s : 0 * x.s) : x.s || NaN;
  }


  /*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sin(x) {
    return new this(x).sin();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sinh(x) {
    return new this(x).sinh();
  }


  /*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function sqrt(x) {
    return new this(x).sqrt();
  }


  /*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function sub(x, y) {
    return new this(x).sub(y);
  }


  /*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tan(x) {
    return new this(x).tan();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tanh(x) {
    return new this(x).tanh();
  }


  /*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */
  function trunc(x) {
    return finalise(x = new this(x), x.e + 1, 1);
  }


  // Create and configure initial Decimal constructor.
  Decimal = clone(Decimal);

  // Create the internal constants from their string values.
  LN10 = new Decimal(LN10);
  PI = new Decimal(PI);


  // Export.


  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return Decimal;
    });

  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = Decimal;

    if (!cryptoObject) {
      try {
        cryptoObject = require('cry' + 'pto');
      } catch (e) {
        // Ignore.
      }
    }

  // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self
        ? self : Function('return this')();
    }

    noConflict = globalScope.Decimal;
    Decimal.noConflict = function () {
      globalScope.Decimal = noConflict;
      return Decimal;
    };

    globalScope.Decimal = Decimal;
  }
})(this);

// Generated by CoffeeScript 1.8.0
(function() {
  var ALPHABET, ALPHABET_MAP, Base58, i;

  Base58 = (typeof module !== "undefined" && module !== null ? module.exports : void 0) || (window.Base58 = {});

  ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  ALPHABET_MAP = {};

  i = 0;

  while (i < ALPHABET.length) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
    i++;
  }

  Base58.encode = function(buffer) {
    var carry, digits, j;
    if (buffer.length === 0) {
      return "";
    }
    i = void 0;
    j = void 0;
    digits = [0];
    i = 0;
    while (i < buffer.length) {
      j = 0;
      while (j < digits.length) {
        digits[j] <<= 8;
        j++;
      }
      digits[0] += buffer[i];
      carry = 0;
      j = 0;
      while (j < digits.length) {
        digits[j] += carry;
        carry = (digits[j] / 58) | 0;
        digits[j] %= 58;
        ++j;
      }
      while (carry) {
        digits.push(carry % 58);
        carry = (carry / 58) | 0;
      }
      i++;
    }
    i = 0;
    while (buffer[i] === 0 && i < buffer.length - 1) {
      digits.push(0);
      i++;
    }
    return digits.reverse().map(function(digit) {
      return ALPHABET[digit];
    }).join("");
  };

  Base58.decode = function(string) {
    var bytes, c, carry, j;
    if (string.length === 0) {
      return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(0);
    }
    i = void 0;
    j = void 0;
    bytes = [0];
    i = 0;
    while (i < string.length) {
      c = string[i];
      if (!(c in ALPHABET_MAP)) {
        throw "Base58.decode received unacceptable input. Character '" + c + "' is not in the Base58 alphabet.";
      }
      j = 0;
      while (j < bytes.length) {
        bytes[j] *= 58;
        j++;
      }
      bytes[0] += ALPHABET_MAP[c];
      carry = 0;
      j = 0;
      while (j < bytes.length) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
        ++j;
      }
      while (carry) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
      i++;
    }
    i = 0;
    while (string[i] === "1" && i < string.length - 1) {
      bytes.push(0);
      i++;
    }
    return new (typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(bytes.reverse());
  };

}).call(this);

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(u,p){var d={},l=d.lib={},s=function(){},t=l.Base={extend:function(a){s.prototype=this;var c=new s;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
r=l.WordArray=t.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=p?c:4*a.length},toString:function(a){return(a||v).stringify(this)},concat:function(a){var c=this.words,e=a.words,j=this.sigBytes;a=a.sigBytes;this.clamp();if(j%4)for(var k=0;k<a;k++)c[j+k>>>2]|=(e[k>>>2]>>>24-8*(k%4)&255)<<24-8*((j+k)%4);else if(65535<e.length)for(k=0;k<a;k+=4)c[j+k>>>2]=e[k>>>2];else c.push.apply(c,e);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=u.ceil(c/4)},clone:function(){var a=t.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],e=0;e<a;e+=4)c.push(4294967296*u.random()|0);return new r.init(c,a)}}),w=d.enc={},v=w.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++){var k=c[j>>>2]>>>24-8*(j%4)&255;e.push((k>>>4).toString(16));e.push((k&15).toString(16))}return e.join("")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j+=2)e[j>>>3]|=parseInt(a.substr(j,
2),16)<<24-4*(j%8);return new r.init(e,c/2)}},b=w.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++)e.push(String.fromCharCode(c[j>>>2]>>>24-8*(j%4)&255));return e.join("")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j++)e[j>>>2]|=(a.charCodeAt(j)&255)<<24-8*(j%4);return new r.init(e,c)}},x=w.Utf8={stringify:function(a){try{return decodeURIComponent(escape(b.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return b.parse(unescape(encodeURIComponent(a)))}},
q=l.BufferedBlockAlgorithm=t.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=x.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,e=c.words,j=c.sigBytes,k=this.blockSize,b=j/(4*k),b=a?u.ceil(b):u.max((b|0)-this._minBufferSize,0);a=b*k;j=u.min(4*a,j);if(a){for(var q=0;q<a;q+=k)this._doProcessBlock(e,q);q=e.splice(0,a);c.sigBytes-=j}return new r.init(q,j)},clone:function(){var a=t.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});l.Hasher=q.extend({cfg:t.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){q.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,e){return(new a.init(e)).finalize(b)}},_createHmacHelper:function(a){return function(b,e){return(new n.HMAC.init(a,
e)).finalize(b)}}});var n=d.algo={};return d}(Math);
(function(){var u=CryptoJS,p=u.lib.WordArray;u.enc.Base64={stringify:function(d){var l=d.words,p=d.sigBytes,t=this._map;d.clamp();d=[];for(var r=0;r<p;r+=3)for(var w=(l[r>>>2]>>>24-8*(r%4)&255)<<16|(l[r+1>>>2]>>>24-8*((r+1)%4)&255)<<8|l[r+2>>>2]>>>24-8*((r+2)%4)&255,v=0;4>v&&r+0.75*v<p;v++)d.push(t.charAt(w>>>6*(3-v)&63));if(l=t.charAt(64))for(;d.length%4;)d.push(l);return d.join("")},parse:function(d){var l=d.length,s=this._map,t=s.charAt(64);t&&(t=d.indexOf(t),-1!=t&&(l=t));for(var t=[],r=0,w=0;w<
l;w++)if(w%4){var v=s.indexOf(d.charAt(w-1))<<2*(w%4),b=s.indexOf(d.charAt(w))>>>6-2*(w%4);t[r>>>2]|=(v|b)<<24-8*(r%4);r++}return p.create(t,r)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
(function(u){function p(b,n,a,c,e,j,k){b=b+(n&a|~n&c)+e+k;return(b<<j|b>>>32-j)+n}function d(b,n,a,c,e,j,k){b=b+(n&c|a&~c)+e+k;return(b<<j|b>>>32-j)+n}function l(b,n,a,c,e,j,k){b=b+(n^a^c)+e+k;return(b<<j|b>>>32-j)+n}function s(b,n,a,c,e,j,k){b=b+(a^(n|~c))+e+k;return(b<<j|b>>>32-j)+n}for(var t=CryptoJS,r=t.lib,w=r.WordArray,v=r.Hasher,r=t.algo,b=[],x=0;64>x;x++)b[x]=4294967296*u.abs(u.sin(x+1))|0;r=r.MD5=v.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(q,n){for(var a=0;16>a;a++){var c=n+a,e=q[c];q[c]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360}var a=this._hash.words,c=q[n+0],e=q[n+1],j=q[n+2],k=q[n+3],z=q[n+4],r=q[n+5],t=q[n+6],w=q[n+7],v=q[n+8],A=q[n+9],B=q[n+10],C=q[n+11],u=q[n+12],D=q[n+13],E=q[n+14],x=q[n+15],f=a[0],m=a[1],g=a[2],h=a[3],f=p(f,m,g,h,c,7,b[0]),h=p(h,f,m,g,e,12,b[1]),g=p(g,h,f,m,j,17,b[2]),m=p(m,g,h,f,k,22,b[3]),f=p(f,m,g,h,z,7,b[4]),h=p(h,f,m,g,r,12,b[5]),g=p(g,h,f,m,t,17,b[6]),m=p(m,g,h,f,w,22,b[7]),
f=p(f,m,g,h,v,7,b[8]),h=p(h,f,m,g,A,12,b[9]),g=p(g,h,f,m,B,17,b[10]),m=p(m,g,h,f,C,22,b[11]),f=p(f,m,g,h,u,7,b[12]),h=p(h,f,m,g,D,12,b[13]),g=p(g,h,f,m,E,17,b[14]),m=p(m,g,h,f,x,22,b[15]),f=d(f,m,g,h,e,5,b[16]),h=d(h,f,m,g,t,9,b[17]),g=d(g,h,f,m,C,14,b[18]),m=d(m,g,h,f,c,20,b[19]),f=d(f,m,g,h,r,5,b[20]),h=d(h,f,m,g,B,9,b[21]),g=d(g,h,f,m,x,14,b[22]),m=d(m,g,h,f,z,20,b[23]),f=d(f,m,g,h,A,5,b[24]),h=d(h,f,m,g,E,9,b[25]),g=d(g,h,f,m,k,14,b[26]),m=d(m,g,h,f,v,20,b[27]),f=d(f,m,g,h,D,5,b[28]),h=d(h,f,
m,g,j,9,b[29]),g=d(g,h,f,m,w,14,b[30]),m=d(m,g,h,f,u,20,b[31]),f=l(f,m,g,h,r,4,b[32]),h=l(h,f,m,g,v,11,b[33]),g=l(g,h,f,m,C,16,b[34]),m=l(m,g,h,f,E,23,b[35]),f=l(f,m,g,h,e,4,b[36]),h=l(h,f,m,g,z,11,b[37]),g=l(g,h,f,m,w,16,b[38]),m=l(m,g,h,f,B,23,b[39]),f=l(f,m,g,h,D,4,b[40]),h=l(h,f,m,g,c,11,b[41]),g=l(g,h,f,m,k,16,b[42]),m=l(m,g,h,f,t,23,b[43]),f=l(f,m,g,h,A,4,b[44]),h=l(h,f,m,g,u,11,b[45]),g=l(g,h,f,m,x,16,b[46]),m=l(m,g,h,f,j,23,b[47]),f=s(f,m,g,h,c,6,b[48]),h=s(h,f,m,g,w,10,b[49]),g=s(g,h,f,m,
E,15,b[50]),m=s(m,g,h,f,r,21,b[51]),f=s(f,m,g,h,u,6,b[52]),h=s(h,f,m,g,k,10,b[53]),g=s(g,h,f,m,B,15,b[54]),m=s(m,g,h,f,e,21,b[55]),f=s(f,m,g,h,v,6,b[56]),h=s(h,f,m,g,x,10,b[57]),g=s(g,h,f,m,t,15,b[58]),m=s(m,g,h,f,D,21,b[59]),f=s(f,m,g,h,z,6,b[60]),h=s(h,f,m,g,C,10,b[61]),g=s(g,h,f,m,j,15,b[62]),m=s(m,g,h,f,A,21,b[63]);a[0]=a[0]+f|0;a[1]=a[1]+m|0;a[2]=a[2]+g|0;a[3]=a[3]+h|0},_doFinalize:function(){var b=this._data,n=b.words,a=8*this._nDataBytes,c=8*b.sigBytes;n[c>>>5]|=128<<24-c%32;var e=u.floor(a/
4294967296);n[(c+64>>>9<<4)+15]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360;n[(c+64>>>9<<4)+14]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(n.length+1);this._process();b=this._hash;n=b.words;for(a=0;4>a;a++)c=n[a],n[a]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return b},clone:function(){var b=v.clone.call(this);b._hash=this._hash.clone();return b}});t.MD5=v._createHelper(r);t.HmacMD5=v._createHmacHelper(r)})(Math);
(function(){var u=CryptoJS,p=u.lib,d=p.Base,l=p.WordArray,p=u.algo,s=p.EvpKDF=d.extend({cfg:d.extend({keySize:4,hasher:p.MD5,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(d,r){for(var p=this.cfg,s=p.hasher.create(),b=l.create(),u=b.words,q=p.keySize,p=p.iterations;u.length<q;){n&&s.update(n);var n=s.update(d).finalize(r);s.reset();for(var a=1;a<p;a++)n=s.finalize(n),s.reset();b.concat(n)}b.sigBytes=4*q;return b}});u.EvpKDF=function(d,l,p){return s.create(p).compute(d,
l)}})();
CryptoJS.lib.Cipher||function(u){var p=CryptoJS,d=p.lib,l=d.Base,s=d.WordArray,t=d.BufferedBlockAlgorithm,r=p.enc.Base64,w=p.algo.EvpKDF,v=d.Cipher=t.extend({cfg:l.extend(),createEncryptor:function(e,a){return this.create(this._ENC_XFORM_MODE,e,a)},createDecryptor:function(e,a){return this.create(this._DEC_XFORM_MODE,e,a)},init:function(e,a,b){this.cfg=this.cfg.extend(b);this._xformMode=e;this._key=a;this.reset()},reset:function(){t.reset.call(this);this._doReset()},process:function(e){this._append(e);return this._process()},
finalize:function(e){e&&this._append(e);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(b,k,d){return("string"==typeof k?c:a).encrypt(e,b,k,d)},decrypt:function(b,k,d){return("string"==typeof k?c:a).decrypt(e,b,k,d)}}}});d.StreamCipher=v.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var b=p.mode={},x=function(e,a,b){var c=this._iv;c?this._iv=u:c=this._prevBlock;for(var d=0;d<b;d++)e[a+d]^=
c[d]},q=(d.BlockCipherMode=l.extend({createEncryptor:function(e,a){return this.Encryptor.create(e,a)},createDecryptor:function(e,a){return this.Decryptor.create(e,a)},init:function(e,a){this._cipher=e;this._iv=a}})).extend();q.Encryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize;x.call(this,e,a,c);b.encryptBlock(e,a);this._prevBlock=e.slice(a,a+c)}});q.Decryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize,d=e.slice(a,a+c);b.decryptBlock(e,a);x.call(this,
e,a,c);this._prevBlock=d}});b=b.CBC=q;q=(p.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,l=[],n=0;n<c;n+=4)l.push(d);c=s.create(l,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};d.BlockCipher=v.extend({cfg:v.cfg.extend({mode:b,padding:q}),reset:function(){v.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,
this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var n=d.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),b=(p.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?s.create([1398893684,
1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=s.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return n.create({ciphertext:a,salt:c})}},a=d.SerializableCipher=l.extend({cfg:l.extend({format:b}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var l=a.createEncryptor(c,d);b=l.finalize(b);l=l.cfg;return n.create({ciphertext:b,key:c,iv:l.iv,algorithm:a,mode:l.mode,padding:l.padding,blockSize:a.blockSize,formatter:d.format})},
decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),p=(p.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=s.random(8));a=w.create({keySize:b+c}).compute(a,d);c=s.create(a.words.slice(b),4*c);a.sigBytes=4*b;return n.create({key:a,iv:c,salt:d})}},c=d.PasswordBasedCipher=a.extend({cfg:a.cfg.extend({kdf:p}),encrypt:function(b,c,d,l){l=this.cfg.extend(l);d=l.kdf.execute(d,
b.keySize,b.ivSize);l.iv=d.iv;b=a.encrypt.call(this,b,c,d.key,l);b.mixIn(d);return b},decrypt:function(b,c,d,l){l=this.cfg.extend(l);c=this._parse(c,l.format);d=l.kdf.execute(d,b.keySize,b.ivSize,c.salt);l.iv=d.iv;return a.decrypt.call(this,b,c,d.key,l)}})}();
(function(){for(var u=CryptoJS,p=u.lib.BlockCipher,d=u.algo,l=[],s=[],t=[],r=[],w=[],v=[],b=[],x=[],q=[],n=[],a=[],c=0;256>c;c++)a[c]=128>c?c<<1:c<<1^283;for(var e=0,j=0,c=0;256>c;c++){var k=j^j<<1^j<<2^j<<3^j<<4,k=k>>>8^k&255^99;l[e]=k;s[k]=e;var z=a[e],F=a[z],G=a[F],y=257*a[k]^16843008*k;t[e]=y<<24|y>>>8;r[e]=y<<16|y>>>16;w[e]=y<<8|y>>>24;v[e]=y;y=16843009*G^65537*F^257*z^16843008*e;b[k]=y<<24|y>>>8;x[k]=y<<16|y>>>16;q[k]=y<<8|y>>>24;n[k]=y;e?(e=z^a[a[a[G^z]]],j^=a[a[j]]):e=j=1}var H=[0,1,2,4,8,
16,32,64,128,27,54],d=d.AES=p.extend({_doReset:function(){for(var a=this._key,c=a.words,d=a.sigBytes/4,a=4*((this._nRounds=d+6)+1),e=this._keySchedule=[],j=0;j<a;j++)if(j<d)e[j]=c[j];else{var k=e[j-1];j%d?6<d&&4==j%d&&(k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255]):(k=k<<8|k>>>24,k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255],k^=H[j/d|0]<<24);e[j]=e[j-d]^k}c=this._invKeySchedule=[];for(d=0;d<a;d++)j=a-d,k=d%4?e[j]:e[j-4],c[d]=4>d||4>=j?k:b[l[k>>>24]]^x[l[k>>>16&255]]^q[l[k>>>
8&255]]^n[l[k&255]]},encryptBlock:function(a,b){this._doCryptBlock(a,b,this._keySchedule,t,r,w,v,l)},decryptBlock:function(a,c){var d=a[c+1];a[c+1]=a[c+3];a[c+3]=d;this._doCryptBlock(a,c,this._invKeySchedule,b,x,q,n,s);d=a[c+1];a[c+1]=a[c+3];a[c+3]=d},_doCryptBlock:function(a,b,c,d,e,j,l,f){for(var m=this._nRounds,g=a[b]^c[0],h=a[b+1]^c[1],k=a[b+2]^c[2],n=a[b+3]^c[3],p=4,r=1;r<m;r++)var q=d[g>>>24]^e[h>>>16&255]^j[k>>>8&255]^l[n&255]^c[p++],s=d[h>>>24]^e[k>>>16&255]^j[n>>>8&255]^l[g&255]^c[p++],t=
d[k>>>24]^e[n>>>16&255]^j[g>>>8&255]^l[h&255]^c[p++],n=d[n>>>24]^e[g>>>16&255]^j[h>>>8&255]^l[k&255]^c[p++],g=q,h=s,k=t;q=(f[g>>>24]<<24|f[h>>>16&255]<<16|f[k>>>8&255]<<8|f[n&255])^c[p++];s=(f[h>>>24]<<24|f[k>>>16&255]<<16|f[n>>>8&255]<<8|f[g&255])^c[p++];t=(f[k>>>24]<<24|f[n>>>16&255]<<16|f[g>>>8&255]<<8|f[h&255])^c[p++];n=(f[n>>>24]<<24|f[g>>>16&255]<<16|f[h>>>8&255]<<8|f[k&255])^c[p++];a[b]=q;a[b+1]=s;a[b+2]=t;a[b+3]=n},keySize:8});u.AES=p._createHelper(d)})();

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},t=f.lib={},g=function(){},j=t.Base={extend:function(a){g.prototype=this;var c=new g;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=t.WordArray=j.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||u).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=j.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new q.init(c,a)}}),v=f.enc={},u=v.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new q.init(d,c/2)}},k=v.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new q.init(d,c)}},l=v.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},
x=t.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=l.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var m=0;m<a;m+=e)this._doProcessBlock(d,m);m=d.splice(0,a);c.sigBytes-=b}return new q.init(m,b)},clone:function(){var a=j.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});t.Hasher=x.extend({cfg:j.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){x.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new w.HMAC.init(a,
d)).finalize(c)}}});var w=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,t=f.WordArray,g=f.Hasher,f=s.algo,j=[],q=[],v=function(a){return 4294967296*(a-(a|0))|0},u=2,k=0;64>k;){var l;a:{l=u;for(var x=h.sqrt(l),w=2;w<=x;w++)if(!(l%w)){l=!1;break a}l=!0}l&&(8>k&&(j[k]=v(h.pow(u,0.5))),q[k]=v(h.pow(u,1/3)),k++);u++}var a=[],f=f.SHA256=g.extend({_doReset:function(){this._hash=new t.init(j.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],m=b[2],h=b[3],p=b[4],j=b[5],k=b[6],l=b[7],n=0;64>n;n++){if(16>n)a[n]=
c[d+n]|0;else{var r=a[n-15],g=a[n-2];a[n]=((r<<25|r>>>7)^(r<<14|r>>>18)^r>>>3)+a[n-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+a[n-16]}r=l+((p<<26|p>>>6)^(p<<21|p>>>11)^(p<<7|p>>>25))+(p&j^~p&k)+q[n]+a[n];g=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&m^f&m);l=k;k=j;j=p;p=h+r|0;h=m;m=f;f=e;e=r+g|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+m|0;b[3]=b[3]+h|0;b[4]=b[4]+p|0;b[5]=b[5]+j|0;b[6]=b[6]+k|0;b[7]=b[7]+l|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=g.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=g._createHelper(f);s.HmacSHA256=g._createHmacHelper(f)})(Math);

(function(axlsign) {
'use strict';

// Curve25519 signatures (and also key agreement)
// like in the early Axolotl.
//
// Written by Dmitry Chestnykh.
// You can use it under MIT or CC0 license.

// Curve25519 signatures idea and math by Trevor Perrin
// https://moderncrypto.org/mail-archive/curves/2014/000205.html

// Derived from TweetNaCl.js (https://tweetnacl.js.org/)
// Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
//
// Implementation derived from TweetNaCl version 20140427.
// See for details: http://tweetnacl.cr.yp.to/

var gf = function(init) {
  var i, r = new Float64Array(16);
  if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
  return r;
};

var _0 = new Uint8Array(16);
var _9 = new Uint8Array(32); _9[0] = 9;

var gf0 = gf(),
    gf1 = gf([1]),
    _121665 = gf([0xdb41, 1]),
    D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
    D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
    X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
    Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
    I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

function ts64(x, i, h, l) {
  x[i]   = (h >> 24) & 0xff;
  x[i+1] = (h >> 16) & 0xff;
  x[i+2] = (h >>  8) & 0xff;
  x[i+3] = h & 0xff;
  x[i+4] = (l >> 24)  & 0xff;
  x[i+5] = (l >> 16)  & 0xff;
  x[i+6] = (l >>  8)  & 0xff;
  x[i+7] = l & 0xff;
}

function vn(x, xi, y, yi, n) {
  var i,d = 0;
  for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
  return (1 & ((d - 1) >>> 8)) - 1;
}

function crypto_verify_32(x, xi, y, yi) {
  return vn(x,xi,y,yi,32);
}

function set25519(r, a) {
  var i;
  for (i = 0; i < 16; i++) r[i] = a[i]|0;
}

function car25519(o) {
  var i, v, c = 1;
  for (i = 0; i < 16; i++) {
    v = o[i] + c + 65535;
    c = Math.floor(v / 65536);
    o[i] = v - c * 65536;
  }
  o[0] += c-1 + 37 * (c-1);
}

function sel25519(p, q, b) {
  var t, c = ~(b-1);
  for (var i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i]);
    p[i] ^= t;
    q[i] ^= t;
  }
}

function pack25519(o, n) {
  var i, j, b;
  var m = gf(), t = gf();
  for (i = 0; i < 16; i++) t[i] = n[i];
  car25519(t);
  car25519(t);
  car25519(t);
  for (j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed;
    for (i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
      m[i-1] &= 0xffff;
    }
    m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
    b = (m[15]>>16) & 1;
    m[14] &= 0xffff;
    sel25519(t, m, 1-b);
  }
  for (i = 0; i < 16; i++) {
    o[2*i] = t[i] & 0xff;
    o[2*i+1] = t[i]>>8;
  }
}

function neq25519(a, b) {
  var c = new Uint8Array(32), d = new Uint8Array(32);
  pack25519(c, a);
  pack25519(d, b);
  return crypto_verify_32(c, 0, d, 0);
}

function par25519(a) {
  var d = new Uint8Array(32);
  pack25519(d, a);
  return d[0] & 1;
}

function unpack25519(o, n) {
  var i;
  for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
  o[15] &= 0x7fff;
}

function A(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
}

function Z(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
}

function M(o, a, b) {
  var v, c,
     t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
     t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
    t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
    t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
    b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7],
    b8 = b[8],
    b9 = b[9],
    b10 = b[10],
    b11 = b[11],
    b12 = b[12],
    b13 = b[13],
    b14 = b[14],
    b15 = b[15];

  v = a[0];
  t0 += v * b0;
  t1 += v * b1;
  t2 += v * b2;
  t3 += v * b3;
  t4 += v * b4;
  t5 += v * b5;
  t6 += v * b6;
  t7 += v * b7;
  t8 += v * b8;
  t9 += v * b9;
  t10 += v * b10;
  t11 += v * b11;
  t12 += v * b12;
  t13 += v * b13;
  t14 += v * b14;
  t15 += v * b15;
  v = a[1];
  t1 += v * b0;
  t2 += v * b1;
  t3 += v * b2;
  t4 += v * b3;
  t5 += v * b4;
  t6 += v * b5;
  t7 += v * b6;
  t8 += v * b7;
  t9 += v * b8;
  t10 += v * b9;
  t11 += v * b10;
  t12 += v * b11;
  t13 += v * b12;
  t14 += v * b13;
  t15 += v * b14;
  t16 += v * b15;
  v = a[2];
  t2 += v * b0;
  t3 += v * b1;
  t4 += v * b2;
  t5 += v * b3;
  t6 += v * b4;
  t7 += v * b5;
  t8 += v * b6;
  t9 += v * b7;
  t10 += v * b8;
  t11 += v * b9;
  t12 += v * b10;
  t13 += v * b11;
  t14 += v * b12;
  t15 += v * b13;
  t16 += v * b14;
  t17 += v * b15;
  v = a[3];
  t3 += v * b0;
  t4 += v * b1;
  t5 += v * b2;
  t6 += v * b3;
  t7 += v * b4;
  t8 += v * b5;
  t9 += v * b6;
  t10 += v * b7;
  t11 += v * b8;
  t12 += v * b9;
  t13 += v * b10;
  t14 += v * b11;
  t15 += v * b12;
  t16 += v * b13;
  t17 += v * b14;
  t18 += v * b15;
  v = a[4];
  t4 += v * b0;
  t5 += v * b1;
  t6 += v * b2;
  t7 += v * b3;
  t8 += v * b4;
  t9 += v * b5;
  t10 += v * b6;
  t11 += v * b7;
  t12 += v * b8;
  t13 += v * b9;
  t14 += v * b10;
  t15 += v * b11;
  t16 += v * b12;
  t17 += v * b13;
  t18 += v * b14;
  t19 += v * b15;
  v = a[5];
  t5 += v * b0;
  t6 += v * b1;
  t7 += v * b2;
  t8 += v * b3;
  t9 += v * b4;
  t10 += v * b5;
  t11 += v * b6;
  t12 += v * b7;
  t13 += v * b8;
  t14 += v * b9;
  t15 += v * b10;
  t16 += v * b11;
  t17 += v * b12;
  t18 += v * b13;
  t19 += v * b14;
  t20 += v * b15;
  v = a[6];
  t6 += v * b0;
  t7 += v * b1;
  t8 += v * b2;
  t9 += v * b3;
  t10 += v * b4;
  t11 += v * b5;
  t12 += v * b6;
  t13 += v * b7;
  t14 += v * b8;
  t15 += v * b9;
  t16 += v * b10;
  t17 += v * b11;
  t18 += v * b12;
  t19 += v * b13;
  t20 += v * b14;
  t21 += v * b15;
  v = a[7];
  t7 += v * b0;
  t8 += v * b1;
  t9 += v * b2;
  t10 += v * b3;
  t11 += v * b4;
  t12 += v * b5;
  t13 += v * b6;
  t14 += v * b7;
  t15 += v * b8;
  t16 += v * b9;
  t17 += v * b10;
  t18 += v * b11;
  t19 += v * b12;
  t20 += v * b13;
  t21 += v * b14;
  t22 += v * b15;
  v = a[8];
  t8 += v * b0;
  t9 += v * b1;
  t10 += v * b2;
  t11 += v * b3;
  t12 += v * b4;
  t13 += v * b5;
  t14 += v * b6;
  t15 += v * b7;
  t16 += v * b8;
  t17 += v * b9;
  t18 += v * b10;
  t19 += v * b11;
  t20 += v * b12;
  t21 += v * b13;
  t22 += v * b14;
  t23 += v * b15;
  v = a[9];
  t9 += v * b0;
  t10 += v * b1;
  t11 += v * b2;
  t12 += v * b3;
  t13 += v * b4;
  t14 += v * b5;
  t15 += v * b6;
  t16 += v * b7;
  t17 += v * b8;
  t18 += v * b9;
  t19 += v * b10;
  t20 += v * b11;
  t21 += v * b12;
  t22 += v * b13;
  t23 += v * b14;
  t24 += v * b15;
  v = a[10];
  t10 += v * b0;
  t11 += v * b1;
  t12 += v * b2;
  t13 += v * b3;
  t14 += v * b4;
  t15 += v * b5;
  t16 += v * b6;
  t17 += v * b7;
  t18 += v * b8;
  t19 += v * b9;
  t20 += v * b10;
  t21 += v * b11;
  t22 += v * b12;
  t23 += v * b13;
  t24 += v * b14;
  t25 += v * b15;
  v = a[11];
  t11 += v * b0;
  t12 += v * b1;
  t13 += v * b2;
  t14 += v * b3;
  t15 += v * b4;
  t16 += v * b5;
  t17 += v * b6;
  t18 += v * b7;
  t19 += v * b8;
  t20 += v * b9;
  t21 += v * b10;
  t22 += v * b11;
  t23 += v * b12;
  t24 += v * b13;
  t25 += v * b14;
  t26 += v * b15;
  v = a[12];
  t12 += v * b0;
  t13 += v * b1;
  t14 += v * b2;
  t15 += v * b3;
  t16 += v * b4;
  t17 += v * b5;
  t18 += v * b6;
  t19 += v * b7;
  t20 += v * b8;
  t21 += v * b9;
  t22 += v * b10;
  t23 += v * b11;
  t24 += v * b12;
  t25 += v * b13;
  t26 += v * b14;
  t27 += v * b15;
  v = a[13];
  t13 += v * b0;
  t14 += v * b1;
  t15 += v * b2;
  t16 += v * b3;
  t17 += v * b4;
  t18 += v * b5;
  t19 += v * b6;
  t20 += v * b7;
  t21 += v * b8;
  t22 += v * b9;
  t23 += v * b10;
  t24 += v * b11;
  t25 += v * b12;
  t26 += v * b13;
  t27 += v * b14;
  t28 += v * b15;
  v = a[14];
  t14 += v * b0;
  t15 += v * b1;
  t16 += v * b2;
  t17 += v * b3;
  t18 += v * b4;
  t19 += v * b5;
  t20 += v * b6;
  t21 += v * b7;
  t22 += v * b8;
  t23 += v * b9;
  t24 += v * b10;
  t25 += v * b11;
  t26 += v * b12;
  t27 += v * b13;
  t28 += v * b14;
  t29 += v * b15;
  v = a[15];
  t15 += v * b0;
  t16 += v * b1;
  t17 += v * b2;
  t18 += v * b3;
  t19 += v * b4;
  t20 += v * b5;
  t21 += v * b6;
  t22 += v * b7;
  t23 += v * b8;
  t24 += v * b9;
  t25 += v * b10;
  t26 += v * b11;
  t27 += v * b12;
  t28 += v * b13;
  t29 += v * b14;
  t30 += v * b15;

  t0  += 38 * t16;
  t1  += 38 * t17;
  t2  += 38 * t18;
  t3  += 38 * t19;
  t4  += 38 * t20;
  t5  += 38 * t21;
  t6  += 38 * t22;
  t7  += 38 * t23;
  t8  += 38 * t24;
  t9  += 38 * t25;
  t10 += 38 * t26;
  t11 += 38 * t27;
  t12 += 38 * t28;
  t13 += 38 * t29;
  t14 += 38 * t30;
  // t15 left as is

  // first car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  // second car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  o[ 0] = t0;
  o[ 1] = t1;
  o[ 2] = t2;
  o[ 3] = t3;
  o[ 4] = t4;
  o[ 5] = t5;
  o[ 6] = t6;
  o[ 7] = t7;
  o[ 8] = t8;
  o[ 9] = t9;
  o[10] = t10;
  o[11] = t11;
  o[12] = t12;
  o[13] = t13;
  o[14] = t14;
  o[15] = t15;
}

function S(o, a) {
  M(o, a, a);
}

function inv25519(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 253; a >= 0; a--) {
    S(c, c);
    if(a !== 2 && a !== 4) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function pow2523(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 250; a >= 0; a--) {
      S(c, c);
      if(a !== 1) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function crypto_scalarmult(q, n, p) {
  var z = new Uint8Array(32);
  var x = new Float64Array(80), r, i;
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf();
  for (i = 0; i < 31; i++) z[i] = n[i];
  z[31]=(n[31]&127)|64;
  z[0]&=248;
  unpack25519(x,p);
  for (i = 0; i < 16; i++) {
    b[i]=x[i];
    d[i]=a[i]=c[i]=0;
  }
  a[0]=d[0]=1;
  for (i=254; i>=0; --i) {
    r=(z[i>>>3]>>>(i&7))&1;
    sel25519(a,b,r);
    sel25519(c,d,r);
    A(e,a,c);
    Z(a,a,c);
    A(c,b,d);
    Z(b,b,d);
    S(d,e);
    S(f,a);
    M(a,c,a);
    M(c,b,e);
    A(e,a,c);
    Z(a,a,c);
    S(b,a);
    Z(c,d,f);
    M(a,c,_121665);
    A(a,a,d);
    M(c,c,a);
    M(a,d,f);
    M(d,b,x);
    S(b,e);
    sel25519(a,b,r);
    sel25519(c,d,r);
  }
  for (i = 0; i < 16; i++) {
    x[i+16]=a[i];
    x[i+32]=c[i];
    x[i+48]=b[i];
    x[i+64]=d[i];
  }
  var x32 = x.subarray(32);
  var x16 = x.subarray(16);
  inv25519(x32,x32);
  M(x16,x16,x32);
  pack25519(q,x16);
  return 0;
}

function crypto_scalarmult_base(q, n) {
  return crypto_scalarmult(q, n, _9);
}

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

function crypto_hashblocks_hl(hh, hl, m, n) {
  var wh = new Int32Array(16), wl = new Int32Array(16),
      bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
      bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
      th, tl, i, j, h, l, a, b, c, d;

  var ah0 = hh[0],
      ah1 = hh[1],
      ah2 = hh[2],
      ah3 = hh[3],
      ah4 = hh[4],
      ah5 = hh[5],
      ah6 = hh[6],
      ah7 = hh[7],

      al0 = hl[0],
      al1 = hl[1],
      al2 = hl[2],
      al3 = hl[3],
      al4 = hl[4],
      al5 = hl[5],
      al6 = hl[6],
      al7 = hl[7];

  var pos = 0;
  while (n >= 128) {
    for (i = 0; i < 16; i++) {
      j = 8 * i + pos;
      wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
      wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
    }
    for (i = 0; i < 80; i++) {
      bh0 = ah0;
      bh1 = ah1;
      bh2 = ah2;
      bh3 = ah3;
      bh4 = ah4;
      bh5 = ah5;
      bh6 = ah6;
      bh7 = ah7;

      bl0 = al0;
      bl1 = al1;
      bl2 = al2;
      bl3 = al3;
      bl4 = al4;
      bl5 = al5;
      bl6 = al6;
      bl7 = al7;

      // add
      h = ah7;
      l = al7;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma1
      h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
      l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Ch
      h = (ah4 & ah5) ^ (~ah4 & ah6);
      l = (al4 & al5) ^ (~al4 & al6);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // K
      h = K[i*2];
      l = K[i*2+1];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // w
      h = wh[i%16];
      l = wl[i%16];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      th = c & 0xffff | d << 16;
      tl = a & 0xffff | b << 16;

      // add
      h = th;
      l = tl;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma0
      h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
      l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Maj
      h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
      l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh7 = (c & 0xffff) | (d << 16);
      bl7 = (a & 0xffff) | (b << 16);

      // add
      h = bh3;
      l = bl3;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      h = th;
      l = tl;

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh3 = (c & 0xffff) | (d << 16);
      bl3 = (a & 0xffff) | (b << 16);

      ah1 = bh0;
      ah2 = bh1;
      ah3 = bh2;
      ah4 = bh3;
      ah5 = bh4;
      ah6 = bh5;
      ah7 = bh6;
      ah0 = bh7;

      al1 = bl0;
      al2 = bl1;
      al3 = bl2;
      al4 = bl3;
      al5 = bl4;
      al6 = bl5;
      al7 = bl6;
      al0 = bl7;

      if (i%16 === 15) {
        for (j = 0; j < 16; j++) {
          // add
          h = wh[j];
          l = wl[j];

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          h = wh[(j+9)%16];
          l = wl[(j+9)%16];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma0
          th = wh[(j+1)%16];
          tl = wl[(j+1)%16];
          h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
          l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma1
          th = wh[(j+14)%16];
          tl = wl[(j+14)%16];
          h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
          l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          wh[j] = (c & 0xffff) | (d << 16);
          wl[j] = (a & 0xffff) | (b << 16);
        }
      }
    }

    // add
    h = ah0;
    l = al0;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[0];
    l = hl[0];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[0] = ah0 = (c & 0xffff) | (d << 16);
    hl[0] = al0 = (a & 0xffff) | (b << 16);

    h = ah1;
    l = al1;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[1];
    l = hl[1];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[1] = ah1 = (c & 0xffff) | (d << 16);
    hl[1] = al1 = (a & 0xffff) | (b << 16);

    h = ah2;
    l = al2;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[2];
    l = hl[2];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[2] = ah2 = (c & 0xffff) | (d << 16);
    hl[2] = al2 = (a & 0xffff) | (b << 16);

    h = ah3;
    l = al3;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[3];
    l = hl[3];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[3] = ah3 = (c & 0xffff) | (d << 16);
    hl[3] = al3 = (a & 0xffff) | (b << 16);

    h = ah4;
    l = al4;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[4];
    l = hl[4];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[4] = ah4 = (c & 0xffff) | (d << 16);
    hl[4] = al4 = (a & 0xffff) | (b << 16);

    h = ah5;
    l = al5;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[5];
    l = hl[5];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[5] = ah5 = (c & 0xffff) | (d << 16);
    hl[5] = al5 = (a & 0xffff) | (b << 16);

    h = ah6;
    l = al6;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[6];
    l = hl[6];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[6] = ah6 = (c & 0xffff) | (d << 16);
    hl[6] = al6 = (a & 0xffff) | (b << 16);

    h = ah7;
    l = al7;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[7];
    l = hl[7];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[7] = ah7 = (c & 0xffff) | (d << 16);
    hl[7] = al7 = (a & 0xffff) | (b << 16);

    pos += 128;
    n -= 128;
  }

  return n;
}

function crypto_hash(out, m, n) {
  var hh = new Int32Array(8),
      hl = new Int32Array(8),
      x = new Uint8Array(256),
      i, b = n;

  hh[0] = 0x6a09e667;
  hh[1] = 0xbb67ae85;
  hh[2] = 0x3c6ef372;
  hh[3] = 0xa54ff53a;
  hh[4] = 0x510e527f;
  hh[5] = 0x9b05688c;
  hh[6] = 0x1f83d9ab;
  hh[7] = 0x5be0cd19;

  hl[0] = 0xf3bcc908;
  hl[1] = 0x84caa73b;
  hl[2] = 0xfe94f82b;
  hl[3] = 0x5f1d36f1;
  hl[4] = 0xade682d1;
  hl[5] = 0x2b3e6c1f;
  hl[6] = 0xfb41bd6b;
  hl[7] = 0x137e2179;

  crypto_hashblocks_hl(hh, hl, m, n);
  n %= 128;

  for (i = 0; i < n; i++) x[i] = m[b-n+i];
  x[n] = 128;

  n = 256-128*(n<112?1:0);
  x[n-9] = 0;
  ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
  crypto_hashblocks_hl(hh, hl, x, n);

  for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);

  return 0;
}

function add(p, q) {
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf(),
      g = gf(), h = gf(), t = gf();

  Z(a, p[1], p[0]);
  Z(t, q[1], q[0]);
  M(a, a, t);
  A(b, p[0], p[1]);
  A(t, q[0], q[1]);
  M(b, b, t);
  M(c, p[3], q[3]);
  M(c, c, D2);
  M(d, p[2], q[2]);
  A(d, d, d);
  Z(e, b, a);
  Z(f, d, c);
  A(g, d, c);
  A(h, b, a);

  M(p[0], e, f);
  M(p[1], h, g);
  M(p[2], g, f);
  M(p[3], e, h);
}

function cswap(p, q, b) {
  var i;
  for (i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b);
  }
}

function pack(r, p) {
  var tx = gf(), ty = gf(), zi = gf();
  inv25519(zi, p[2]);
  M(tx, p[0], zi);
  M(ty, p[1], zi);
  pack25519(r, ty);
  r[31] ^= par25519(tx) << 7;
}

function scalarmult(p, q, s) {
  var b, i;
  set25519(p[0], gf0);
  set25519(p[1], gf1);
  set25519(p[2], gf1);
  set25519(p[3], gf0);
  for (i = 255; i >= 0; --i) {
    b = (s[(i/8)|0] >> (i&7)) & 1;
    cswap(p, q, b);
    add(q, p);
    add(p, p);
    cswap(p, q, b);
  }
}

function scalarbase(p, s) {
  var q = [gf(), gf(), gf(), gf()];
  set25519(q[0], X);
  set25519(q[1], Y);
  set25519(q[2], gf1);
  M(q[3], X, Y);
  scalarmult(p, q, s);
}

var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

function modL(r, x) {
  var carry, i, j, k;
  for (i = 63; i >= 32; --i) {
    carry = 0;
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)];
      carry = (x[j] + 128) >> 8;
      x[j] -= carry * 256;
    }
    x[j] += carry;
    x[i] = 0;
  }
  carry = 0;
  for (j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j];
    carry = x[j] >> 8;
    x[j] &= 255;
  }
  for (j = 0; j < 32; j++) x[j] -= carry * L[j];
  for (i = 0; i < 32; i++) {
    x[i+1] += x[i] >> 8;
    r[i] = x[i] & 255;
  }
}

function reduce(r) {
  var x = new Float64Array(64), i;
  for (i = 0; i < 64; i++) x[i] = r[i];
  for (i = 0; i < 64; i++) r[i] = 0;
  modL(r, x);
}

// Like crypto_sign, but uses secret key directly in hash.
function crypto_sign_direct(sm, m, n, sk) {
  var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
  var i, j, x = new Float64Array(64);
  var p = [gf(), gf(), gf(), gf()];

  for (i = 0; i < n; i++) sm[64 + i] = m[i];
  for (i = 0; i < 32; i++) sm[32 + i] = sk[i];

  crypto_hash(r, sm.subarray(32), n+32);
  reduce(r);
  scalarbase(p, r);
  pack(sm, p);

  for (i = 0; i < 32; i++) sm[i + 32] = sk[32 + i];
  crypto_hash(h, sm, n + 64);
  reduce(h);

  for (i = 0; i < 64; i++) x[i] = 0;
  for (i = 0; i < 32; i++) x[i] = r[i];
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i+j] += h[i] * sk[j];
    }
  }

  modL(sm.subarray(32), x);
  return n + 64;
}

// Note: sm must be n+128.
function crypto_sign_direct_rnd(sm, m, n, sk, rnd) {
  var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
  var i, j, x = new Float64Array(64);
  var p = [gf(), gf(), gf(), gf()];

  // Hash separation.
  sm[0] = 0xfe;
  for (i = 1; i < 32; i++) sm[i] = 0xff;

  // Secret key.
  for (i = 0; i < 32; i++) sm[32 + i] = sk[i];

  // Message.
  for (i = 0; i < n; i++) sm[64 + i] = m[i];

  // Random suffix.
  for (i = 0; i < 64; i++) sm[n + 64 + i] = rnd[i];

  crypto_hash(r, sm, n+128);
  reduce(r);
  scalarbase(p, r);
  pack(sm, p);

  for (i = 0; i < 32; i++) sm[i + 32] = sk[32 + i];
  crypto_hash(h, sm, n + 64);
  reduce(h);

  // Wipe out random suffix.
  for (i = 0; i < 64; i++) sm[n + 64 + i] = 0;

  for (i = 0; i < 64; i++) x[i] = 0;
  for (i = 0; i < 32; i++) x[i] = r[i];
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i+j] += h[i] * sk[j];
    }
  }

  modL(sm.subarray(32, n + 64), x);

  return n + 64;
}


function curve25519_sign(sm, m, n, sk, opt_rnd) {
  // If opt_rnd is provided, sm must have n + 128,
  // otherwise it must have n + 64 bytes.

  // Convert Curve25519 secret key into Ed25519 secret key (includes pub key).
  var edsk = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()];

  for (var i = 0; i < 32; i++) edsk[i] = sk[i];
  // Ensure private key is in the correct format.
  edsk[0] &= 248;
  edsk[31] &= 127;
  edsk[31] |= 64;

  scalarbase(p, edsk);
  pack(edsk.subarray(32), p);

  // Remember sign bit.
  var signBit = edsk[63] & 128;
  var smlen;

  if (opt_rnd) {
    smlen = crypto_sign_direct_rnd(sm, m, n, edsk, opt_rnd);
  } else {
    smlen = crypto_sign_direct(sm, m, n, edsk);
  }

  // Copy sign bit from public key into signature.
  sm[63] |= signBit;
  return smlen;
}

function unpackneg(r, p) {
  var t = gf(), chk = gf(), num = gf(),
      den = gf(), den2 = gf(), den4 = gf(),
      den6 = gf();

  set25519(r[2], gf1);
  unpack25519(r[1], p);
  S(num, r[1]);
  M(den, num, D);
  Z(num, num, r[2]);
  A(den, r[2], den);

  S(den2, den);
  S(den4, den2);
  M(den6, den4, den2);
  M(t, den6, num);
  M(t, t, den);

  pow2523(t, t);
  M(t, t, num);
  M(t, t, den);
  M(t, t, den);
  M(r[0], t, den);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) M(r[0], r[0], I);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) return -1;

  if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);

  M(r[3], r[0], r[1]);
  return 0;
}

function crypto_sign_open(m, sm, n, pk) {
  var i, mlen;
  var t = new Uint8Array(32), h = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()],
      q = [gf(), gf(), gf(), gf()];

  mlen = -1;
  if (n < 64) return -1;

  if (unpackneg(q, pk)) return -1;

  for (i = 0; i < n; i++) m[i] = sm[i];
  for (i = 0; i < 32; i++) m[i+32] = pk[i];
  crypto_hash(h, m, n);
  reduce(h);
  scalarmult(p, q, h);

  scalarbase(q, sm.subarray(32));
  add(p, q);
  pack(t, p);

  n -= 64;
  if (crypto_verify_32(sm, 0, t, 0)) {
    for (i = 0; i < n; i++) m[i] = 0;
    return -1;
  }

  for (i = 0; i < n; i++) m[i] = sm[i + 64];
  mlen = n;
  return mlen;
}

// Converts Curve25519 public key back to Ed25519 public key.
// edwardsY = (montgomeryX - 1) / (montgomeryX + 1)
function convertPublicKey(pk) {
  var z = new Uint8Array(32),
      x = gf(), a = gf(), b = gf();

  unpack25519(x, pk);

  A(a, x, gf1);
  Z(b, x, gf1);
  inv25519(a, a);
  M(a, a, b);

  pack25519(z, a);
  return z;
}

function curve25519_sign_open(m, sm, n, pk) {
  // Convert Curve25519 public key into Ed25519 public key.
  var edpk = convertPublicKey(pk);

  // Restore sign bit from signature.
  edpk[31] |= sm[63] & 128;

  // Remove sign bit from signature.
  sm[63] &= 127;

  // Verify signed message.
  return crypto_sign_open(m, sm, n, edpk);
}

/* High-level API */

function checkArrayTypes() {
  var t, i;
  for (i = 0; i < arguments.length; i++) {
     if ((t = Object.prototype.toString.call(arguments[i])) !== '[object Uint8Array]')
       throw new TypeError('unexpected type ' + t + ', use Uint8Array');
  }
}

axlsign.sharedKey = function(secretKey, publicKey) {
  checkArrayTypes(publicKey, secretKey);
  if (publicKey.length !== 32) throw new Error('wrong public key length');
  if (secretKey.length !== 32) throw new Error('wrong secret key length');
  var sharedKey = new Uint8Array(32);
  crypto_scalarmult(sharedKey, secretKey, publicKey);
  return sharedKey;
};

axlsign.signMessage = function(secretKey, msg, opt_random) {
  checkArrayTypes(msg, secretKey);
  if (secretKey.length !== 32) throw new Error('wrong secret key length');
  if (opt_random) {
    checkArrayTypes(opt_random)
    if (opt_random.length !== 64) throw new Error('wrong random data length');
    var buf = new Uint8Array(128 + msg.length);
    curve25519_sign(buf, msg, msg.length, secretKey, opt_random);
    return new Uint8Array(buf.subarray(0, 64 + msg.length));
  } else {
    var signedMsg = new Uint8Array(64 + msg.length);
    curve25519_sign(signedMsg, msg, msg.length, secretKey);
    return signedMsg;
  }
}

axlsign.openMessage = function(publicKey, signedMsg) {
  checkArrayTypes(signedMsg, publicKey);
  if (publicKey.length !== 32) throw new Error('wrong public key length');
  var tmp = new Uint8Array(signedMsg.length);
  var mlen = curve25519_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
  if (mlen < 0) return null;
  var m = new Uint8Array(mlen);
  for (var i = 0; i < m.length; i++) m[i] = tmp[i];
  return m;
};

axlsign.sign = function(secretKey, msg, opt_random) {
  checkArrayTypes(secretKey, msg);
  if (secretKey.length !== 32) throw new Error('wrong secret key length');
  if (opt_random) {
    checkArrayTypes(opt_random);
    if (opt_random.length !== 64) throw new Error('wrong random data length');
  }
  var buf = new Uint8Array((opt_random ? 128 : 64) + msg.length);
  curve25519_sign(buf, msg, msg.length, secretKey, opt_random);
  var signature = new Uint8Array(64);
  for (var i = 0; i < signature.length; i++) signature[i] = buf[i];
  return signature;
};

axlsign.verify = function(publicKey, msg, signature) {
  checkArrayTypes(msg, signature, publicKey);
  if (signature.length !== 64) throw new Error('wrong signature length');
  if (publicKey.length !== 32) throw new Error('wrong public key length');
  var sm = new Uint8Array(64 + msg.length);
  var m = new Uint8Array(64 + msg.length);
  var i;
  for (i = 0; i < 64; i++) sm[i] = signature[i];
  for (i = 0; i < msg.length; i++) sm[i+64] = msg[i];
  return (curve25519_sign_open(m, sm, sm.length, publicKey) >= 0);
};

axlsign.generateKeyPair = function(seed) {
  checkArrayTypes(seed);
  if (seed.length !== 32) throw new Error('wrong seed length');
  var sk = new Uint8Array(32);
  var pk = new Uint8Array(32);

  for (var i = 0; i < 32; i++) sk[i] = seed[i];

  crypto_scalarmult_base(pk, sk);

  // Turn secret key into the correct format.
  sk[0] &= 248;
  sk[31] &= 127;
  sk[31] |= 64;

  // Remove sign bit from public key.
  pk[31] &= 127;

  return {
    public: pk,
    private: sk
  };
};

})(typeof module !== 'undefined' && module.exports ? module.exports : (self.axlsign = self.axlsign || {}));

/*!
 * clipboard.js v1.5.16
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT Â© Zeno Rocha
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Clipboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (Element && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (element.matches(selector)) return element;
        element = element.parentNode;
    }
}

module.exports = closest;

},{}],2:[function(require,module,exports){
var closest = require('./closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"./closest":1}],3:[function(require,module,exports){
/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};

},{}],4:[function(require,module,exports){
var is = require('./is');
var delegate = require('delegate');

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;

},{"./is":3,"delegate":2}],5:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        element.focus();
        element.setSelectionRange(0, element.value.length);

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;

},{}],6:[function(require,module,exports){
function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],7:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'select'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = document.body.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.addEventListener('focus', window.scrollTo(0, yPosition));
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                document.body.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    document.body.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    document.body.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.target) {
                    this.target.blur();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});

},{"select":5}],8:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});

},{"./clipboard-action":7,"good-listener":4,"tiny-emitter":6}]},{},[8])(8)
});
/*! ngclipboard - v1.1.3 - 2016-12-26
* https://github.com/beregovoy68/ngclipboard
* Copyright (c) 2016 Sachin; Licensed MIT */
(function() {
    'use strict';
    var MODULE_NAME = 'ngclipboard';
    var angular, Clipboard;

    // Check for CommonJS support
    if (typeof module === 'object' && module.exports) {
      angular = require('angular');
      Clipboard = require('clipboard');
      module.exports = MODULE_NAME;
    } else {
      angular = window.angular;
      Clipboard = window.Clipboard;
    }

    angular.module(MODULE_NAME, []).directive('ngclipboard', function() {
        return {
            restrict: 'A',
            scope: {
                ngclipboardSuccess: '&',
                ngclipboardError: '&',
                ngclipboardTextProvider: '&'
            },
            link: function(scope, element, attributes) {
                var options = {};
                if (attributes.ngclipboardTextProvider) {
                    options.text = function () {
                        return scope.ngclipboardTextProvider();
                    };
                }

                var clipboard = new Clipboard(element[0], options);

                clipboard.on('success', function(e) {
                  scope.$apply(function () {
                    scope.ngclipboardSuccess({
                      e: e
                    });
                  });
                });

                clipboard.on('error', function(e) {
                  scope.$apply(function () {
                    scope.ngclipboardError({
                      e: e
                    });
                  });
                });
            }
        };
    });
})();

/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */

;(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.NProgress = factory();
  }

})(this, function() {
  var NProgress = {};

  NProgress.version = '0.2.0';

  var Settings = NProgress.settings = {
    minimum: 0.08,
    easing: 'ease',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleRate: 0.02,
    trickleSpeed: 800,
    showSpinner: true,
    barSelector: '[role="bar"]',
    spinnerSelector: '[role="spinner"]',
    parent: 'body',
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
  };

  /**
   * Updates configuration.
   *
   *     NProgress.configure({
   *       minimum: 0.1
   *     });
   */
  NProgress.configure = function(options) {
    var key, value;
    for (key in options) {
      value = options[key];
      if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
    }

    return this;
  };

  /**
   * Last number.
   */

  NProgress.status = null;

  /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set = function(n) {
    var started = NProgress.isStarted();

    n = clamp(n, Settings.minimum, 1);
    NProgress.status = (n === 1 ? null : n);

    var progress = NProgress.render(!started),
        bar      = progress.querySelector(Settings.barSelector),
        speed    = Settings.speed,
        ease     = Settings.easing;

    progress.offsetWidth; /* Repaint */

    queue(function(next) {
      // Set positionUsing if it hasn't already been set
      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

      // Add transition
      css(bar, barPositionCSS(n, speed, ease));

      if (n === 1) {
        // Fade out
        css(progress, {
          transition: 'none',
          opacity: 1
        });
        progress.offsetWidth; /* Repaint */

        setTimeout(function() {
          css(progress, {
            transition: 'all ' + speed + 'ms linear',
            opacity: 0
          });
          setTimeout(function() {
            NProgress.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  };

  NProgress.isStarted = function() {
    return typeof NProgress.status === 'number';
  };

  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {
    if (!NProgress.status) NProgress.set(0);

    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return;
        NProgress.trickle();
        work();
      }, Settings.trickleSpeed);
    };

    if (Settings.trickle) work();

    return this;
  };

  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   *
   *     NProgress.done(true);
   */

  NProgress.done = function(force) {
    if (!force && !NProgress.status) return this;

    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };

  /**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;

    if (!n) {
      return NProgress.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return NProgress.set(n);
    }
  };

  NProgress.trickle = function() {
    return NProgress.inc(Math.random() * Settings.trickleRate);
  };

  /**
   * Waits for all supplied jQuery promises and
   * increases the progress as the promises resolve.
   *
   * @param $promise jQUery Promise
   */
  (function() {
    var initial = 0, current = 0;

    NProgress.promise = function($promise) {
      if (!$promise || $promise.state() === "resolved") {
        return this;
      }

      if (current === 0) {
        NProgress.start();
      }

      initial++;
      current++;

      $promise.always(function() {
        current--;
        if (current === 0) {
            initial = 0;
            NProgress.done();
        } else {
            NProgress.set((initial - current) / initial);
        }
      });

      return this;
    };

  })();

  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function(fromStart) {
    if (NProgress.isRendered()) return document.getElementById('nprogress');

    addClass(document.documentElement, 'nprogress-busy');

    var progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = Settings.template;

    var bar      = progress.querySelector(Settings.barSelector),
        perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
        parent   = document.querySelector(Settings.parent),
        spinner;

    css(bar, {
      transition: 'all 0 linear',
      transform: 'translate3d(' + perc + '%,0,0)'
    });

    if (!Settings.showSpinner) {
      spinner = progress.querySelector(Settings.spinnerSelector);
      spinner && removeElement(spinner);
    }

    if (parent != document.body) {
      addClass(parent, 'nprogress-custom-parent');
    }

    parent.appendChild(progress);
    return progress;
  };

  /**
   * Removes the element. Opposite of render().
   */

  NProgress.remove = function() {
    removeClass(document.documentElement, 'nprogress-busy');
    removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent');
    var progress = document.getElementById('nprogress');
    progress && removeElement(progress);
  };

  /**
   * Checks if the progress bar is rendered.
   */

  NProgress.isRendered = function() {
    return !!document.getElementById('nprogress');
  };

  /**
   * Determine which positioning CSS rule to use.
   */

  NProgress.getPositioningCSS = function() {
    // Sniff on document.body.style
    var bodyStyle = document.body.style;

    // Sniff prefixes
    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
                       ('MozTransform' in bodyStyle) ? 'Moz' :
                       ('msTransform' in bodyStyle) ? 'ms' :
                       ('OTransform' in bodyStyle) ? 'O' : '';

    if (vendorPrefix + 'Perspective' in bodyStyle) {
      // Modern browsers with 3D support, e.g. Webkit, IE10
      return 'translate3d';
    } else if (vendorPrefix + 'Transform' in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return 'translate';
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return 'margin';
    }
  };

  /**
   * Helpers
   */

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */

  function toBarPerc(n) {
    return (-1 + n) * 100;
  }


  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */

  function barPositionCSS(n, speed, ease) {
    var barCSS;

    if (Settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (Settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }

  /**
   * (Internal) Queues a function to be executed.
   */

  var queue = (function() {
    var pending = [];

    function next() {
      var fn = pending.shift();
      if (fn) {
        fn(next);
      }
    }

    return function(fn) {
      pending.push(fn);
      if (pending.length == 1) next();
    };
  })();

  /**
   * (Internal) Applies css properties to an element, similar to the jQuery
   * css method.
   *
   * While this helper does assist with vendor prefixed property names, it
   * does not perform any manipulation of values prior to setting styles.
   */

  var css = (function() {
    var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
        cssProps    = {};

    function camelCase(string) {
      return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
        return letter.toUpperCase();
      });
    }

    function getVendorProp(name) {
      var style = document.body.style;
      if (name in style) return name;

      var i = cssPrefixes.length,
          capName = name.charAt(0).toUpperCase() + name.slice(1),
          vendorName;
      while (i--) {
        vendorName = cssPrefixes[i] + capName;
        if (vendorName in style) return vendorName;
      }

      return name;
    }

    function getStyleProp(name) {
      name = camelCase(name);
      return cssProps[name] || (cssProps[name] = getVendorProp(name));
    }

    function applyCss(element, prop, value) {
      prop = getStyleProp(prop);
      element.style[prop] = value;
    }

    return function(element, properties) {
      var args = arguments,
          prop,
          value;

      if (args.length == 2) {
        for (prop in properties) {
          value = properties[prop];
          if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
        }
      } else {
        applyCss(element, args[1], args[2]);
      }
    }
  })();

  /**
   * (Internal) Determines if an element or space separated list of class names contains a class name.
   */

  function hasClass(element, name) {
    var list = typeof element == 'string' ? element : classList(element);
    return list.indexOf(' ' + name + ' ') >= 0;
  }

  /**
   * (Internal) Adds a class to an element.
   */

  function addClass(element, name) {
    var oldList = classList(element),
        newList = oldList + name;

    if (hasClass(oldList, name)) return;

    // Trim the opening space.
    element.className = newList.substring(1);
  }

  /**
   * (Internal) Removes a class from an element.
   */

  function removeClass(element, name) {
    var oldList = classList(element),
        newList;

    if (!hasClass(element, name)) return;

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }

  /**
   * (Internal) Gets a space separated list of the class names on the element.
   * The list is wrapped with a single space on each end to facilitate finding
   * matches within the list.
   */

  function classList(element) {
    return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  /**
   * (Internal) Removes an element from the DOM.
   */

  function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
  }

  return NProgress;
});


// Generated by CoffeeScript 1.10.0

/*
jQuery Growl
Copyright 2015 Kevin Sylvestre
1.3.2
 */

(function() {
  "use strict";
  var $, Animation, Growl,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  Animation = (function() {
    function Animation() {}

    Animation.transitions = {
      "webkitTransition": "webkitTransitionEnd",
      "mozTransition": "mozTransitionEnd",
      "oTransition": "oTransitionEnd",
      "transition": "transitionend"
    };

    Animation.transition = function($el) {
      var el, ref, result, type;
      el = $el[0];
      ref = this.transitions;
      for (type in ref) {
        result = ref[type];
        if (el.style[type] != null) {
          return result;
        }
      }
    };

    return Animation;

  })();

  Growl = (function() {
    Growl.settings = {
      namespace: 'growl',
      duration: 3200,
      close: "&#215;",
      location: "default",
      style: "default",
      size: "medium",
      delayOnHover: true
    };

    Growl.growl = function(settings) {
      if (settings == null) {
        settings = {};
      }
      this.initialize();
      return new Growl(settings);
    };

    Growl.initialize = function() {
      return $("body:not(:has(#growls))").append('<div id="growls" />');
    };

    function Growl(settings) {
      if (settings == null) {
        settings = {};
      }
      this.container = bind(this.container, this);
      this.content = bind(this.content, this);
      this.html = bind(this.html, this);
      this.$growl = bind(this.$growl, this);
      this.$growls = bind(this.$growls, this);
      this.animate = bind(this.animate, this);
      this.remove = bind(this.remove, this);
      this.dismiss = bind(this.dismiss, this);
      this.present = bind(this.present, this);
      this.waitAndDismiss = bind(this.waitAndDismiss, this);
      this.cycle = bind(this.cycle, this);
      this.close = bind(this.close, this);
      this.click = bind(this.click, this);
      this.mouseLeave = bind(this.mouseLeave, this);
      this.mouseEnter = bind(this.mouseEnter, this);
      this.unbind = bind(this.unbind, this);
      this.bind = bind(this.bind, this);
      this.render = bind(this.render, this);
      this.settings = $.extend({}, Growl.settings, settings);
      this.$growls().attr('class', this.settings.location);
      this.render();
    }

    Growl.prototype.render = function() {
      var $growl;
      $growl = this.$growl();
      this.$growls().append($growl);
      if (this.settings.fixed) {
        this.present();
      } else {
        this.cycle();
      }
    };

    Growl.prototype.bind = function($growl) {
      if ($growl == null) {
        $growl = this.$growl();
      }
      $growl.on("click", this.click);
      if (this.settings.delayOnHover) {
        $growl.on("mouseenter", this.mouseEnter);
        $growl.on("mouseleave", this.mouseLeave);
      }
      return $growl.on("contextmenu", this.close).find("." + this.settings.namespace + "-close").on("click", this.close);
    };

    Growl.prototype.unbind = function($growl) {
      if ($growl == null) {
        $growl = this.$growl();
      }
      $growl.off("click", this.click);
      if (this.settings.delayOnHover) {
        $growl.off("mouseenter", this.mouseEnter);
        $growl.off("mouseleave", this.mouseLeave);
      }
      return $growl.off("contextmenu", this.close).find("." + this.settings.namespace + "-close").off("click", this.close);
    };

    Growl.prototype.mouseEnter = function(event) {
      var $growl;
      $growl = this.$growl();
      return $growl.stop(true, true);
    };

    Growl.prototype.mouseLeave = function(event) {
      return this.waitAndDismiss();
    };

    Growl.prototype.click = function(event) {
      if (this.settings.url != null) {
        event.preventDefault();
        event.stopPropagation();
        return window.open(this.settings.url);
      }
    };

    Growl.prototype.close = function(event) {
      var $growl;
      event.preventDefault();
      event.stopPropagation();
      $growl = this.$growl();
      return $growl.stop().queue(this.dismiss).queue(this.remove);
    };

    Growl.prototype.cycle = function() {
      var $growl;
      $growl = this.$growl();
      return $growl.queue(this.present).queue(this.waitAndDismiss());
    };

    Growl.prototype.waitAndDismiss = function() {
      var $growl;
      $growl = this.$growl();
      return $growl.delay(this.settings.duration).queue(this.dismiss).queue(this.remove);
    };

    Growl.prototype.present = function(callback) {
      var $growl;
      $growl = this.$growl();
      this.bind($growl);
      return this.animate($growl, this.settings.namespace + "-incoming", 'out', callback);
    };

    Growl.prototype.dismiss = function(callback) {
      var $growl;
      $growl = this.$growl();
      this.unbind($growl);
      return this.animate($growl, this.settings.namespace + "-outgoing", 'in', callback);
    };

    Growl.prototype.remove = function(callback) {
      this.$growl().remove();
      return typeof callback === "function" ? callback() : void 0;
    };

    Growl.prototype.animate = function($element, name, direction, callback) {
      var transition;
      if (direction == null) {
        direction = 'in';
      }
      transition = Animation.transition($element);
      $element[direction === 'in' ? 'removeClass' : 'addClass'](name);
      $element.offset().position;
      $element[direction === 'in' ? 'addClass' : 'removeClass'](name);
      if (callback == null) {
        return;
      }
      if (transition != null) {
        $element.one(transition, callback);
      } else {
        callback();
      }
    };

    Growl.prototype.$growls = function() {
      return this.$_growls != null ? this.$_growls : this.$_growls = $('#growls');
    };

    Growl.prototype.$growl = function() {
      return this.$_growl != null ? this.$_growl : this.$_growl = $(this.html());
    };

    Growl.prototype.html = function() {
      return this.container(this.content());
    };

    Growl.prototype.content = function() {
      return "<div class='" + this.settings.namespace + "-close'>" + this.settings.close + "</div>\n<div class='" + this.settings.namespace + "-title'>" + this.settings.title + "</div>\n<div class='" + this.settings.namespace + "-message'>" + this.settings.message + "</div>";
    };

    Growl.prototype.container = function(content) {
      return "<div class='" + this.settings.namespace + " " + this.settings.namespace + "-" + this.settings.style + " " + this.settings.namespace + "-" + this.settings.size + "'>\n  " + content + "\n</div>";
    };

    return Growl;

  })();

  this.Growl = Growl;

  $.growl = function(options) {
    if (options == null) {
      options = {};
    }
    return Growl.growl(options);
  };

  $.growl.error = function(options) {
    var settings;
    if (options == null) {
      options = {};
    }
    settings = {
      title: "Error!",
      style: "error"
    };
    return $.growl($.extend(settings, options));
  };

  $.growl.notice = function(options) {
    var settings;
    if (options == null) {
      options = {};
    }
    settings = {
      title: "Notice!",
      style: "notice"
    };
    return $.growl($.extend(settings, options));
  };

  $.growl.warning = function(options) {
    var settings;
    if (options == null) {
      options = {};
    }
    settings = {
      title: "Warning!",
      style: "warning"
    };
    return $.growl($.extend(settings, options));
  };

}).call(this);

/*!
 * jQuery Validation Plugin v1.14.0
 *
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2015 JÃ¶rn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend($.fn, {
	// http://jqueryvalidation.org/validate/
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}

				// allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			});

			// validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden, result;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {
							// insert a hidden input as a replacement for the missing submit button
							hidden = $( "<input type='hidden'/>" )
								.attr( "name", validator.submitButton.name )
								.val( $( validator.submitButton ).val() )
								.appendTo( validator.currentForm );
						}
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				errorList = errorList.concat( validator.errorList );
			});
			validator.errorList = errorList;
		}
		return valid;
	},

	// http://jqueryvalidation.org/rules/
	rules: function( command, argument ) {
		var element = this[ 0 ],
			settings, staticRules, existingRules, data, param, filtered;

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );
				// remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
					if ( method === "required" ) {
						$( element ).removeAttr( "aria-required" );
					}
				});
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
			$( element ).attr( "aria-required", "true" );
		}

		// make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param });
		}

		return data;
	}
});

// Custom selectors
$.extend( $.expr[ ":" ], {
	// http://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !$.trim( "" + $( a ).val() );
	},
	// http://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		return !!$.trim( "" + $( a ).val() );
	},
	// http://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// http://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		});
	});
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {
			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element === this.lastElement ) {
				this.element( element );
			}
		},
		onclick: function( element ) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// http://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date ( ISO ).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),
		minlength: $.validator.format( "Please enter at least {0} characters." ),
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
		range: $.validator.format( "Please enter a value between {0} and {1}." ),
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),
		min: $.validator.format( "Please enter a value greater than or equal to {0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				});
			});
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			});

			function delegate( event ) {
				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox']", delegate)
				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on("click.validate", "select, option, [type='radio'], [type='checkbox']", delegate);

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}

			// Add aria-required to any Static/Data/Class required fields before first validation
			// Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
			$( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );
		},

		// http://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend({}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// http://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				result = true;

			this.lastElement = checkElement;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				result = this.check( checkElement ) !== false;
				if ( result ) {
					delete this.invalid[ checkElement.name ];
				} else {
					this.invalid[ checkElement.name ] = true;
				}
			}
			// Add aria-invalid status for screen readers
			$( element ).attr( "aria-invalid", !result );

			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[ name ],
						element: this.findByName( name )[ 0 ]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				});
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.submitted = {};
			this.lastElement = null;
			this.prepareForm();
			this.hideErrors();
			var i, elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
				}
			} else {
				elements.removeClass( this.settings.errorClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {
				count++;
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [])
					.filter( ":visible" )
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			}).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				if ( !this.name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ this.name ] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var val,
				$element = $( element ),
				type = element.type;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter(":checked").val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? false : $element.val();
			}

			val = $element.val();
			if ( typeof val === "string" ) {
				return val.replace(/\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				}).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule;

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {

					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}

					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, method ) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customDataMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[ method ],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}
			this.errorList.push({
				message: message,
				element: element,
				method: rule.method
			});

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map(function() {
				return this.element;
			});
		},

		showLabel: function( element, message ) {
			var place, group, errorID,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );
			if ( error.length ) {
				// refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
				// replace message on existing label
				error.html( message );
			} else {
				// create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement( place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {
					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );
				} else if ( error.parents( "label[for='" + elementID + "']" ).length === 0 ) {
					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby

					errorID = error.attr( "id" ).replace( /(:|\.|\[|\]|\$)/g, "\\$1");
					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + errorID + "\\b" ) ) ) {
						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						$.each( this.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + name + "']", this.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						});
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.idOrName( element ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// aria-describedby should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + describer.replace( /\s+/g, ", #" );
			}
			return this
				.errors()
				.filter( selector );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + name + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
				this.formSubmitted = false;
			}
		},

		previousValue: function( element ) {
			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		},

		// cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ]);
				}
			});
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// maxlength may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {
		// handle dependency check
		$.each( rules, function( prop, val ) {
			// ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[ prop ];
				}
			}
		});

		// evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) ? parameter( element ) : parameter;
		});

		// clean number parameters
		$.each([ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		});
		$.each([ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ]), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace(/[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ]), Number( parts[ 1 ] ) ];
				}
			}
		});

		if ( $.validator.autoCreateRanges ) {
			// auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	methods: {

		// http://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {
			// check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {
				// could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value.length > 0;
		},

		// http://jqueryvalidation.org/email-method/
		email: function( value, element ) {
			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// http://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// http://jqueryvalidation.org/date-method/
		date: function( value, element ) {
			return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
		},

		// http://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// http://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// http://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// http://jqueryvalidation.org/creditcard-method/
		// based on http://en.wikipedia.org/wiki/Luhn_algorithm
		creditcard: function( value, element ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}
			// accept only spaces, digits and dashes
			if ( /[^0-9 \-]+/.test( value ) ) {
				return false;
			}
			var nCheck = 0,
				nDigit = 0,
				bEven = false,
				n, cDigit;

			value = value.replace( /\D/g, "" );

			// Basing min and max length on
			// http://developer.ean.com/general_info/Valid_Credit_Card_Types
			if ( value.length < 13 || value.length > 19 ) {
				return false;
			}

			for ( n = value.length - 1; n >= 0; n--) {
				cDigit = value.charAt( n );
				nDigit = parseInt( cDigit, 10 );
				if ( bEven ) {
					if ( ( nDigit *= 2 ) > 9 ) {
						nDigit -= 9;
					}
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return ( nCheck % 10 ) === 0;
		},

		// http://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// http://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// http://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// http://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// http://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $( param );
			if ( this.settings.onfocusout ) {
				target.off( ".validate-equalTo" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				});
			}
			return value === target.val();
		},

		// http://jqueryvalidation.org/remote-method/
		remote: function( value, element, param ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			var previous = this.previousValue( element ),
				validator, data;

			if (!this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = this.settings.messages[ element.name ].remote;
			this.settings.messages[ element.name ].remote = previous.message;

			param = typeof param === "string" && { url: param } || param;

			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ].remote = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.prepareElement( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						delete validator.invalid[ element.name ];
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, "remote" );
						errors[ element.name ] = previous.message = $.isFunction( message ) ? message( value ) : message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

});

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;
// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter(function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			pendingRequests[port] = xhr;
		}
	});
} else {
	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			pendingRequests[port] = ajax.apply(this, arguments);
			return pendingRequests[port];
		}
		return ajax.apply(this, arguments);
	};
}

}));
/* Tooltipster v3.3.0 */;(function(e,t,n){function s(t,n){this.bodyOverflowX;this.callbacks={hide:[],show:[]};this.checkInterval=null;this.Content;this.$el=e(t);this.$elProxy;this.elProxyPosition;this.enabled=true;this.options=e.extend({},i,n);this.mouseIsOverProxy=false;this.namespace="tooltipster-"+Math.round(Math.random()*1e5);this.Status="hidden";this.timerHide=null;this.timerShow=null;this.$tooltip;this.options.iconTheme=this.options.iconTheme.replace(".","");this.options.theme=this.options.theme.replace(".","");this._init()}function o(t,n){var r=true;e.each(t,function(e,i){if(typeof n[e]==="undefined"||t[e]!==n[e]){r=false;return false}});return r}function f(){return!a&&u}function l(){var e=n.body||n.documentElement,t=e.style,r="transition";if(typeof t[r]=="string"){return true}v=["Moz","Webkit","Khtml","O","ms"],r=r.charAt(0).toUpperCase()+r.substr(1);for(var i=0;i<v.length;i++){if(typeof t[v[i]+r]=="string"){return true}}return false}var r="tooltipster",i={animation:"fade",arrow:true,arrowColor:"",autoClose:true,content:null,contentAsHTML:false,contentCloning:true,debug:true,delay:200,minWidth:0,maxWidth:null,functionInit:function(e,t){},functionBefore:function(e,t){t()},functionReady:function(e,t){},functionAfter:function(e){},hideOnClick:false,icon:"(?)",iconCloning:true,iconDesktop:false,iconTouch:false,iconTheme:"tooltipster-icon",interactive:false,interactiveTolerance:350,multiple:false,offsetX:0,offsetY:0,onlyOne:false,position:"top",positionTracker:false,positionTrackerCallback:function(e){if(this.option("trigger")=="hover"&&this.option("autoClose")){this.hide()}},restoration:"current",speed:350,timer:0,theme:"tooltipster-default",touchDevices:true,trigger:"hover",updateAnimation:true};s.prototype={_init:function(){var t=this;if(n.querySelector){var r=null;if(t.$el.data("tooltipster-initialTitle")===undefined){r=t.$el.attr("title");if(r===undefined)r=null;t.$el.data("tooltipster-initialTitle",r)}if(t.options.content!==null){t._content_set(t.options.content)}else{t._content_set(r)}var i=t.options.functionInit.call(t.$el,t.$el,t.Content);if(typeof i!=="undefined")t._content_set(i);t.$el.removeAttr("title").addClass("tooltipstered");if(!u&&t.options.iconDesktop||u&&t.options.iconTouch){if(typeof t.options.icon==="string"){t.$elProxy=e('<span class="'+t.options.iconTheme+'"></span>');t.$elProxy.text(t.options.icon)}else{if(t.options.iconCloning)t.$elProxy=t.options.icon.clone(true);else t.$elProxy=t.options.icon}t.$elProxy.insertAfter(t.$el)}else{t.$elProxy=t.$el}if(t.options.trigger=="hover"){t.$elProxy.on("mouseenter."+t.namespace,function(){if(!f()||t.options.touchDevices){t.mouseIsOverProxy=true;t._show()}}).on("mouseleave."+t.namespace,function(){if(!f()||t.options.touchDevices){t.mouseIsOverProxy=false}});if(u&&t.options.touchDevices){t.$elProxy.on("touchstart."+t.namespace,function(){t._showNow()})}}else if(t.options.trigger=="click"){t.$elProxy.on("click."+t.namespace,function(){if(!f()||t.options.touchDevices){t._show()}})}}},_show:function(){var e=this;if(e.Status!="shown"&&e.Status!="appearing"){if(e.options.delay){e.timerShow=setTimeout(function(){if(e.options.trigger=="click"||e.options.trigger=="hover"&&e.mouseIsOverProxy){e._showNow()}},e.options.delay)}else e._showNow()}},_showNow:function(n){var r=this;r.options.functionBefore.call(r.$el,r.$el,function(){if(r.enabled&&r.Content!==null){if(n)r.callbacks.show.push(n);r.callbacks.hide=[];clearTimeout(r.timerShow);r.timerShow=null;clearTimeout(r.timerHide);r.timerHide=null;if(r.options.onlyOne){e(".tooltipstered").not(r.$el).each(function(t,n){var r=e(n),i=r.data("tooltipster-ns");e.each(i,function(e,t){var n=r.data(t),i=n.status(),s=n.option("autoClose");if(i!=="hidden"&&i!=="disappearing"&&s){n.hide()}})})}var i=function(){r.Status="shown";e.each(r.callbacks.show,function(e,t){t.call(r.$el)});r.callbacks.show=[]};if(r.Status!=="hidden"){var s=0;if(r.Status==="disappearing"){r.Status="appearing";if(l()){r.$tooltip.clearQueue().removeClass("tooltipster-dying").addClass("tooltipster-"+r.options.animation+"-show");if(r.options.speed>0)r.$tooltip.delay(r.options.speed);r.$tooltip.queue(i)}else{r.$tooltip.stop().fadeIn(i)}}else if(r.Status==="shown"){i()}}else{r.Status="appearing";var s=r.options.speed;r.bodyOverflowX=e("body").css("overflow-x");e("body").css("overflow-x","hidden");var o="tooltipster-"+r.options.animation,a="-webkit-transition-duration: "+r.options.speed+"ms; -webkit-animation-duration: "+r.options.speed+"ms; -moz-transition-duration: "+r.options.speed+"ms; -moz-animation-duration: "+r.options.speed+"ms; -o-transition-duration: "+r.options.speed+"ms; -o-animation-duration: "+r.options.speed+"ms; -ms-transition-duration: "+r.options.speed+"ms; -ms-animation-duration: "+r.options.speed+"ms; transition-duration: "+r.options.speed+"ms; animation-duration: "+r.options.speed+"ms;",f=r.options.minWidth?"min-width:"+Math.round(r.options.minWidth)+"px;":"",c=r.options.maxWidth?"max-width:"+Math.round(r.options.maxWidth)+"px;":"",h=r.options.interactive?"pointer-events: auto;":"";r.$tooltip=e('<div class="tooltipster-base '+r.options.theme+'" style="'+f+" "+c+" "+h+" "+a+'"><div class="tooltipster-content"></div></div>');if(l())r.$tooltip.addClass(o);r._content_insert();r.$tooltip.appendTo("body");r.reposition();r.options.functionReady.call(r.$el,r.$el,r.$tooltip);if(l()){r.$tooltip.addClass(o+"-show");if(r.options.speed>0)r.$tooltip.delay(r.options.speed);r.$tooltip.queue(i)}else{r.$tooltip.css("display","none").fadeIn(r.options.speed,i)}r._interval_set();e(t).on("scroll."+r.namespace+" resize."+r.namespace,function(){r.reposition()});if(r.options.autoClose){e("body").off("."+r.namespace);if(r.options.trigger=="hover"){if(u){setTimeout(function(){e("body").on("touchstart."+r.namespace,function(){r.hide()})},0)}if(r.options.interactive){if(u){r.$tooltip.on("touchstart."+r.namespace,function(e){e.stopPropagation()})}var p=null;r.$elProxy.add(r.$tooltip).on("mouseleave."+r.namespace+"-autoClose",function(){clearTimeout(p);p=setTimeout(function(){r.hide()},r.options.interactiveTolerance)}).on("mouseenter."+r.namespace+"-autoClose",function(){clearTimeout(p)})}else{r.$elProxy.on("mouseleave."+r.namespace+"-autoClose",function(){r.hide()})}if(r.options.hideOnClick){r.$elProxy.on("click."+r.namespace+"-autoClose",function(){r.hide()})}}else if(r.options.trigger=="click"){setTimeout(function(){e("body").on("click."+r.namespace+" touchstart."+r.namespace,function(){r.hide()})},0);if(r.options.interactive){r.$tooltip.on("click."+r.namespace+" touchstart."+r.namespace,function(e){e.stopPropagation()})}}}}if(r.options.timer>0){r.timerHide=setTimeout(function(){r.timerHide=null;r.hide()},r.options.timer+s)}}})},_interval_set:function(){var t=this;t.checkInterval=setInterval(function(){if(e("body").find(t.$el).length===0||e("body").find(t.$elProxy).length===0||t.Status=="hidden"||e("body").find(t.$tooltip).length===0){if(t.Status=="shown"||t.Status=="appearing")t.hide();t._interval_cancel()}else{if(t.options.positionTracker){var n=t._repositionInfo(t.$elProxy),r=false;if(o(n.dimension,t.elProxyPosition.dimension)){if(t.$elProxy.css("position")==="fixed"){if(o(n.position,t.elProxyPosition.position))r=true}else{if(o(n.offset,t.elProxyPosition.offset))r=true}}if(!r){t.reposition();t.options.positionTrackerCallback.call(t,t.$el)}}}},200)},_interval_cancel:function(){clearInterval(this.checkInterval);this.checkInterval=null},_content_set:function(e){if(typeof e==="object"&&e!==null&&this.options.contentCloning){e=e.clone(true)}this.Content=e},_content_insert:function(){var e=this,t=this.$tooltip.find(".tooltipster-content");if(typeof e.Content==="string"&&!e.options.contentAsHTML){t.text(e.Content)}else{t.empty().append(e.Content)}},_update:function(e){var t=this;t._content_set(e);if(t.Content!==null){if(t.Status!=="hidden"){t._content_insert();t.reposition();if(t.options.updateAnimation){if(l()){t.$tooltip.css({width:"","-webkit-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-moz-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-o-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-ms-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms",transition:"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms"}).addClass("tooltipster-content-changing");setTimeout(function(){if(t.Status!="hidden"){t.$tooltip.removeClass("tooltipster-content-changing");setTimeout(function(){if(t.Status!=="hidden"){t.$tooltip.css({"-webkit-transition":t.options.speed+"ms","-moz-transition":t.options.speed+"ms","-o-transition":t.options.speed+"ms","-ms-transition":t.options.speed+"ms",transition:t.options.speed+"ms"})}},t.options.speed)}},t.options.speed)}else{t.$tooltip.fadeTo(t.options.speed,.5,function(){if(t.Status!="hidden"){t.$tooltip.fadeTo(t.options.speed,1)}})}}}}else{t.hide()}},_repositionInfo:function(e){return{dimension:{height:e.outerHeight(false),width:e.outerWidth(false)},offset:e.offset(),position:{left:parseInt(e.css("left")),top:parseInt(e.css("top"))}}},hide:function(n){var r=this;if(n)r.callbacks.hide.push(n);r.callbacks.show=[];clearTimeout(r.timerShow);r.timerShow=null;clearTimeout(r.timerHide);r.timerHide=null;var i=function(){e.each(r.callbacks.hide,function(e,t){t.call(r.$el)});r.callbacks.hide=[]};if(r.Status=="shown"||r.Status=="appearing"){r.Status="disappearing";var s=function(){r.Status="hidden";if(typeof r.Content=="object"&&r.Content!==null){r.Content.detach()}r.$tooltip.remove();r.$tooltip=null;e(t).off("."+r.namespace);e("body").off("."+r.namespace).css("overflow-x",r.bodyOverflowX);e("body").off("."+r.namespace);r.$elProxy.off("."+r.namespace+"-autoClose");r.options.functionAfter.call(r.$el,r.$el);i()};if(l()){r.$tooltip.clearQueue().removeClass("tooltipster-"+r.options.animation+"-show").addClass("tooltipster-dying");if(r.options.speed>0)r.$tooltip.delay(r.options.speed);r.$tooltip.queue(s)}else{r.$tooltip.stop().fadeOut(r.options.speed,s)}}else if(r.Status=="hidden"){i()}return r},show:function(e){this._showNow(e);return this},update:function(e){return this.content(e)},content:function(e){if(typeof e==="undefined"){return this.Content}else{this._update(e);return this}},reposition:function(){var n=this;if(e("body").find(n.$tooltip).length!==0){n.$tooltip.css("width","");n.elProxyPosition=n._repositionInfo(n.$elProxy);var r=null,i=e(t).width(),s=n.elProxyPosition,o=n.$tooltip.outerWidth(false),u=n.$tooltip.innerWidth()+1,a=n.$tooltip.outerHeight(false);if(n.$elProxy.is("area")){var f=n.$elProxy.attr("shape"),l=n.$elProxy.parent().attr("name"),c=e('img[usemap="#'+l+'"]'),h=c.offset().left,p=c.offset().top,d=n.$elProxy.attr("coords")!==undefined?n.$elProxy.attr("coords").split(","):undefined;if(f=="circle"){var v=parseInt(d[0]),m=parseInt(d[1]),g=parseInt(d[2]);s.dimension.height=g*2;s.dimension.width=g*2;s.offset.top=p+m-g;s.offset.left=h+v-g}else if(f=="rect"){var v=parseInt(d[0]),m=parseInt(d[1]),y=parseInt(d[2]),b=parseInt(d[3]);s.dimension.height=b-m;s.dimension.width=y-v;s.offset.top=p+m;s.offset.left=h+v}else if(f=="poly"){var w=[],E=[],S=0,x=0,T=0,N=0,C="even";for(var k=0;k<d.length;k++){var L=parseInt(d[k]);if(C=="even"){if(L>T){T=L;if(k===0){S=T}}if(L<S){S=L}C="odd"}else{if(L>N){N=L;if(k==1){x=N}}if(L<x){x=L}C="even"}}s.dimension.height=N-x;s.dimension.width=T-S;s.offset.top=p+x;s.offset.left=h+S}else{s.dimension.height=c.outerHeight(false);s.dimension.width=c.outerWidth(false);s.offset.top=p;s.offset.left=h}}var A=0,O=0,M=0,_=parseInt(n.options.offsetY),D=parseInt(n.options.offsetX),P=n.options.position;function H(){var n=e(t).scrollLeft();if(A-n<0){r=A-n;A=n}if(A+o-n>i){r=A-(i+n-o);A=i+n-o}}function B(n,r){if(s.offset.top-e(t).scrollTop()-a-_-12<0&&r.indexOf("top")>-1){P=n}if(s.offset.top+s.dimension.height+a+12+_>e(t).scrollTop()+e(t).height()&&r.indexOf("bottom")>-1){P=n;M=s.offset.top-a-_-12}}if(P=="top"){var j=s.offset.left+o-(s.offset.left+s.dimension.width);A=s.offset.left+D-j/2;M=s.offset.top-a-_-12;H();B("bottom","top")}if(P=="top-left"){A=s.offset.left+D;M=s.offset.top-a-_-12;H();B("bottom-left","top-left")}if(P=="top-right"){A=s.offset.left+s.dimension.width+D-o;M=s.offset.top-a-_-12;H();B("bottom-right","top-right")}if(P=="bottom"){var j=s.offset.left+o-(s.offset.left+s.dimension.width);A=s.offset.left-j/2+D;M=s.offset.top+s.dimension.height+_+12;H();B("top","bottom")}if(P=="bottom-left"){A=s.offset.left+D;M=s.offset.top+s.dimension.height+_+12;H();B("top-left","bottom-left")}if(P=="bottom-right"){A=s.offset.left+s.dimension.width+D-o;M=s.offset.top+s.dimension.height+_+12;H();B("top-right","bottom-right")}if(P=="left"){A=s.offset.left-D-o-12;O=s.offset.left+D+s.dimension.width+12;var F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_;if(A<0&&O+o>i){var I=parseFloat(n.$tooltip.css("border-width"))*2,q=o+A-I;n.$tooltip.css("width",q+"px");a=n.$tooltip.outerHeight(false);A=s.offset.left-D-q-12-I;F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_}else if(A<0){A=s.offset.left+D+s.dimension.width+12;r="left"}}if(P=="right"){A=s.offset.left+D+s.dimension.width+12;O=s.offset.left-D-o-12;var F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_;if(A+o>i&&O<0){var I=parseFloat(n.$tooltip.css("border-width"))*2,q=i-A-I;n.$tooltip.css("width",q+"px");a=n.$tooltip.outerHeight(false);F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_}else if(A+o>i){A=s.offset.left-D-o-12;r="right"}}if(n.options.arrow){var R="tooltipster-arrow-"+P;if(n.options.arrowColor.length<1){var U=n.$tooltip.css("background-color")}else{var U=n.options.arrowColor}if(!r){r=""}else if(r=="left"){R="tooltipster-arrow-right";r=""}else if(r=="right"){R="tooltipster-arrow-left";r=""}else{r="left:"+Math.round(r)+"px;"}if(P=="top"||P=="top-left"||P=="top-right"){var z=parseFloat(n.$tooltip.css("border-bottom-width")),W=n.$tooltip.css("border-bottom-color")}else if(P=="bottom"||P=="bottom-left"||P=="bottom-right"){var z=parseFloat(n.$tooltip.css("border-top-width")),W=n.$tooltip.css("border-top-color")}else if(P=="left"){var z=parseFloat(n.$tooltip.css("border-right-width")),W=n.$tooltip.css("border-right-color")}else if(P=="right"){var z=parseFloat(n.$tooltip.css("border-left-width")),W=n.$tooltip.css("border-left-color")}else{var z=parseFloat(n.$tooltip.css("border-bottom-width")),W=n.$tooltip.css("border-bottom-color")}if(z>1){z++}var X="";if(z!==0){var V="",J="border-color: "+W+";";if(R.indexOf("bottom")!==-1){V="margin-top: -"+Math.round(z)+"px;"}else if(R.indexOf("top")!==-1){V="margin-bottom: -"+Math.round(z)+"px;"}else if(R.indexOf("left")!==-1){V="margin-right: -"+Math.round(z)+"px;"}else if(R.indexOf("right")!==-1){V="margin-left: -"+Math.round(z)+"px;"}X='<span class="tooltipster-arrow-border" style="'+V+" "+J+';"></span>'}n.$tooltip.find(".tooltipster-arrow").remove();var K='<div class="'+R+' tooltipster-arrow" style="'+r+'">'+X+'<span style="border-color:'+U+';"></span></div>';n.$tooltip.append(K)}n.$tooltip.css({top:Math.round(M)+"px",left:Math.round(A)+"px"})}return n},enable:function(){this.enabled=true;return this},disable:function(){this.hide();this.enabled=false;return this},destroy:function(){var t=this;t.hide();if(t.$el[0]!==t.$elProxy[0]){t.$elProxy.remove()}t.$el.removeData(t.namespace).off("."+t.namespace);var n=t.$el.data("tooltipster-ns");if(n.length===1){var r=null;if(t.options.restoration==="previous"){r=t.$el.data("tooltipster-initialTitle")}else if(t.options.restoration==="current"){r=typeof t.Content==="string"?t.Content:e("<div></div>").append(t.Content).html()}if(r){t.$el.attr("title",r)}t.$el.removeClass("tooltipstered").removeData("tooltipster-ns").removeData("tooltipster-initialTitle")}else{n=e.grep(n,function(e,n){return e!==t.namespace});t.$el.data("tooltipster-ns",n)}return t},elementIcon:function(){return this.$el[0]!==this.$elProxy[0]?this.$elProxy[0]:undefined},elementTooltip:function(){return this.$tooltip?this.$tooltip[0]:undefined},option:function(e,t){if(typeof t=="undefined")return this.options[e];else{this.options[e]=t;return this}},status:function(){return this.Status}};e.fn[r]=function(){var t=arguments;if(this.length===0){if(typeof t[0]==="string"){var n=true;switch(t[0]){case"setDefaults":e.extend(i,t[1]);break;default:n=false;break}if(n)return true;else return this}else{return this}}else{if(typeof t[0]==="string"){var r="#*$~&";this.each(function(){var n=e(this).data("tooltipster-ns"),i=n?e(this).data(n[0]):null;if(i){if(typeof i[t[0]]==="function"){var s=i[t[0]](t[1],t[2])}else{throw new Error('Unknown method .tooltipster("'+t[0]+'")')}if(s!==i){r=s;return false}}else{throw new Error("You called Tooltipster's \""+t[0]+'" method on an uninitialized element')}});return r!=="#*$~&"?r:this}else{var o=[],u=t[0]&&typeof t[0].multiple!=="undefined",a=u&&t[0].multiple||!u&&i.multiple,f=t[0]&&typeof t[0].debug!=="undefined",l=f&&t[0].debug||!f&&i.debug;this.each(function(){var n=false,r=e(this).data("tooltipster-ns"),i=null;if(!r){n=true}else if(a){n=true}else if(l){console.log('Tooltipster: one or more tooltips are already attached to this element: ignoring. Use the "multiple" option to attach more tooltips.')}if(n){i=new s(this,t[0]);if(!r)r=[];r.push(i.namespace);e(this).data("tooltipster-ns",r);e(this).data(i.namespace,i)}o.push(i)});if(a)return o;else return this}}};var u=!!("ontouchstart"in t);var a=false;e("body").one("mousemove",function(){a=true})})(jQuery,window,document);
(function (angular, $) {
    angular.module('ngValidate', [])

        .directive('ngValidate', function () {
            return {
                require: 'form',
                restrict: 'A',
                scope: {
                    ngValidate: '='
                },
                link: function (scope, element, attrs, form) {
                    var validator = element.validate(scope.ngValidate);

                    form.validate = function (options) {
                        var oldSettings = validator.settings;

                        validator.settings = $.extend(true, {}, validator.settings, options);

                        var valid = validator.form();

                        validator.settings = oldSettings; // Reset to old settings

                        return valid;
                    };

                    form.numberOfInvalids = function () {
                        return validator.numberOfInvalids();
                    };

                    form.invalid = function () {
                        return validator.invalid;
                    };
                }
            };
        })

        .provider('$validator', function () {
            $.validator.setDefaults({
                onsubmit: false // to prevent validating twice
            });

            return {
                setDefaults: $.validator.setDefaults,
                addMethod: $.validator.addMethod,
                setDefaultMessages: function (messages) {
                    angular.extend($.validator.messages, messages);
                },
                format: $.validator.format,
                $get: function () {
                    return {};
                }
            };
        });
}(angular, jQuery));

/*
 * QRious v2.3.0
 * Copyright (C) 2017 Alasdair Mercer
 * Copyright (C) 2010 Tom Zerucha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('qrious', factory) :
	(global.QRious = factory());
}(this, (function () { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function(it){
	  return Object(_defined(it));
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
	});

	var SHARED = '__core-js_shared__';
	var store  = _global[SHARED] || (_global[SHARED] = {});
	var _shared = function(key){
	  return store[key] || (store[key] = {});
	};

	var id = 0;
	var px = Math.random();
	var _uid = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var shared = _shared('keys');
	var _sharedKey = function(key){
	  return shared[key] || (shared[key] = _uid(key));
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var IE_PROTO    = _sharedKey('IE_PROTO');
	var ObjectProto = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function(O){
	  O = _toObject(O);
	  if(_has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
	});

	var _aFunction = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

	// optional / simple context binding

	var _ctx = function(fn, that, length){
	  _aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

	var _isObject = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function(it){
	  if(!_isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _fails = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

	var document$1 = _global.document;
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function(it){
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function(){
	  return Object.defineProperty(_domCreate('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function(it, S){
	  if(!_isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP             = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if(_ie8DomDefine)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

	var _hide = _descriptors ? function(object, key, value){
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

	var PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? _core : _core[name] || (_core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? _ctx(out, _global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])_hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	// most Object methods by ES6 should accept primitives

	var _objectSap = function(KEY, exec){
	  var fn  = (_core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  _export(_export.S + _export.F * _fails(function(){ fn(1); }), 'Object', exp);
	};

	// 19.1.2.9 Object.getPrototypeOf(O)


	_objectSap('getPrototypeOf', function(){
	  return function getPrototypeOf(it){
	    return _objectGpo(_toObject(it));
	  };
	});

	var getPrototypeOf$1 = _core.Object.getPrototypeOf;

	var getPrototypeOf = createCommonjsModule(function (module) {
	module.exports = { "default": getPrototypeOf$1, __esModule: true };
	});

	var _Object$getPrototypeOf = unwrapExports(getPrototypeOf);

	var classCallCheck = createCommonjsModule(function (module, exports) {
	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	});

	var _classCallCheck = unwrapExports(classCallCheck);

	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	_export(_export.S + _export.F * !_descriptors, 'Object', {defineProperty: _objectDp.f});

	var $Object = _core.Object;
	var defineProperty$2 = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

	var defineProperty = createCommonjsModule(function (module) {
	module.exports = { "default": defineProperty$2, __esModule: true };
	});

	var createClass = createCommonjsModule(function (module, exports) {
	"use strict";

	exports.__esModule = true;



	var _defineProperty2 = _interopRequireDefault(defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();
	});

	var _createClass = unwrapExports(createClass);

	// 7.1.4 ToInteger
	var ceil  = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function(TO_STRING){
	  return function(that, pos){
	    var s = String(_defined(that))
	      , i = _toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var _library = true;

	var _redefine = _hide;

	var _iterators = {};

	var toString = {}.toString;

	var _cof = function(it){
	  return toString.call(it).slice(8, -1);
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// to indexed object, toObject with fallback for non-array-like ES3 strings

	var _toIobject = function(it){
	  return _iobject(_defined(it));
	};

	// 7.1.15 ToLength
	var min       = Math.min;
	var _toLength = function(it){
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	var max       = Math.max;
	var min$1       = Math.min;
	var _toIndex = function(index, length){
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes

	var _arrayIncludes = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = _toIobject($this)
	      , length = _toLength(O.length)
	      , index  = _toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO$2     = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function(object, names){
	  var O      = _toIobject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO$2)_has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(_has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)


	var _objectKeys = Object.keys || function keys(O){
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties){
	  _anObject(O);
	  var keys   = _objectKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)_objectDp.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

	var _html = _global.document && document.documentElement;

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var IE_PROTO$1    = _sharedKey('IE_PROTO');
	var Empty       = function(){ /* empty */ };
	var PROTOTYPE$1   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe')
	    , i      = _enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	var _wks = createCommonjsModule(function (module) {
	var store      = _shared('wks')
	  , Symbol     = _global.Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	var def = _objectDp.f;
	var TAG = _wks('toStringTag');

	var _setToStringTag = function(it, tag, stat){
	  if(it && !_has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function(){ return this; });

	var _iterCreate = function(Constructor, NAME, next){
	  Constructor.prototype = _objectCreate(IteratorPrototype, {next: _propertyDesc(1, next)});
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	var ITERATOR       = _wks('iterator');
	var BUGGY          = !([].keys && 'next' in [].keys());
	var FF_ITERATOR    = '@@iterator';
	var KEYS           = 'keys';
	var VALUES         = 'values';

	var returnThis = function(){ return this; };

	var _iterDefine = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = _objectGpo($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!_library && !_has(IteratorPrototype, ITERATOR))_hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    _hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))_redefine(proto, key, methods[key]);
	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

	var $at  = _stringAt(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	_iterDefine(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

	var _addToUnscopables = function(){ /* empty */ };

	var _iterStep = function(done, value){
	  return {value: value, done: !!done};
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function(iterated, kind){
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if(kind == 'keys'  )return _iterStep(0, index);
	  if(kind == 'values')return _iterStep(0, O[index]);
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	_addToUnscopables('keys');
	_addToUnscopables('values');
	_addToUnscopables('entries');

	var TO_STRING_TAG = _wks('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = _global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])_hide(proto, TO_STRING_TAG, NAME);
	  _iterators[NAME] = _iterators.Array;
	}

	var f$1 = _wks;

	var _wksExt = {
		f: f$1
	};

	var iterator$2 = _wksExt.f('iterator');

	var iterator = createCommonjsModule(function (module) {
	module.exports = { "default": iterator$2, __esModule: true };
	});

	var _meta = createCommonjsModule(function (module) {
	var META     = _uid('meta')
	  , setDesc  = _objectDp.f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !_fails(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!_isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!_has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!_has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !_has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};
	});

	var defineProperty$4 = _objectDp.f;
	var _wksDefine = function(name){
	  var $Symbol = _core.Symbol || (_core.Symbol = _library ? {} : _global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty$4($Symbol, name, {value: _wksExt.f(name)});
	};

	var _keyof = function(object, el){
	  var O      = _toIobject(object)
	    , keys   = _objectKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

	var f$2 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$2
	};

	var f$3 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$3
	};

	// all enumerable object keys, includes symbols

	var _enumKeys = function(it){
	  var result     = _objectKeys(it)
	    , getSymbols = _objectGops.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = _objectPie.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg){
	  return _cof(arg) == 'Array';
	};

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$5 = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$5
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var gOPN$1      = _objectGopn.f;
	var toString$1  = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return gOPN$1(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	var f$4 = function getOwnPropertyNames(it){
	  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN$1(_toIobject(it));
	};

	var _objectGopnExt = {
		f: f$4
	};

	var gOPD$1           = Object.getOwnPropertyDescriptor;

	var f$6 = _descriptors ? gOPD$1 : function getOwnPropertyDescriptor(O, P){
	  O = _toIobject(O);
	  P = _toPrimitive(P, true);
	  if(_ie8DomDefine)try {
	    return gOPD$1(O, P);
	  } catch(e){ /* empty */ }
	  if(_has(O, P))return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
	};

	var _objectGopd = {
		f: f$6
	};

	// ECMAScript 6 symbols shim
	var META           = _meta.KEY;
	var gOPD           = _objectGopd.f;
	var dP$1             = _objectDp.f;
	var gOPN           = _objectGopnExt.f;
	var $Symbol        = _global.Symbol;
	var $JSON          = _global.JSON;
	var _stringify     = $JSON && $JSON.stringify;
	var PROTOTYPE$2      = 'prototype';
	var HIDDEN         = _wks('_hidden');
	var TO_PRIMITIVE   = _wks('toPrimitive');
	var isEnum         = {}.propertyIsEnumerable;
	var SymbolRegistry = _shared('symbol-registry');
	var AllSymbols     = _shared('symbols');
	var OPSymbols      = _shared('op-symbols');
	var ObjectProto$1    = Object[PROTOTYPE$2];
	var USE_NATIVE     = typeof $Symbol == 'function';
	var QObject        = _global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = _descriptors && _fails(function(){
	  return _objectCreate(dP$1({}, 'a', {
	    get: function(){ return dP$1(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto$1, key);
	  if(protoDesc)delete ObjectProto$1[key];
	  dP$1(it, key, D);
	  if(protoDesc && it !== ObjectProto$1)dP$1(ObjectProto$1, key, protoDesc);
	} : dP$1;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto$1)$defineProperty(OPSymbols, key, D);
	  _anObject(it);
	  key = _toPrimitive(key, true);
	  _anObject(D);
	  if(_has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!_has(it, HIDDEN))dP$1(it, HIDDEN, _propertyDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(_has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _objectCreate(D, {enumerable: _propertyDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP$1(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  _anObject(it);
	  var keys = _enumKeys(P = _toIobject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = _toPrimitive(key, true));
	  if(this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key))return false;
	  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = _toIobject(it);
	  key = _toPrimitive(key, true);
	  if(it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(_toIobject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto$1
	    , names  = gOPN(IS_OP ? OPSymbols : _toIobject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto$1)$set.call(OPSymbols, value);
	      if(_has(this, HIDDEN) && _has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, _propertyDesc(1, value));
	    };
	    if(_descriptors && setter)setSymbolDesc(ObjectProto$1, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString(){
	    return this._k;
	  });

	  _objectGopd.f = $getOwnPropertyDescriptor;
	  _objectDp.f   = $defineProperty;
	  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
	  _objectPie.f  = $propertyIsEnumerable;
	  _objectGops.f = $getOwnPropertySymbols;

	  if(_descriptors && !_library){
	    _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  _wksExt.f = function(name){
	    return wrap(_wks(name));
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, {Symbol: $Symbol});

	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i$1 = 0; symbols.length > i$1; )_wks(symbols[i$1++]);

	for(var symbols = _objectKeys(_wks.store), i$1 = 0; symbols.length > i$1; )_wksDefine(symbols[i$1++]);

	_export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return _has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return _keyof(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});

	_export(_export.S + _export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !_isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	_setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	_setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	_setToStringTag(_global.JSON, 'JSON', true);

	_wksDefine('asyncIterator');

	_wksDefine('observable');

	var index = _core.Symbol;

	var symbol = createCommonjsModule(function (module) {
	module.exports = { "default": index, __esModule: true };
	});

	var _typeof_1 = createCommonjsModule(function (module, exports) {
	"use strict";

	exports.__esModule = true;



	var _iterator2 = _interopRequireDefault(iterator);



	var _symbol2 = _interopRequireDefault(symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};
	});

	var possibleConstructorReturn = createCommonjsModule(function (module, exports) {
	"use strict";

	exports.__esModule = true;



	var _typeof3 = _interopRequireDefault(_typeof_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};
	});

	var _possibleConstructorReturn = unwrapExports(possibleConstructorReturn);

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */

	var check = function(O, proto){
	  _anObject(O);
	  if(!_isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	var _setProto = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

	// 19.1.3.19 Object.setPrototypeOf(O, proto)

	_export(_export.S, 'Object', {setPrototypeOf: _setProto.set});

	var setPrototypeOf$2 = _core.Object.setPrototypeOf;

	var setPrototypeOf = createCommonjsModule(function (module) {
	module.exports = { "default": setPrototypeOf$2, __esModule: true };
	});

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	_export(_export.S, 'Object', {create: _objectCreate});

	var $Object$1 = _core.Object;
	var create$2 = function create(P, D){
	  return $Object$1.create(P, D);
	};

	var create = createCommonjsModule(function (module) {
	module.exports = { "default": create$2, __esModule: true };
	});

	var inherits = createCommonjsModule(function (module, exports) {
	"use strict";

	exports.__esModule = true;



	var _setPrototypeOf2 = _interopRequireDefault(setPrototypeOf);



	var _create2 = _interopRequireDefault(create);



	var _typeof3 = _interopRequireDefault(_typeof_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
	  }

	  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
	};
	});

	var _inherits = unwrapExports(inherits);

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Contains utility methods that are useful throughout the library.
	 *
	 * @public
	 */
	var Utilities = function () {
	  function Utilities() {
	    _classCallCheck(this, Utilities);
	  }

	  _createClass(Utilities, null, [{
	    key: "abs",


	    /**
	     * Returns the absolute value of a given number.
	     *
	     * This method is simply a convenient shorthand for <code>Math.abs</code> while ensuring that nulls are returned as
	     * <code>null</code> instead of zero.
	     *
	     * @param {number} value - the number whose absolute value is to be returned
	     * @return {number} The absolute value of <code>value</code> or <code>null</code> if <code>value</code> is
	     * <code>null</code>.
	     * @public
	     * @static
	     */
	    value: function abs(value) {
	      return value != null ? Math.abs(value) : null;
	    }

	    /**
	     * Returns whether the specified <code>object</code> has a property with the specified <code>name</code> as an own
	     * (not inherited) property.
	     *
	     * @param {Object} object - the object on which the property is to be checked
	     * @param {string} name - the name of the property to be checked
	     * @return {boolean} <code>true</code> if <code>object</code> has an own property with <code>name</code>.
	     * @public
	     * @static
	     */

	  }, {
	    key: "hasOwn",
	    value: function hasOwn(object, name) {
	      return Object.prototype.hasOwnProperty.call(object, name);
	    }

	    /**
	     * Throws an error indicating that the a given method on a specific class has not been implemented.
	     *
	     * @param {string} className - the name of the class on which the method has not been implemented
	     * @param {string} methodName - the name of the method which has not been implemented
	     * @return {void}
	     * @throws {Error} The error describing the class method which has not been implemented.
	     * @public
	     * @static
	     */

	  }, {
	    key: "throwUnimplemented",
	    value: function throwUnimplemented(className, methodName) {
	      throw new Error("\"" + methodName + "\" method must be implemented on the " + className + " class");
	    }

	    /**
	     * Transforms the specified <code>string</code> to upper case while remaining null-safe.
	     *
	     * @param {string} string - the string to be transformed to upper case
	     * @return {string} <code>string</code> transformed to upper case if <code>string</code> is not <code>null</code>.
	     * @public
	     * @static
	     */

	  }, {
	    key: "toUpperCase",
	    value: function toUpperCase(string) {
	      return string != null ? string.toUpperCase() : null;
	    }
	  }]);

	  return Utilities;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Defines a service contract that must be met by all implementations.
	 *
	 * @public
	 */

	var Service = function () {
	  function Service() {
	    _classCallCheck(this, Service);
	  }

	  _createClass(Service, [{
	    key: 'getName',


	    /**
	     * Returns the name of this {@link Service}.
	     *
	     * @return {string} The service name.
	     * @public
	     */
	    value: function getName() {
	      Utilities.throwUnimplemented('Service', 'getName');
	    }
	  }]);

	  return Service;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * A service for working with elements.
	 *
	 * @public
	 * @extends Service
	 */

	var ElementService = function (_Service) {
	  _inherits(ElementService, _Service);

	  function ElementService() {
	    _classCallCheck(this, ElementService);

	    return _possibleConstructorReturn(this, (ElementService.__proto__ || _Object$getPrototypeOf(ElementService)).apply(this, arguments));
	  }

	  _createClass(ElementService, [{
	    key: 'createCanvas',


	    /**
	     * Creates an instance of a canvas element.
	     *
	     * @return {*} The newly created canvas element.
	     * @public
	     */
	    value: function createCanvas() {
	      Utilities.throwUnimplemented('ElementService', 'createCanvas');
	    }

	    /**
	     * Creates an instance of a image element.
	     *
	     * @return {*} The newly created image element.
	     * @public
	     */

	  }, {
	    key: 'createImage',
	    value: function createImage() {
	      Utilities.throwUnimplemented('ElementService', 'createImage');
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'getName',
	    value: function getName() {
	      return 'element';
	    }

	    /**
	     * Returns whether the specified <code>element</code> is a canvas.
	     *
	     * @param {*} element - the element to be checked
	     * @return {boolean} <code>true</code> if <code>element</code> is a canvas; otherwise <code>false</code>.
	     * @public
	     */

	  }, {
	    key: 'isCanvas',
	    value: function isCanvas(element) {
	      Utilities.throwUnimplemented('ElementService', 'isCanvas');
	    }

	    /**
	     * Returns whether the specified <code>element</code> is an image.
	     *
	     * @param {*} element - the element to be checked
	     * @return {boolean} <code>true</code> if <code>element</code> is an image; otherwise <code>false</code>.
	     * @public
	     */

	  }, {
	    key: 'isImage',
	    value: function isImage(element) {
	      Utilities.throwUnimplemented('ElementService', 'isImage');
	    }
	  }]);

	  return ElementService;
	}(Service);

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * An implementation of {@link ElementService} intended for use within a browser environment.
	 *
	 * @public
	 * @extends ElementService
	 */

	var BrowserElementService = function (_ElementService) {
	  _inherits(BrowserElementService, _ElementService);

	  function BrowserElementService() {
	    _classCallCheck(this, BrowserElementService);

	    return _possibleConstructorReturn(this, (BrowserElementService.__proto__ || _Object$getPrototypeOf(BrowserElementService)).apply(this, arguments));
	  }

	  _createClass(BrowserElementService, [{
	    key: 'createCanvas',


	    /**
	     * @override
	     */
	    value: function createCanvas() {
	      return document.createElement('canvas');
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'createImage',
	    value: function createImage() {
	      return document.createElement('img');
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'isCanvas',
	    value: function isCanvas(element) {
	      return element instanceof HTMLCanvasElement;
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'isImage',
	    value: function isImage(element) {
	      return element instanceof HTMLImageElement;
	    }
	  }]);

	  return BrowserElementService;
	}(ElementService);

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Responsible for rendering a QR code {@link Frame} on a specific type of element.
	 *
	 * A renderer may be dependant on the rendering of another element, so the ordering of their execution is important.
	 *
	 * The rendering of a element can be deferred by disabling the renderer initially, however, any attempt get the element
	 * from the renderer will result in it being immediately enabled and the element being rendered.
	 *
	 * @public
	 */

	var Renderer = function () {

	  /**
	   * Creates a new instance of {@link Renderer} for the <code>qrious</code> instance and <code>element</code> provided.
	   *
	   * @param {QRious} qrious - the {@link QRious} instance to be used
	   * @param {*} element - the element onto which the QR code is to be rendered
	   * @param {boolean} [enabled] - <code>true</code> this {@link Renderer} is enabled; otherwise <code>false</code>.
	   * @public
	   */
	  function Renderer(qrious, element, enabled) {
	    _classCallCheck(this, Renderer);

	    /**
	     * The {@link QRious} instance.
	     *
	     * @protected
	     * @type {QRious}
	     */
	    this.qrious = qrious;

	    /**
	     * The element onto which this {@link Renderer} is rendering the QR code.
	     *
	     * @protected
	     * @type {*}
	     */
	    this.element = element;
	    this.element.qrious = qrious;

	    /**
	     * Whether this {@link Renderer} is enabled.
	     *
	     * @protected
	     * @type {boolean}
	     */
	    this.enabled = Boolean(enabled);
	  }

	  /**
	   * Draws the specified QR code <code>frame</code> on the underlying element.
	   *
	   * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
	   *
	   * @param {Frame} frame - the {@link Frame} to be drawn
	   * @return {void}
	   * @protected
	   */


	  _createClass(Renderer, [{
	    key: 'draw',
	    value: function draw(frame) {
	      Utilities.throwUnimplemented('Renderer', 'draw');
	    }

	    /**
	     * Returns the element onto which this {@link Renderer} is rendering the QR code.
	     *
	     * If this method is called while this {@link Renderer} is disabled, it will be immediately enabled and rendered
	     * before the element is returned.
	     *
	     * @return {*} The element.
	     * @public
	     */

	  }, {
	    key: 'getElement',
	    value: function getElement() {
	      if (!this.enabled) {
	        this.enabled = true;
	        this.render();
	      }

	      return this.element;
	    }

	    /**
	     * Calculates the size (in pixel units) to represent an individual module within the QR code based on the
	     * <code>frame</code> provided.
	     *
	     * Any configured padding will be excluded from the returned size.
	     *
	     * The returned value will be at least one, even in cases where the size of the QR code does not fit its contents.
	     * This is done so that the inevitable clipping is handled more gracefully since this way at least something is
	     * displayed instead of just a blank space filled by the background color.
	     *
	     * @param {Frame} frame - the {@link Frame} from which the module size is to be derived
	     * @return {number} The pixel size for each module in the QR code which will be no less than one.
	     * @protected
	     */

	  }, {
	    key: 'getModuleSize',
	    value: function getModuleSize(frame) {
	      var qrious = this.qrious;
	      var padding = qrious.padding || 0;
	      var pixels = Math.floor((qrious.size - padding * 2) / frame.width);

	      return Math.max(1, pixels);
	    }

	    /**
	     * Calculates the offset/padding (in pixel units) to be inserted before the QR code based on the <code>frame</code>
	     * provided.
	     *
	     * The returned value will be zero if there is no available offset or if the size of the QR code does not fit its
	     * contents. It will never be a negative value. This is done so that the inevitable clipping appears more naturally
	     * and it is not clipped from all directions.
	     *
	     * @param {Frame} frame - the {@link Frame} from which the offset is to be derived
	     * @return {number} The pixel offset for the QR code which will be no less than zero.
	     * @protected
	     */

	  }, {
	    key: 'getOffset',
	    value: function getOffset(frame) {
	      var qrious = this.qrious;
	      var padding = qrious.padding;

	      if (padding != null) {
	        return padding;
	      }

	      var moduleSize = this.getModuleSize(frame);
	      var offset = Math.floor((qrious.size - moduleSize * frame.width) / 2);

	      return Math.max(0, offset);
	    }

	    /**
	     * Renders a QR code on the underlying element based on the <code>frame</code> provided.
	     *
	     * @param {Frame} frame - the {@link Frame} to be rendered
	     * @return {void}
	     * @public
	     */

	  }, {
	    key: 'render',
	    value: function render(frame) {
	      if (this.enabled) {
	        this.resize();
	        this.reset();
	        this.draw(frame);
	      }
	    }

	    /**
	     * Resets the underlying element, effectively clearing any previously rendered QR code.
	     *
	     * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
	     *
	     * @return {void}
	     * @protected
	     */

	  }, {
	    key: 'reset',
	    value: function reset() {
	      Utilities.throwUnimplemented('Renderer', 'reset');
	    }

	    /**
	     * Ensures that the size of the underlying element matches that defined on the associated {@link QRious} instance.
	     *
	     * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
	     *
	     * @return {void}
	     * @protected
	     */

	  }, {
	    key: 'resize',
	    value: function resize() {
	      Utilities.throwUnimplemented('Renderer', 'resize');
	    }
	  }]);

	  return Renderer;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * An implementation of {@link Renderer} for working with <code>canvas</code> elements.
	 *
	 * @public
	 * @extends Renderer
	 */

	var CanvasRenderer = function (_Renderer) {
	  _inherits(CanvasRenderer, _Renderer);

	  function CanvasRenderer() {
	    _classCallCheck(this, CanvasRenderer);

	    return _possibleConstructorReturn(this, (CanvasRenderer.__proto__ || _Object$getPrototypeOf(CanvasRenderer)).apply(this, arguments));
	  }

	  _createClass(CanvasRenderer, [{
	    key: 'draw',


	    /**
	     * @override
	     */
	    value: function draw(frame) {
	      var qrious = this.qrious;
	      var moduleSize = this.getModuleSize(frame);
	      var offset = this.getOffset(frame);
	      var context = this.element.getContext('2d');

	      context.fillStyle = qrious.foreground;
	      context.globalAlpha = qrious.foregroundAlpha;

	      for (var i = 0; i < frame.width; i++) {
	        for (var j = 0; j < frame.width; j++) {
	          if (frame.buffer[j * frame.width + i]) {
	            context.fillRect(moduleSize * i + offset, moduleSize * j + offset, moduleSize, moduleSize);
	          }
	        }
	      }
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'reset',
	    value: function reset() {
	      var qrious = this.qrious;
	      var context = this.element.getContext('2d');
	      var size = qrious.size;

	      context.lineWidth = 1;
	      context.clearRect(0, 0, size, size);
	      context.fillStyle = qrious.background;
	      context.globalAlpha = qrious.backgroundAlpha;
	      context.fillRect(0, 0, size, size);
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'resize',
	    value: function resize() {
	      this.element.width = this.element.height = this.qrious.size;
	    }
	  }]);

	  return CanvasRenderer;
	}(Renderer);

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/* eslint no-multi-spaces: "off" */

	/**
	 * Contains alignment pattern information.
	 *
	 * @public
	 */
	var Alignment = function () {
	  function Alignment() {
	    _classCallCheck(this, Alignment);
	  }

	  _createClass(Alignment, null, [{
	    key: "BLOCK",


	    /**
	     * Returns the alignment pattern block.
	     *
	     * @return {number[]} The alignment pattern block.
	     * @public
	     * @static
	     */
	    get: function get() {
	      return [0, 11, 15, 19, 23, 27, 31, 16, 18, 20, 22, 24, 26, 28, 20, 22, 24, 24, 26, 28, 28, 22, 24, 24, 26, 26, 28, 28, 24, 24, 26, 26, 26, 28, 28, 24, 26, 26, 26, 28, 28];
	    }
	  }]);

	  return Alignment;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/* eslint no-multi-spaces: "off" */

	/**
	 * Contains error correction information.
	 *
	 * @public
	 */
	var ErrorCorrection = function () {
	  function ErrorCorrection() {
	    _classCallCheck(this, ErrorCorrection);
	  }

	  _createClass(ErrorCorrection, null, [{
	    key: "BLOCKS",


	    /**
	     * Returns the error correction blocks.
	     *
	     * There are four elements per version. The first two indicate the number of blocks, then the data width, and finally
	     * the ECC width.
	     *
	     * @return {number[]} The ECC blocks.
	     * @public
	     * @static
	     */
	    get: function get() {
	      return [1, 0, 19, 7, 1, 0, 16, 10, 1, 0, 13, 13, 1, 0, 9, 17, 1, 0, 34, 10, 1, 0, 28, 16, 1, 0, 22, 22, 1, 0, 16, 28, 1, 0, 55, 15, 1, 0, 44, 26, 2, 0, 17, 18, 2, 0, 13, 22, 1, 0, 80, 20, 2, 0, 32, 18, 2, 0, 24, 26, 4, 0, 9, 16, 1, 0, 108, 26, 2, 0, 43, 24, 2, 2, 15, 18, 2, 2, 11, 22, 2, 0, 68, 18, 4, 0, 27, 16, 4, 0, 19, 24, 4, 0, 15, 28, 2, 0, 78, 20, 4, 0, 31, 18, 2, 4, 14, 18, 4, 1, 13, 26, 2, 0, 97, 24, 2, 2, 38, 22, 4, 2, 18, 22, 4, 2, 14, 26, 2, 0, 116, 30, 3, 2, 36, 22, 4, 4, 16, 20, 4, 4, 12, 24, 2, 2, 68, 18, 4, 1, 43, 26, 6, 2, 19, 24, 6, 2, 15, 28, 4, 0, 81, 20, 1, 4, 50, 30, 4, 4, 22, 28, 3, 8, 12, 24, 2, 2, 92, 24, 6, 2, 36, 22, 4, 6, 20, 26, 7, 4, 14, 28, 4, 0, 107, 26, 8, 1, 37, 22, 8, 4, 20, 24, 12, 4, 11, 22, 3, 1, 115, 30, 4, 5, 40, 24, 11, 5, 16, 20, 11, 5, 12, 24, 5, 1, 87, 22, 5, 5, 41, 24, 5, 7, 24, 30, 11, 7, 12, 24, 5, 1, 98, 24, 7, 3, 45, 28, 15, 2, 19, 24, 3, 13, 15, 30, 1, 5, 107, 28, 10, 1, 46, 28, 1, 15, 22, 28, 2, 17, 14, 28, 5, 1, 120, 30, 9, 4, 43, 26, 17, 1, 22, 28, 2, 19, 14, 28, 3, 4, 113, 28, 3, 11, 44, 26, 17, 4, 21, 26, 9, 16, 13, 26, 3, 5, 107, 28, 3, 13, 41, 26, 15, 5, 24, 30, 15, 10, 15, 28, 4, 4, 116, 28, 17, 0, 42, 26, 17, 6, 22, 28, 19, 6, 16, 30, 2, 7, 111, 28, 17, 0, 46, 28, 7, 16, 24, 30, 34, 0, 13, 24, 4, 5, 121, 30, 4, 14, 47, 28, 11, 14, 24, 30, 16, 14, 15, 30, 6, 4, 117, 30, 6, 14, 45, 28, 11, 16, 24, 30, 30, 2, 16, 30, 8, 4, 106, 26, 8, 13, 47, 28, 7, 22, 24, 30, 22, 13, 15, 30, 10, 2, 114, 28, 19, 4, 46, 28, 28, 6, 22, 28, 33, 4, 16, 30, 8, 4, 122, 30, 22, 3, 45, 28, 8, 26, 23, 30, 12, 28, 15, 30, 3, 10, 117, 30, 3, 23, 45, 28, 4, 31, 24, 30, 11, 31, 15, 30, 7, 7, 116, 30, 21, 7, 45, 28, 1, 37, 23, 30, 19, 26, 15, 30, 5, 10, 115, 30, 19, 10, 47, 28, 15, 25, 24, 30, 23, 25, 15, 30, 13, 3, 115, 30, 2, 29, 46, 28, 42, 1, 24, 30, 23, 28, 15, 30, 17, 0, 115, 30, 10, 23, 46, 28, 10, 35, 24, 30, 19, 35, 15, 30, 17, 1, 115, 30, 14, 21, 46, 28, 29, 19, 24, 30, 11, 46, 15, 30, 13, 6, 115, 30, 14, 23, 46, 28, 44, 7, 24, 30, 59, 1, 16, 30, 12, 7, 121, 30, 12, 26, 47, 28, 39, 14, 24, 30, 22, 41, 15, 30, 6, 14, 121, 30, 6, 34, 47, 28, 46, 10, 24, 30, 2, 64, 15, 30, 17, 4, 122, 30, 29, 14, 46, 28, 49, 10, 24, 30, 24, 46, 15, 30, 4, 18, 122, 30, 13, 32, 46, 28, 48, 14, 24, 30, 42, 32, 15, 30, 20, 4, 117, 30, 40, 7, 47, 28, 43, 22, 24, 30, 10, 67, 15, 30, 19, 6, 118, 30, 18, 31, 47, 28, 34, 34, 24, 30, 20, 61, 15, 30];
	    }

	    /**
	     * Returns the final format bits with mask (level << 3 | mask).
	     *
	     * @return {number[]} The final format bits.
	     * @public
	     * @static
	     */

	  }, {
	    key: "FINAL_FORMAT",
	    get: function get() {
	      return [
	      // L
	      0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
	      // M
	      0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
	      // Q
	      0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed,
	      // H
	      0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b];
	    }

	    /**
	     * Returns a map of human-readable ECC levels.
	     *
	     * @return {Object<string, number>} A ECC level mapping.
	     * @public
	     * @static
	     */

	  }, {
	    key: "LEVELS",
	    get: function get() {
	      return {
	        L: 1,
	        M: 2,
	        Q: 3,
	        H: 4
	      };
	    }
	  }]);

	  return ErrorCorrection;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Contains Galois field information.
	 *
	 * @public
	 */
	var Galois = function () {
	  function Galois() {
	    _classCallCheck(this, Galois);
	  }

	  _createClass(Galois, null, [{
	    key: "EXPONENT",


	    /**
	     * Returns the Galois field exponent table.
	     *
	     * @return {number[]} The Galois field exponent table.
	     * @public
	     * @static
	     */
	    get: function get() {
	      return [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1d, 0x3a, 0x74, 0xe8, 0xcd, 0x87, 0x13, 0x26, 0x4c, 0x98, 0x2d, 0x5a, 0xb4, 0x75, 0xea, 0xc9, 0x8f, 0x03, 0x06, 0x0c, 0x18, 0x30, 0x60, 0xc0, 0x9d, 0x27, 0x4e, 0x9c, 0x25, 0x4a, 0x94, 0x35, 0x6a, 0xd4, 0xb5, 0x77, 0xee, 0xc1, 0x9f, 0x23, 0x46, 0x8c, 0x05, 0x0a, 0x14, 0x28, 0x50, 0xa0, 0x5d, 0xba, 0x69, 0xd2, 0xb9, 0x6f, 0xde, 0xa1, 0x5f, 0xbe, 0x61, 0xc2, 0x99, 0x2f, 0x5e, 0xbc, 0x65, 0xca, 0x89, 0x0f, 0x1e, 0x3c, 0x78, 0xf0, 0xfd, 0xe7, 0xd3, 0xbb, 0x6b, 0xd6, 0xb1, 0x7f, 0xfe, 0xe1, 0xdf, 0xa3, 0x5b, 0xb6, 0x71, 0xe2, 0xd9, 0xaf, 0x43, 0x86, 0x11, 0x22, 0x44, 0x88, 0x0d, 0x1a, 0x34, 0x68, 0xd0, 0xbd, 0x67, 0xce, 0x81, 0x1f, 0x3e, 0x7c, 0xf8, 0xed, 0xc7, 0x93, 0x3b, 0x76, 0xec, 0xc5, 0x97, 0x33, 0x66, 0xcc, 0x85, 0x17, 0x2e, 0x5c, 0xb8, 0x6d, 0xda, 0xa9, 0x4f, 0x9e, 0x21, 0x42, 0x84, 0x15, 0x2a, 0x54, 0xa8, 0x4d, 0x9a, 0x29, 0x52, 0xa4, 0x55, 0xaa, 0x49, 0x92, 0x39, 0x72, 0xe4, 0xd5, 0xb7, 0x73, 0xe6, 0xd1, 0xbf, 0x63, 0xc6, 0x91, 0x3f, 0x7e, 0xfc, 0xe5, 0xd7, 0xb3, 0x7b, 0xf6, 0xf1, 0xff, 0xe3, 0xdb, 0xab, 0x4b, 0x96, 0x31, 0x62, 0xc4, 0x95, 0x37, 0x6e, 0xdc, 0xa5, 0x57, 0xae, 0x41, 0x82, 0x19, 0x32, 0x64, 0xc8, 0x8d, 0x07, 0x0e, 0x1c, 0x38, 0x70, 0xe0, 0xdd, 0xa7, 0x53, 0xa6, 0x51, 0xa2, 0x59, 0xb2, 0x79, 0xf2, 0xf9, 0xef, 0xc3, 0x9b, 0x2b, 0x56, 0xac, 0x45, 0x8a, 0x09, 0x12, 0x24, 0x48, 0x90, 0x3d, 0x7a, 0xf4, 0xf5, 0xf7, 0xf3, 0xfb, 0xeb, 0xcb, 0x8b, 0x0b, 0x16, 0x2c, 0x58, 0xb0, 0x7d, 0xfa, 0xe9, 0xcf, 0x83, 0x1b, 0x36, 0x6c, 0xd8, 0xad, 0x47, 0x8e, 0x00];
	    }

	    /**
	     * Returns the Galois field log table.
	     *
	     * @return {number[]} The Galois field log table.
	     * @public
	     * @static
	     */

	  }, {
	    key: "LOG",
	    get: function get() {
	      return [0xff, 0x00, 0x01, 0x19, 0x02, 0x32, 0x1a, 0xc6, 0x03, 0xdf, 0x33, 0xee, 0x1b, 0x68, 0xc7, 0x4b, 0x04, 0x64, 0xe0, 0x0e, 0x34, 0x8d, 0xef, 0x81, 0x1c, 0xc1, 0x69, 0xf8, 0xc8, 0x08, 0x4c, 0x71, 0x05, 0x8a, 0x65, 0x2f, 0xe1, 0x24, 0x0f, 0x21, 0x35, 0x93, 0x8e, 0xda, 0xf0, 0x12, 0x82, 0x45, 0x1d, 0xb5, 0xc2, 0x7d, 0x6a, 0x27, 0xf9, 0xb9, 0xc9, 0x9a, 0x09, 0x78, 0x4d, 0xe4, 0x72, 0xa6, 0x06, 0xbf, 0x8b, 0x62, 0x66, 0xdd, 0x30, 0xfd, 0xe2, 0x98, 0x25, 0xb3, 0x10, 0x91, 0x22, 0x88, 0x36, 0xd0, 0x94, 0xce, 0x8f, 0x96, 0xdb, 0xbd, 0xf1, 0xd2, 0x13, 0x5c, 0x83, 0x38, 0x46, 0x40, 0x1e, 0x42, 0xb6, 0xa3, 0xc3, 0x48, 0x7e, 0x6e, 0x6b, 0x3a, 0x28, 0x54, 0xfa, 0x85, 0xba, 0x3d, 0xca, 0x5e, 0x9b, 0x9f, 0x0a, 0x15, 0x79, 0x2b, 0x4e, 0xd4, 0xe5, 0xac, 0x73, 0xf3, 0xa7, 0x57, 0x07, 0x70, 0xc0, 0xf7, 0x8c, 0x80, 0x63, 0x0d, 0x67, 0x4a, 0xde, 0xed, 0x31, 0xc5, 0xfe, 0x18, 0xe3, 0xa5, 0x99, 0x77, 0x26, 0xb8, 0xb4, 0x7c, 0x11, 0x44, 0x92, 0xd9, 0x23, 0x20, 0x89, 0x2e, 0x37, 0x3f, 0xd1, 0x5b, 0x95, 0xbc, 0xcf, 0xcd, 0x90, 0x87, 0x97, 0xb2, 0xdc, 0xfc, 0xbe, 0x61, 0xf2, 0x56, 0xd3, 0xab, 0x14, 0x2a, 0x5d, 0x9e, 0x84, 0x3c, 0x39, 0x53, 0x47, 0x6d, 0x41, 0xa2, 0x1f, 0x2d, 0x43, 0xd8, 0xb7, 0x7b, 0xa4, 0x76, 0xc4, 0x17, 0x49, 0xec, 0x7f, 0x0c, 0x6f, 0xf6, 0x6c, 0xa1, 0x3b, 0x52, 0x29, 0x9d, 0x55, 0xaa, 0xfb, 0x60, 0x86, 0xb1, 0xbb, 0xcc, 0x3e, 0x5a, 0xcb, 0x59, 0x5f, 0xb0, 0x9c, 0xa9, 0xa0, 0x51, 0x0b, 0xf5, 0x16, 0xeb, 0x7a, 0x75, 0x2c, 0xd7, 0x4f, 0xae, 0xd5, 0xe9, 0xe6, 0xe7, 0xad, 0xe8, 0x74, 0xd6, 0xf4, 0xea, 0xa8, 0x50, 0x58, 0xaf];
	    }
	  }]);

	  return Galois;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Contains version pattern information.
	 *
	 * @public
	 */
	var Version = function () {
	  function Version() {
	    _classCallCheck(this, Version);
	  }

	  _createClass(Version, null, [{
	    key: "BLOCK",


	    /**
	     * Returns the version pattern block.
	     *
	     * @return {number[]} The version pattern block.
	     * @public
	     * @static
	     */
	    get: function get() {
	      return [0xc94, 0x5bc, 0xa99, 0x4d3, 0xbf6, 0x762, 0x847, 0x60d, 0x928, 0xb78, 0x45d, 0xa17, 0x532, 0x9a6, 0x683, 0x8c9, 0x7ec, 0xec4, 0x1e1, 0xfab, 0x08e, 0xc1a, 0x33f, 0xd75, 0x250, 0x9d5, 0x6f0, 0x8ba, 0x79f, 0xb0b, 0x42e, 0xa64, 0x541, 0xc69];
	    }
	  }]);

	  return Version;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Generates information for a QR code frame based on a specific value to be encoded.
	 *
	 * @public
	 */

	var Frame = function () {
	  _createClass(Frame, null, [{
	    key: '_createArray',
	    value: function _createArray(length) {
	      var array = [];

	      for (var i = 0; i < length; i++) {
	        array[i] = 0;
	      }

	      return array;
	    }
	  }, {
	    key: '_getMaskBit',
	    value: function _getMaskBit(x, y) {
	      var bit = void 0;

	      if (x > y) {
	        bit = x;
	        x = y;
	        y = bit;
	      }

	      bit = y;
	      bit += y * y;
	      bit >>= 1;
	      bit += x;

	      return bit;
	    }
	  }, {
	    key: '_modN',
	    value: function _modN(x) {
	      while (x >= 255) {
	        x -= 255;
	        x = (x >> 8) + (x & 255);
	      }

	      return x;
	    }

	    // *Badness* coefficients.

	  }, {
	    key: 'N1',
	    get: function get() {
	      return 3;
	    }
	  }, {
	    key: 'N2',
	    get: function get() {
	      return 3;
	    }
	  }, {
	    key: 'N3',
	    get: function get() {
	      return 40;
	    }
	  }, {
	    key: 'N4',
	    get: function get() {
	      return 10;
	    }

	    /**
	     * Creates an instance of {@link Frame} based on the <code>options</code> provided.
	     *
	     * @param {Frame~Options} options - the options to be used
	     * @public
	     */

	  }]);

	  function Frame(options) {
	    _classCallCheck(this, Frame);

	    this._badness = [];
	    this._level = ErrorCorrection.LEVELS[options.level];
	    this._polynomial = [];
	    this._value = options.value;
	    this._valueLength = this._value.length;
	    this._version = 0;
	    this._stringBuffer = [];

	    var dataBlock = void 0;
	    var eccBlock = void 0;
	    var neccBlock1 = void 0;
	    var neccBlock2 = void 0;

	    while (this._version < 40) {
	      this._version++;

	      var index = (this._level - 1) * 4 + (this._version - 1) * 16;

	      neccBlock1 = ErrorCorrection.BLOCKS[index++];
	      neccBlock2 = ErrorCorrection.BLOCKS[index++];
	      dataBlock = ErrorCorrection.BLOCKS[index++];
	      eccBlock = ErrorCorrection.BLOCKS[index];

	      index = dataBlock * (neccBlock1 + neccBlock2) + neccBlock2 - 3 + (this._version <= 9);

	      if (this._valueLength <= index) {
	        break;
	      }
	    }

	    this._dataBlock = dataBlock;
	    this._eccBlock = eccBlock;
	    this._neccBlock1 = neccBlock1;
	    this._neccBlock2 = neccBlock2;

	    /**
	     * The data width is based on version.
	     *
	     * @public
	     * @type {number}
	     */
	    // FIXME: Ensure that it fits instead of being truncated.
	    this.width = 17 + 4 * this._version;

	    /**
	     * The image buffer.
	     *
	     * @public
	     * @type {number[]}
	     */
	    this.buffer = Frame._createArray(this.width * this.width);

	    this._ecc = Frame._createArray(this._dataBlock + (this._dataBlock + this._eccBlock) * (this._neccBlock1 + this._neccBlock2) + this._neccBlock2);
	    this._mask = Frame._createArray((this.width * (this.width + 1) + 1) / 2);

	    this._insertFinders();
	    this._insertAlignments();

	    // Insert single foreground cell.
	    this.buffer[8 + this.width * (this.width - 8)] = 1;

	    this._insertTimingGap();
	    this._reverseMask();
	    this._insertTimingRowAndColumn();
	    this._insertVersion();
	    this._syncMask();
	    this._convertBitStream(this._value.length);
	    this._calculatePolynomial();
	    this._appendEccToData();
	    this._interleaveBlocks();
	    this._pack();
	    this._finish();
	  }

	  _createClass(Frame, [{
	    key: '_addAlignment',
	    value: function _addAlignment(x, y) {
	      this.buffer[x + this.width * y] = 1;

	      for (var i = -2; i < 2; i++) {
	        this.buffer[x + i + this.width * (y - 2)] = 1;
	        this.buffer[x - 2 + this.width * (y + i + 1)] = 1;
	        this.buffer[x + 2 + this.width * (y + i)] = 1;
	        this.buffer[x + i + 1 + this.width * (y + 2)] = 1;
	      }

	      for (var _i = 0; _i < 2; _i++) {
	        this._setMask(x - 1, y + _i);
	        this._setMask(x + 1, y - _i);
	        this._setMask(x - _i, y - 1);
	        this._setMask(x + _i, y + 1);
	      }
	    }
	  }, {
	    key: '_appendData',
	    value: function _appendData(data, dataLength, ecc, eccLength) {
	      for (var i = 0; i < eccLength; i++) {
	        this._stringBuffer[ecc + i] = 0;
	      }

	      for (var _i2 = 0; _i2 < dataLength; _i2++) {
	        var bit = Galois.LOG[this._stringBuffer[data + _i2] ^ this._stringBuffer[ecc]];

	        if (bit !== 255) {
	          for (var j = 1; j < eccLength; j++) {
	            this._stringBuffer[ecc + j - 1] = this._stringBuffer[ecc + j] ^ Galois.EXPONENT[Frame._modN(bit + this._polynomial[eccLength - j])];
	          }
	        } else {
	          for (var _j = ecc; _j < ecc + eccLength; _j++) {
	            this._stringBuffer[_j] = this._stringBuffer[_j + 1];
	          }
	        }

	        this._stringBuffer[ecc + eccLength - 1] = bit === 255 ? 0 : Galois.EXPONENT[Frame._modN(bit + this._polynomial[0])];
	      }
	    }
	  }, {
	    key: '_appendEccToData',
	    value: function _appendEccToData() {
	      var data = 0;
	      var ecc = this._calculateMaxLength();

	      for (var i = 0; i < this._neccBlock1; i++) {
	        this._appendData(data, this._dataBlock, ecc, this._eccBlock);

	        data += this._dataBlock;
	        ecc += this._eccBlock;
	      }

	      for (var _i3 = 0; _i3 < this._neccBlock2; _i3++) {
	        this._appendData(data, this._dataBlock + 1, ecc, this._eccBlock);

	        data += this._dataBlock + 1;
	        ecc += this._eccBlock;
	      }
	    }
	  }, {
	    key: '_applyMask',
	    value: function _applyMask(mask) {
	      var width = this.width;

	      switch (mask) {
	        case 0:
	          for (var y = 0; y < width; y++) {
	            for (var x = 0; x < width; x++) {
	              if (!(x + y & 1) && !this._isMasked(x, y)) {
	                this.buffer[x + y * width] ^= 1;
	              }
	            }
	          }

	          break;
	        case 1:
	          for (var _y = 0; _y < width; _y++) {
	            for (var _x = 0; _x < width; _x++) {
	              if (!(_y & 1) && !this._isMasked(_x, _y)) {
	                this.buffer[_x + _y * width] ^= 1;
	              }
	            }
	          }

	          break;
	        case 2:
	          for (var _y2 = 0; _y2 < width; _y2++) {
	            for (var r3x = 0, _x2 = 0; _x2 < width; _x2++, r3x++) {
	              if (r3x === 3) {
	                r3x = 0;
	              }

	              if (!r3x && !this._isMasked(_x2, _y2)) {
	                this.buffer[_x2 + _y2 * width] ^= 1;
	              }
	            }
	          }

	          break;
	        case 3:
	          for (var r3y = 0, _y3 = 0; _y3 < width; _y3++, r3y++) {
	            if (r3y === 3) {
	              r3y = 0;
	            }

	            for (var _r3x = r3y, _x3 = 0; _x3 < width; _x3++, _r3x++) {
	              if (_r3x === 3) {
	                _r3x = 0;
	              }

	              if (!_r3x && !this._isMasked(_x3, _y3)) {
	                this.buffer[_x3 + _y3 * width] ^= 1;
	              }
	            }
	          }

	          break;
	        case 4:
	          for (var _y4 = 0; _y4 < width; _y4++) {
	            for (var _r3x2 = 0, _r3y = _y4 >> 1 & 1, _x4 = 0; _x4 < width; _x4++, _r3x2++) {
	              if (_r3x2 === 3) {
	                _r3x2 = 0;
	                _r3y = !_r3y;
	              }

	              if (!_r3y && !this._isMasked(_x4, _y4)) {
	                this.buffer[_x4 + _y4 * width] ^= 1;
	              }
	            }
	          }

	          break;
	        case 5:
	          for (var _r3y2 = 0, _y5 = 0; _y5 < width; _y5++, _r3y2++) {
	            if (_r3y2 === 3) {
	              _r3y2 = 0;
	            }

	            for (var _r3x3 = 0, _x5 = 0; _x5 < width; _x5++, _r3x3++) {
	              if (_r3x3 === 3) {
	                _r3x3 = 0;
	              }

	              if (!((_x5 & _y5 & 1) + !(!_r3x3 | !_r3y2)) && !this._isMasked(_x5, _y5)) {
	                this.buffer[_x5 + _y5 * width] ^= 1;
	              }
	            }
	          }

	          break;
	        case 6:
	          for (var _r3y3 = 0, _y6 = 0; _y6 < width; _y6++, _r3y3++) {
	            if (_r3y3 === 3) {
	              _r3y3 = 0;
	            }

	            for (var _r3x4 = 0, _x6 = 0; _x6 < width; _x6++, _r3x4++) {
	              if (_r3x4 === 3) {
	                _r3x4 = 0;
	              }

	              if (!((_x6 & _y6 & 1) + (_r3x4 && _r3x4 === _r3y3) & 1) && !this._isMasked(_x6, _y6)) {
	                this.buffer[_x6 + _y6 * width] ^= 1;
	              }
	            }
	          }

	          break;
	        case 7:
	          for (var _r3y4 = 0, _y7 = 0; _y7 < width; _y7++, _r3y4++) {
	            if (_r3y4 === 3) {
	              _r3y4 = 0;
	            }

	            for (var _r3x5 = 0, _x7 = 0; _x7 < width; _x7++, _r3x5++) {
	              if (_r3x5 === 3) {
	                _r3x5 = 0;
	              }

	              if (!((_r3x5 && _r3x5 === _r3y4) + (_x7 + _y7 & 1) & 1) && !this._isMasked(_x7, _y7)) {
	                this.buffer[_x7 + _y7 * width] ^= 1;
	              }
	            }
	          }

	          break;
	      }
	    }
	  }, {
	    key: '_calculateMaxLength',
	    value: function _calculateMaxLength() {
	      return this._dataBlock * (this._neccBlock1 + this._neccBlock2) + this._neccBlock2;
	    }
	  }, {
	    key: '_calculatePolynomial',
	    value: function _calculatePolynomial() {
	      this._polynomial[0] = 1;

	      for (var i = 0; i < this._eccBlock; i++) {
	        this._polynomial[i + 1] = 1;

	        for (var j = i; j > 0; j--) {
	          this._polynomial[j] = this._polynomial[j] ? this._polynomial[j - 1] ^ Galois.EXPONENT[Frame._modN(Galois.LOG[this._polynomial[j]] + i)] : this._polynomial[j - 1];
	        }

	        this._polynomial[0] = Galois.EXPONENT[Frame._modN(Galois.LOG[this._polynomial[0]] + i)];
	      }

	      // Use logs for generator polynomial to save calculation step.
	      for (var _i4 = 0; _i4 <= this._eccBlock; _i4++) {
	        this._polynomial[_i4] = Galois.LOG[this._polynomial[_i4]];
	      }
	    }
	  }, {
	    key: '_checkBadness',
	    value: function _checkBadness() {
	      var bad = 0;
	      var width = this.width;

	      // Blocks of same colour.
	      for (var y = 0; y < width - 1; y++) {
	        for (var x = 0; x < width - 1; x++) {
	          // All foreground colour.
	          if (this.buffer[x + width * y] && this.buffer[x + 1 + width * y] && this.buffer[x + width * (y + 1)] && this.buffer[x + 1 + width * (y + 1)] ||
	          // All background colour.
	          !(this.buffer[x + width * y] || this.buffer[x + 1 + width * y] || this.buffer[x + width * (y + 1)] || this.buffer[x + 1 + width * (y + 1)])) {
	            bad += Frame.N2;
	          }
	        }
	      }

	      var bw = 0;

	      // X runs.
	      for (var _y8 = 0; _y8 < width; _y8++) {
	        var h = 0;

	        this._badness[0] = 0;

	        for (var b = 0, _x8 = 0; _x8 < width; _x8++) {
	          var b1 = this.buffer[_x8 + width * _y8];

	          if (b === b1) {
	            this._badness[h]++;
	          } else {
	            this._badness[++h] = 1;
	          }

	          b = b1;
	          bw += b ? 1 : -1;
	        }

	        bad += this._getBadness(h);
	      }

	      if (bw < 0) {
	        bw = -bw;
	      }

	      var count = 0;
	      var big = bw;
	      big += big << 2;
	      big <<= 1;

	      while (big > width * width) {
	        big -= width * width;
	        count++;
	      }

	      bad += count * Frame.N4;

	      // Y runs.
	      for (var _x9 = 0; _x9 < width; _x9++) {
	        var _h = 0;

	        this._badness[0] = 0;

	        for (var _b = 0, _y9 = 0; _y9 < width; _y9++) {
	          var _b2 = this.buffer[_x9 + width * _y9];

	          if (_b === _b2) {
	            this._badness[_h]++;
	          } else {
	            this._badness[++_h] = 1;
	          }

	          _b = _b2;
	        }

	        bad += this._getBadness(_h);
	      }

	      return bad;
	    }
	  }, {
	    key: '_convertBitStream',
	    value: function _convertBitStream(length) {
	      // Convert string to bit stream. 8-bit data to QR-coded 8-bit data (numeric, alphanumeric, or kanji not supported).
	      for (var i = 0; i < length; i++) {
	        this._ecc[i] = this._value.charCodeAt(i);
	      }

	      this._stringBuffer = this._ecc.slice(0);

	      var maxLength = this._calculateMaxLength();

	      if (length >= maxLength - 2) {
	        length = maxLength - 2;

	        if (this._version > 9) {
	          length--;
	        }
	      }

	      // Shift and re-pack to insert length prefix.
	      var index = length;

	      if (this._version > 9) {
	        this._stringBuffer[index + 2] = 0;
	        this._stringBuffer[index + 3] = 0;

	        while (index--) {
	          var bit = this._stringBuffer[index];

	          this._stringBuffer[index + 3] |= 255 & bit << 4;
	          this._stringBuffer[index + 2] = bit >> 4;
	        }

	        this._stringBuffer[2] |= 255 & length << 4;
	        this._stringBuffer[1] = length >> 4;
	        this._stringBuffer[0] = 0x40 | length >> 12;
	      } else {
	        this._stringBuffer[index + 1] = 0;
	        this._stringBuffer[index + 2] = 0;

	        while (index--) {
	          var _bit = this._stringBuffer[index];

	          this._stringBuffer[index + 2] |= 255 & _bit << 4;
	          this._stringBuffer[index + 1] = _bit >> 4;
	        }

	        this._stringBuffer[1] |= 255 & length << 4;
	        this._stringBuffer[0] = 0x40 | length >> 4;
	      }

	      // Fill to end with pad pattern.
	      index = length + 3 - (this._version < 10);

	      while (index < maxLength) {
	        this._stringBuffer[index++] = 0xec;
	        this._stringBuffer[index++] = 0x11;
	      }
	    }
	  }, {
	    key: '_getBadness',
	    value: function _getBadness(length) {
	      var badRuns = 0;

	      for (var i = 0; i <= length; i++) {
	        if (this._badness[i] >= 5) {
	          badRuns += Frame.N1 + this._badness[i] - 5;
	        }
	      }

	      // FBFFFBF as in finder.
	      for (var _i5 = 3; _i5 < length - 1; _i5 += 2) {
	        if (this._badness[_i5 - 2] === this._badness[_i5 + 2] && this._badness[_i5 + 2] === this._badness[_i5 - 1] && this._badness[_i5 - 1] === this._badness[_i5 + 1] && this._badness[_i5 - 1] * 3 === this._badness[_i5] && (
	        // Background around the foreground pattern? Not part of the specs.
	        this._badness[_i5 - 3] === 0 || _i5 + 3 > length || this._badness[_i5 - 3] * 3 >= this._badness[_i5] * 4 || this._badness[_i5 + 3] * 3 >= this._badness[_i5] * 4)) {
	          badRuns += Frame.N3;
	        }
	      }

	      return badRuns;
	    }
	  }, {
	    key: '_finish',
	    value: function _finish() {
	      // Save pre-mask copy of frame.
	      this._stringBuffer = this.buffer.slice(0);

	      var bit = 0;
	      var i = void 0;
	      var mask = 30000;

	      /*
	       * Using for instead of while since in original Arduino code if an early mask was "good enough" it wouldn't try for
	       * a better one since they get more complex and take longer.
	       */
	      for (i = 0; i < 8; i++) {
	        // Returns foreground-background imbalance.
	        this._applyMask(i);

	        var currentMask = this._checkBadness();

	        // Is current mask better than previous best?
	        if (currentMask < mask) {
	          mask = currentMask;
	          bit = i;
	        }

	        // Don't increment "i" to a void redoing mask.
	        if (bit === 7) {
	          break;
	        }

	        // Reset for next pass.
	        this.buffer = this._stringBuffer.slice(0);
	      }

	      // Redo best mask as none were "good enough" (i.e. last wasn't bit).
	      if (bit !== i) {
	        this._applyMask(bit);
	      }

	      // Add in final mask/ECC level bytes.
	      mask = ErrorCorrection.FINAL_FORMAT[bit + (this._level - 1 << 3)];

	      // Low byte.
	      for (i = 0; i < 8; i++, mask >>= 1) {
	        if (mask & 1) {
	          this.buffer[this.width - 1 - i + this.width * 8] = 1;

	          if (i < 6) {
	            this.buffer[8 + this.width * i] = 1;
	          } else {
	            this.buffer[8 + this.width * (i + 1)] = 1;
	          }
	        }
	      }

	      // High byte.
	      for (i = 0; i < 7; i++, mask >>= 1) {
	        if (mask & 1) {
	          this.buffer[8 + this.width * (this.width - 7 + i)] = 1;

	          if (i) {
	            this.buffer[6 - i + this.width * 8] = 1;
	          } else {
	            this.buffer[7 + this.width * 8] = 1;
	          }
	        }
	      }
	    }
	  }, {
	    key: '_interleaveBlocks',
	    value: function _interleaveBlocks() {
	      var maxLength = this._calculateMaxLength();
	      var i = void 0;
	      var k = 0;

	      for (i = 0; i < this._dataBlock; i++) {
	        for (var j = 0; j < this._neccBlock1; j++) {
	          this._ecc[k++] = this._stringBuffer[i + j * this._dataBlock];
	        }

	        for (var _j2 = 0; _j2 < this._neccBlock2; _j2++) {
	          this._ecc[k++] = this._stringBuffer[this._neccBlock1 * this._dataBlock + i + _j2 * (this._dataBlock + 1)];
	        }
	      }

	      for (var _j3 = 0; _j3 < this._neccBlock2; _j3++) {
	        this._ecc[k++] = this._stringBuffer[this._neccBlock1 * this._dataBlock + i + _j3 * (this._dataBlock + 1)];
	      }

	      for (i = 0; i < this._eccBlock; i++) {
	        for (var _j4 = 0; _j4 < this._neccBlock1 + this._neccBlock2; _j4++) {
	          this._ecc[k++] = this._stringBuffer[maxLength + i + _j4 * this._eccBlock];
	        }
	      }

	      this._stringBuffer = this._ecc;
	    }
	  }, {
	    key: '_insertAlignments',
	    value: function _insertAlignments() {
	      var width = this.width;

	      if (this._version > 1) {
	        var i = Alignment.BLOCK[this._version];
	        var y = width - 7;

	        for (;;) {
	          var x = width - 7;

	          while (x > i - 3) {
	            this._addAlignment(x, y);

	            if (x < i) {
	              break;
	            }

	            x -= i;
	          }

	          if (y <= i + 9) {
	            break;
	          }

	          y -= i;

	          this._addAlignment(6, y);
	          this._addAlignment(y, 6);
	        }
	      }
	    }
	  }, {
	    key: '_insertFinders',
	    value: function _insertFinders() {
	      var width = this.width;

	      for (var i = 0; i < 3; i++) {
	        var j = 0;
	        var y = 0;

	        if (i === 1) {
	          j = width - 7;
	        }
	        if (i === 2) {
	          y = width - 7;
	        }

	        this.buffer[y + 3 + width * (j + 3)] = 1;

	        for (var x = 0; x < 6; x++) {
	          this.buffer[y + x + width * j] = 1;
	          this.buffer[y + width * (j + x + 1)] = 1;
	          this.buffer[y + 6 + width * (j + x)] = 1;
	          this.buffer[y + x + 1 + width * (j + 6)] = 1;
	        }

	        for (var _x10 = 1; _x10 < 5; _x10++) {
	          this._setMask(y + _x10, j + 1);
	          this._setMask(y + 1, j + _x10 + 1);
	          this._setMask(y + 5, j + _x10);
	          this._setMask(y + _x10 + 1, j + 5);
	        }

	        for (var _x11 = 2; _x11 < 4; _x11++) {
	          this.buffer[y + _x11 + width * (j + 2)] = 1;
	          this.buffer[y + 2 + width * (j + _x11 + 1)] = 1;
	          this.buffer[y + 4 + width * (j + _x11)] = 1;
	          this.buffer[y + _x11 + 1 + width * (j + 4)] = 1;
	        }
	      }
	    }
	  }, {
	    key: '_insertTimingGap',
	    value: function _insertTimingGap() {
	      var width = this.width;

	      for (var y = 0; y < 7; y++) {
	        this._setMask(7, y);
	        this._setMask(width - 8, y);
	        this._setMask(7, y + width - 7);
	      }

	      for (var x = 0; x < 8; x++) {
	        this._setMask(x, 7);
	        this._setMask(x + width - 8, 7);
	        this._setMask(x, width - 8);
	      }
	    }
	  }, {
	    key: '_insertTimingRowAndColumn',
	    value: function _insertTimingRowAndColumn() {
	      var width = this.width;

	      for (var x = 0; x < width - 14; x++) {
	        if (x & 1) {
	          this._setMask(8 + x, 6);
	          this._setMask(6, 8 + x);
	        } else {
	          this.buffer[8 + x + width * 6] = 1;
	          this.buffer[6 + width * (8 + x)] = 1;
	        }
	      }
	    }
	  }, {
	    key: '_insertVersion',
	    value: function _insertVersion() {
	      var width = this.width;

	      if (this._version > 6) {
	        var i = Version.BLOCK[this._version - 7];
	        var j = 17;

	        for (var x = 0; x < 6; x++) {
	          for (var y = 0; y < 3; y++, j--) {
	            if (1 & (j > 11 ? this._version >> j - 12 : i >> j)) {
	              this.buffer[5 - x + width * (2 - y + width - 11)] = 1;
	              this.buffer[2 - y + width - 11 + width * (5 - x)] = 1;
	            } else {
	              this._setMask(5 - x, 2 - y + width - 11);
	              this._setMask(2 - y + width - 11, 5 - x);
	            }
	          }
	        }
	      }
	    }
	  }, {
	    key: '_isMasked',
	    value: function _isMasked(x, y) {
	      var bit = Frame._getMaskBit(x, y);

	      return this._mask[bit] === 1;
	    }
	  }, {
	    key: '_pack',
	    value: function _pack() {
	      var x = this.width - 1;
	      var y = this.width - 1;
	      var k = 1;
	      var v = 1;

	      // Interleaved data and ECC codes.
	      var length = (this._dataBlock + this._eccBlock) * (this._neccBlock1 + this._neccBlock2) + this._neccBlock2;

	      for (var i = 0; i < length; i++) {
	        var bit = this._stringBuffer[i];

	        for (var j = 0; j < 8; j++, bit <<= 1) {
	          if (0x80 & bit) {
	            this.buffer[x + this.width * y] = 1;
	          }

	          // Find next fill position.
	          do {
	            if (v) {
	              x--;
	            } else {
	              x++;

	              if (k) {
	                if (y !== 0) {
	                  y--;
	                } else {
	                  x -= 2;
	                  k = !k;

	                  if (x === 6) {
	                    x--;
	                    y = 9;
	                  }
	                }
	              } else if (y !== this.width - 1) {
	                y++;
	              } else {
	                x -= 2;
	                k = !k;

	                if (x === 6) {
	                  x--;
	                  y -= 8;
	                }
	              }
	            }

	            v = !v;
	          } while (this._isMasked(x, y));
	        }
	      }
	    }
	  }, {
	    key: '_reverseMask',
	    value: function _reverseMask() {
	      var width = this.width;

	      for (var x = 0; x < 9; x++) {
	        this._setMask(x, 8);
	      }

	      for (var _x12 = 0; _x12 < 8; _x12++) {
	        this._setMask(_x12 + width - 8, 8);
	        this._setMask(8, _x12);
	      }

	      for (var y = 0; y < 7; y++) {
	        this._setMask(8, y + width - 7);
	      }
	    }
	  }, {
	    key: '_setMask',
	    value: function _setMask(x, y) {
	      var bit = Frame._getMaskBit(x, y);

	      this._mask[bit] = 1;
	    }
	  }, {
	    key: '_syncMask',
	    value: function _syncMask() {
	      var width = this.width;

	      for (var y = 0; y < width; y++) {
	        for (var x = 0; x <= y; x++) {
	          if (this.buffer[x + width * y]) {
	            this._setMask(x, y);
	          }
	        }
	      }
	    }
	  }]);

	  return Frame;
	}();



	/**
	 * The options used by {@link Frame}.
	 *
	 * @typedef {Object} Frame~Options
	 * @property {string} level - The ECC level to be used.
	 * @property {string} value - The value to be encoded.
	 */

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * An implementation of {@link Renderer} for working with <code>img</code> elements.
	 *
	 * This depends on {@link CanvasRenderer} being executed first as this implementation simply applies the data URL from
	 * the rendered <code>canvas</code> element as the <code>src</code> for the <code>img</code> element being rendered.
	 *
	 * @public
	 * @extends Renderer
	 */

	var ImageRenderer = function (_Renderer) {
	  _inherits(ImageRenderer, _Renderer);

	  function ImageRenderer() {
	    _classCallCheck(this, ImageRenderer);

	    return _possibleConstructorReturn(this, (ImageRenderer.__proto__ || _Object$getPrototypeOf(ImageRenderer)).apply(this, arguments));
	  }

	  _createClass(ImageRenderer, [{
	    key: 'draw',


	    /**
	     * @override
	     */
	    value: function draw() {
	      this.element.src = this.qrious.toDataURL();
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'reset',
	    value: function reset() {
	      this.element.src = '';
	    }

	    /**
	     * @override
	     */

	  }, {
	    key: 'resize',
	    value: function resize() {
	      this.element.width = this.element.height = this.qrious.size;
	    }
	  }]);

	  return ImageRenderer;
	}(Renderer);

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Defines an available option while also configuring how values are applied to the target object.
	 *
	 * While a value associated with an option can be changed on the target object, the option definition itself is
	 * immutable.
	 *
	 * @public
	 */
	var Option = function () {

	  /**
	   * Creates a new instance of {@link Option} based on the <code>name</code> provided.
	   *
	   * Optionally, a <code>defaultValue</code> can be specified as well a <code>valueTransformer</code> and
	   * <code>fieldNameResolver</code> for greater control over how the option value is applied.
	   *
	   * If no <code>valueTransformer</code> is specified, then any specified option will be applied directly.
	   *
	   * If no <code>fieldNameResolver</code> is specified, then the field name will be resolved to <code>name</code>
	   * prefixed with a single underscore when the option is applied.
	   *
	   * @param {string} name - the name to be used
	   * @param {*} [defaultValue] - the default value to be used
	   * @param {Option~ValueTransformer} [valueTransformer] - the value transformer to be used
	   * @param {Option~FieldNameResolver} [fieldNameResolver] - the field name resolver to be used
	   * @public
	   */
	  function Option(name, defaultValue, valueTransformer, fieldNameResolver) {
	    _classCallCheck(this, Option);

	    this._name = name;
	    this._defaultValue = defaultValue;
	    this._valueTransformer = valueTransformer;
	    this._fieldName = typeof fieldNameResolver === 'function' ? fieldNameResolver(this) : '_' + name;
	  }

	  /**
	   * Transforms the specified <code>value</code> so that it can be applied for this {@link Option}.
	   *
	   * If a value transformer has been specified for this {@link Option}, it will be called upon to transform
	   * <code>value</code>. Otherwise, <code>value</code> will be returned directly.
	   *
	   * @param {*} value - the value to be transformed
	   * @return {*} The transformed value or <code>value</code> if no value transformer is specified.
	   * @public
	   */


	  _createClass(Option, [{
	    key: 'transform',
	    value: function transform(value) {
	      var transformer = this._valueTransformer;
	      if (typeof transformer === 'function') {
	        return transformer(value, this);
	      }

	      return value;
	    }

	    /**
	     * Returns the field name for this {@link Option}.
	     *
	     * @return {string} The field name.
	     * @public
	     */

	  }, {
	    key: 'fieldName',
	    get: function get() {
	      return this._fieldName;
	    }

	    /**
	     * Returns the name for this {@link Option}.
	     *
	     * @return {string} The name.
	     * @public
	     */

	  }, {
	    key: 'name',
	    get: function get() {
	      return this._name;
	    }

	    /**
	     * Returns the default value for this {@link Option}.
	     *
	     * @return {*} The default value.
	     * @public
	     */

	  }, {
	    key: 'defaultValue',
	    get: function get() {
	      return this._defaultValue;
	    }
	  }]);

	  return Option;
	}();



	/**
	 * Returns the field name to which the specified <code>option</code> is associated on the target object.
	 *
	 * The resolved name will be used to identify the field that values for <code>option</code> are to be read from and
	 * written to.
	 *
	 * This function will only called once for <code>option</code>, upon initialization.
	 *
	 * @callback Option~FieldNameResolver
	 * @param {Option} option - the {@link Option} whose field name is to be resolved
	 * @return {string} The resolved field name for <code>option</code>.
	 */

	/**
	 * Returns a transformed value for the specified <code>value</code> to be applied for the <code>option</code> provided.
	 *
	 * @callback Option~ValueTransformer
	 * @param {*} value - the value to be transformed
	 * @param {Option} option - the {@link Option} for which <code>value</code> is being transformed
	 * @return {*} The transform value.
	 */

	var isEnum$1    = _objectPie.f;
	var _objectToArray = function(isEntries){
	  return function(it){
	    var O      = _toIobject(it)
	      , keys   = _objectKeys(O)
	      , length = keys.length
	      , i      = 0
	      , result = []
	      , key;
	    while(length > i)if(isEnum$1.call(O, key = keys[i++])){
	      result.push(isEntries ? [key, O[key]] : O[key]);
	    } return result;
	  };
	};

	// https://github.com/tc39/proposal-object-values-entries
	var $values = _objectToArray(false);

	_export(_export.S, 'Object', {
	  values: function values(it){
	    return $values(it);
	  }
	});

	var values$1 = _core.Object.values;

	var values = createCommonjsModule(function (module) {
	module.exports = { "default": values$1, __esModule: true };
	});

	var _Object$values = unwrapExports(values);

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * Manages multiple {@link Option} instances that are intended to be used by multiple implementations.
	 *
	 * Although the option definitions are shared between targets, the values are maintained on the targets themselves.
	 *
	 * While a value associated with each option can be changed on the target objects, the manager and the option
	 * definitions themselves are immutable.
	 *
	 * @public
	 */

	var OptionManager = function () {
	  _createClass(OptionManager, null, [{
	    key: '_get',
	    value: function _get(option, target) {
	      return target[option.fieldName];
	    }
	  }, {
	    key: '_set',
	    value: function _set(option, value, target) {
	      var fieldName = option.fieldName;
	      var oldValue = target[fieldName];
	      var newValue = option.transform(value != null ? value : option.defaultValue);

	      target[fieldName] = newValue;

	      return newValue !== oldValue;
	    }

	    /**
	     * Creates a new instance of {@link OptionManager} for the specified available <code>options</code>.
	     *
	     * @param {Option[]} options - the options to be used
	     * @public
	     */

	  }]);

	  function OptionManager(options) {
	    var _this = this;

	    _classCallCheck(this, OptionManager);

	    this._options = {};

	    options.forEach(function (option) {
	      _this._options[option.name] = option;
	    });
	  }

	  /**
	   * Sets the default values for all of the available options on the <code>target</code> object provided.
	   *
	   * @param {Object} target - the object on which the default values are to be set for each available option
	   * @return {void}
	   * @public
	   */


	  _createClass(OptionManager, [{
	    key: 'applyDefaults',
	    value: function applyDefaults(target) {
	      var options = this._options;

	      for (var name in options) {
	        if (Utilities.hasOwn(options, name)) {
	          var option = options[name];

	          OptionManager._set(option, option.defaultValue, target);
	        }
	      }
	    }

	    /**
	     * Returns whether an option with the specified <code>name</code> is available.
	     *
	     * @param {string} name - the name of the {@link Option} whose existence is to be checked
	     * @return {boolean} <code>true</code> if an {@link Option} exists with <code>name</code>; otherwise
	     * <code>false</code>.
	     * @public
	     */

	  }, {
	    key: 'exists',
	    value: function exists(name) {
	      return this._options[name] != null;
	    }

	    /**
	     * Returns the value of the option with the specified <code>name</code> on the <code>target</code> object provided.
	     *
	     * @param {string} name - the name of the {@link Option} whose value on <code>target</code> is to be returned
	     * @param {Object} target - the object from which the value of the named {@link Option} is to be returned
	     * @return {*} The value of the {@link Option} with <code>name</code> on <code>target</code>.
	     * @public
	     */

	  }, {
	    key: 'get',
	    value: function get(name, target) {
	      return OptionManager._get(this._options[name], target);
	    }

	    /**
	     * Returns a copy of all of the available options on the <code>target</code> object provided.
	     *
	     * @param {Object} target - the object from which the option name/value pairs are to be returned
	     * @return {Object.<string, *>} A hash containing the name/value pairs of all options on <code>target</code>.
	     * @public
	     */

	  }, {
	    key: 'getAll',
	    value: function getAll(target) {
	      var options = this._options;
	      var result = {};

	      for (var name in options) {
	        if (Utilities.hasOwn(options, name)) {
	          result[name] = OptionManager._get(options[name], target);
	        }
	      }

	      return result;
	    }

	    /**
	     * Sets the value of the option with the specified <code>name</code> on the <code>target</code> object provided to
	     * <code>value</code>.
	     *
	     * This method will throw an error if <code>name</code> does not match an available option.
	     *
	     * If <code>value</code> is <code>null</code> and the {@link Option} has a default value configured, then that default
	     * value will be used instead. If the {@link Option} also has a value transformer configured, it will be used to
	     * transform whichever value was determined to be used.
	     *
	     * This method returns whether the value of the underlying field on <code>target</code> was changed as a result.
	     *
	     * @param {string} name - the name of the {@link Option} whose value is to be set
	     * @param {*} value - the value to be set for the named {@link Option} on <code>target</code>
	     * @param {Object} target - the object on which <code>value</code> is to be set for the named {@link Option}
	     * @return {boolean} <code>true</code> if the underlying field on <code>target</code> was changed; otherwise
	     * <code>false</code>.
	     * @throws {Error} If no {@link Option} is being managed with <code>name</code>.
	     * @public
	     */

	  }, {
	    key: 'set',
	    value: function set(name, value, target) {
	      var option = this._options[name];
	      if (!option) {
	        throw new Error('Invalid option: ' + name);
	      }

	      return OptionManager._set(option, value, target);
	    }

	    /**
	     * Sets all of the specified <code>options</code> on the <code>target</code> object provided to their corresponding
	     * values.
	     *
	     * This method will throw an error if any of the names within <code>options</code> does not match an available option.
	     *
	     * If any value within <code>options</code> is <code>null</code> and the corresponding {@link Option} has a default
	     * value configured, then that default value will be used instead. If an {@link Option} also has a value transformer
	     * configured, it will be used to transform whichever value was determined to be used.
	     *
	     * This method returns whether the value for any of the underlying fields on <code>target</code> were changed as a
	     * result.
	     *
	     * @param {Object.<string, *>} options - the name/value pairs of options to be set
	     * @param {Object} target - the object on which the options are to be set
	     * @return {boolean} <code>true</code> if any of the underlying fields on <code>target</code> were changed; otherwise
	     * <code>false</code>.
	     * @throws {Error} If no {@link Option} is being managed with for any of the names within <code>options</code>.
	     * @public
	     */

	  }, {
	    key: 'setAll',
	    value: function setAll(options, target) {
	      if (!options) {
	        return false;
	      }

	      var changed = false;

	      for (var name in options) {
	        if (Utilities.hasOwn(options, name) && this.set(name, options[name], target)) {
	          changed = true;
	        }
	      }

	      return changed;
	    }

	    /**
	     * Returns a copy of the available options for this {@link OptionManager}.
	     *
	     * @return {Option[]} The available options.
	     * @public
	     */

	  }, {
	    key: 'options',
	    get: function get() {
	      return _Object$values(this._options);
	    }
	  }]);

	  return OptionManager;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	/**
	 * A basic manager for {@link Service} implementations that are mapped to simple names.
	 *
	 * @public
	 */
	var ServiceManager = function () {

	  /**
	   * Creates a new instance of {@link ServiceManager}.
	   *
	   * @public
	   */
	  function ServiceManager() {
	    _classCallCheck(this, ServiceManager);

	    this._services = {};
	  }

	  /**
	   * Returns the {@link Service} being managed with the specified <code>name</code>.
	   *
	   * @param {string} name - the name of the {@link Service} to be returned
	   * @return {Service} The {@link Service} is being managed with <code>name</code>.
	   * @throws {Error} If no {@link Service} is being managed with <code>name</code>.
	   * @public
	   */


	  _createClass(ServiceManager, [{
	    key: "getService",
	    value: function getService(name) {
	      var service = this._services[name];
	      if (!service) {
	        throw new Error("Service is not being managed with name: " + name);
	      }

	      return service;
	    }

	    /**
	     * Sets the {@link Service} implementation to be managed for the specified <code>name</code> to the
	     * <code>service</code> provided.
	     *
	     * @param {string} name - the name of the {@link Service} to be managed with <code>name</code>
	     * @param {Service} service - the {@link Service} implementation to be managed
	     * @return {void}
	     * @throws {Error} If a {@link Service} is already being managed with the same <code>name</code>.
	     * @public
	     */

	  }, {
	    key: "setService",
	    value: function setService(name, service) {
	      if (this._services[name]) {
	        throw new Error("Service is already managed with name: " + name);
	      }

	      if (service) {
	        this._services[name] = service;
	      }
	    }
	  }]);

	  return ServiceManager;
	}();

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	var optionManager = new OptionManager([new Option('background', 'white'), new Option('backgroundAlpha', 1, Utilities.abs), new Option('element'), new Option('foreground', 'black'), new Option('foregroundAlpha', 1, Utilities.abs), new Option('level', 'L', Utilities.toUpperCase), new Option('mime', 'image/png'), new Option('padding', null, Utilities.abs), new Option('size', 100, Utilities.abs), new Option('value', '')]);
	var serviceManager = new ServiceManager();

	/**
	 * Enables configuration of a QR code generator which uses HTML5 <code>canvas</code> for rendering.
	 *
	 * @public
	 */

	var QRious$1 = function () {
	  _createClass(QRious, null, [{
	    key: 'use',


	    /**
	     * Configures the <code>service</code> provided to be used by all {@link QRious} instances.
	     *
	     * @param {Service} service - the {@link Service} to be configured
	     * @return {void}
	     * @throws {Error} If a {@link Service} has already been configured with the same name.
	     * @public
	     * @static
	     */
	    value: function use(service) {
	      serviceManager.setService(service.getName(), service);
	    }

	    /**
	     * Creates a new instance of {@link QRious} based on the <code>options</code> provided.
	     *
	     * @param {QRious~Options} [options] - the options to be used
	     * @throws {Error} If any <code>options</code> are invalid.
	     * @public
	     */

	  }, {
	    key: 'DEFAULTS',


	    /**
	     * Returns the default options for {@link QRious}.
	     *
	     * @return {QRious~Options} The default options.
	     * @deprecated Since 2.3.0
	     * @public
	     * @static
	     */
	    get: function get() {
	      var result = {};

	      optionManager.options.forEach(function (option) {
	        result[option.name] = option.defaultValue;
	      });

	      return result;
	    }

	    /**
	     * Returns the current version of {@link QRious}.
	     *
	     * @return {string} The current version.
	     * @public
	     * @static
	     */

	  }, {
	    key: 'VERSION',
	    get: function get() {
	      return '2.3.0';
	    }
	  }]);

	  function QRious(options) {
	    _classCallCheck(this, QRious);

	    optionManager.applyDefaults(this);
	    optionManager.setAll(options, this);

	    var element = optionManager.get('element', this);
	    var elementService = serviceManager.getService('element');
	    var canvas = element && elementService.isCanvas(element) ? element : elementService.createCanvas();
	    var image = element && elementService.isImage(element) ? element : elementService.createImage();

	    this._canvasRenderer = new CanvasRenderer(this, canvas, true);
	    this._imageRenderer = new ImageRenderer(this, image, image === element);

	    this.update();
	  }

	  /**
	   * Returns all of the options configured for this {@link QRious}.
	   *
	   * Any changes made to the returned object will not be reflected in the options themselves or their corresponding
	   * underlying fields.
	   *
	   * @return {Object.<string, *>} A copy of the applied options.
	   * @public
	   */


	  _createClass(QRious, [{
	    key: 'get',
	    value: function get() {
	      return optionManager.getAll(this);
	    }

	    /**
	     * Sets all of the specified <code>options</code> and automatically updates this {@link QRious} if any of the
	     * underlying fields are changed as a result.
	     *
	     * This is the preferred method for updating multiple options at one time to avoid unnecessary updates between
	     * changes.
	     *
	     * @param {QRious~Options} options - the options to be set
	     * @return {void}
	     * @throws {Error} If any <code>options</code> are invalid.
	     * @public
	     */

	  }, {
	    key: 'set',
	    value: function set(options) {
	      if (optionManager.setAll(options, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the image data URI for the generated QR code using the <code>mime</code> provided.
	     *
	     * @param {string} [mime] - the MIME type for the image
	     * @return {string} The image data URI for the QR code.
	     * @public
	     */

	  }, {
	    key: 'toDataURL',
	    value: function toDataURL(mime) {
	      return this.canvas.toDataURL(mime || this.mime);
	    }

	    /**
	     * Updates this {@link QRious} by generating a new {@link Frame} and re-rendering the QR code.
	     *
	     * @return {void}
	     * @protected
	     */

	  }, {
	    key: 'update',
	    value: function update() {
	      var frame = new Frame({
	        level: this.level,
	        value: this.value
	      });

	      this._canvasRenderer.render(frame);
	      this._imageRenderer.render(frame);
	    }

	    /**
	     * Returns the background color for the QR code.
	     *
	     * @return {string} The background color.
	     * @public
	     */

	  }, {
	    key: 'background',
	    get: function get() {
	      return optionManager.get('background', this);
	    }

	    /**
	     * Sets the background color for the QR code to <code>background</code> and automatically updates this {@link QRious}
	     * if the underlying field is changed as a result.
	     *
	     * @param {string} [background="white"] - the background color to be set
	     * @public
	     */
	    ,
	    set: function set(background) {
	      if (optionManager.set('background', background, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the background alpha for the QR code.
	     *
	     * @return {number} The background alpha.
	     * @public
	     */

	  }, {
	    key: 'backgroundAlpha',
	    get: function get() {
	      return optionManager.get('backgroundAlpha', this);
	    }

	    /**
	     * Sets the background alpha for the QR code to <code>backgroundAlpha</code> and automatically updates this
	     * {@link QRious} if the underlying field is changed as a result.
	     *
	     * @param {number} [backgroundAlpha=1] - the background alpha to be set
	     * @public
	     */
	    ,
	    set: function set(backgroundAlpha) {
	      if (optionManager.set('backgroundAlpha', backgroundAlpha, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the <code>canvas</code> element being used to render the QR code for this {@link QRious}.
	     *
	     * @return {*} The <code>canvas</code> element.
	     * @public
	     */

	  }, {
	    key: 'canvas',
	    get: function get() {
	      return this._canvasRenderer.getElement();
	    }

	    /**
	     * Returns the foreground color for the QR code.
	     *
	     * @return {string} The foreground color.
	     * @public
	     */

	  }, {
	    key: 'foreground',
	    get: function get() {
	      return optionManager.get('foreground', this);
	    }

	    /**
	     * Sets the foreground color for the QR code to <code>foreground</code> and automatically updates this {@link QRious}
	     * if the underlying field is changed as a result.
	     *
	     * @param {string} [foreground="black"] - the foreground color to be set
	     * @public
	     */
	    ,
	    set: function set(foreground) {
	      if (optionManager.set('foreground', foreground, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the foreground alpha for the QR code.
	     *
	     * @return {number} The foreground alpha.
	     * @public
	     */

	  }, {
	    key: 'foregroundAlpha',
	    get: function get() {
	      return optionManager.get('foregroundAlpha', this);
	    }

	    /**
	     * Sets the foreground alpha for the QR code to <code>foregroundAlpha</code> and automatically updates this
	     * {@link QRious} if the underlying field is changed as a result.
	     *
	     * @param {number} [foregroundAlpha=1] - the foreground alpha to be set
	     * @public
	     */
	    ,
	    set: function set(foregroundAlpha) {
	      if (optionManager.set('foregroundAlpha', foregroundAlpha, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the <code>img</code> element being used to render the QR code for this {@link QRious}.
	     *
	     * @return {*} The <code>img</code> element.
	     * @public
	     */

	  }, {
	    key: 'image',
	    get: function get() {
	      return this._imageRenderer.getElement();
	    }

	    /**
	     * Returns the error correction level for the QR code.
	     *
	     * @return {string} The ECC level.
	     * @public
	     */

	  }, {
	    key: 'level',
	    get: function get() {
	      return optionManager.get('level', this);
	    }

	    /**
	     * Sets the error correction level for the QR code to <code>level</code> and automatically updates this {@link QRious}
	     * if the underlying field is changed as a result.
	     *
	     * <code>level</code> will be transformed to upper case to aid mapping to known ECC level blocks.
	     *
	     * @param {string} [level="L"] - the ECC level to be set
	     * @public
	     */
	    ,
	    set: function set(level) {
	      if (optionManager.set('level', level, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the MIME type for the image rendered for the QR code.
	     *
	     * @return {string} The image MIME type.
	     * @public
	     */

	  }, {
	    key: 'mime',
	    get: function get() {
	      return optionManager.get('mime', this);
	    }

	    /**
	     * Sets the MIME type for the image rendered for the QR code to <code>mime</code> and automatically updates this
	     * {@link QRious} if the underlying field is changed as a result.
	     *
	     * @param {string} [mime="image/png"] - the image MIME type to be set
	     * @public
	     */
	    ,
	    set: function set(mime) {
	      if (optionManager.set('mime', mime, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the padding for the QR code.
	     *
	     * @return {number} The padding in pixels.
	     * @public
	     */

	  }, {
	    key: 'padding',
	    get: function get() {
	      return optionManager.get('padding', this);
	    }

	    /**
	     * Sets the padding for the QR code to <code>padding</code> and automatically updates this {@link QRious} if the
	     * underlying field is changed as a result.
	     *
	     * <code>padding</code> will be transformed to ensure that it is always an absolute positive numbers (e.g.
	     * <code>-10</code> would become <code>10</code>).
	     *
	     * @param {number} [padding] - the padding in pixels to be set
	     * @public
	     */
	    ,
	    set: function set(padding) {
	      if (optionManager.set('padding', padding, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the size of the QR code.
	     *
	     * @return {number} The size in pixels.
	     * @public
	     */

	  }, {
	    key: 'size',
	    get: function get() {
	      return optionManager.get('size', this);
	    }

	    /**
	     * Sets the size of the QR code to <code>size</code> and automatically updates this {@link QRious} if the underlying
	     * field is changed as a result.
	     *
	     * <code>size</code> will be transformed to ensure that it is always an absolute positive numbers (e.g.
	     * <code>-100</code> would become <code>100</code>).
	     *
	     * @param {number} [size=100] - the size in pixels to be set
	     * @public
	     */
	    ,
	    set: function set(size) {
	      if (optionManager.set('size', size, this)) {
	        this.update();
	      }
	    }

	    /**
	     * Returns the value of the QR code.
	     *
	     * @return {string} The value.
	     * @public
	     */

	  }, {
	    key: 'value',
	    get: function get() {
	      return optionManager.get('value', this);
	    }

	    /**
	     * Sets the value of the QR code to <code>value</code> and automatically updates this {@link QRious} if the underlying
	     * field is changed as a result.
	     *
	     * @param {string} [value=""] - the value to be set
	     * @public
	     */
	    ,
	    set: function set(value) {
	      if (optionManager.set('value', value, this)) {
	        this.update();
	      }
	    }
	  }]);

	  return QRious;
	}();



	/**
	 * The options used by {@link QRious}.
	 *
	 * @typedef {Object} QRious~Options
	 * @property {string} [background="white"] - The background color to be applied to the QR code.
	 * @property {number} [backgroundAlpha=1] - The background alpha to be applied to the QR code.
	 * @property {*} [element] - The element to be used to render the QR code which may either be an <code>canvas</code> or
	 * <code>img</code>. The element(s) will be created if needed.
	 * @property {string} [foreground="black"] - The foreground color to be applied to the QR code.
	 * @property {number} [foregroundAlpha=1] - The foreground alpha to be applied to the QR code.
	 * @property {string} [level="L"] - The error correction level to be applied to the QR code.
	 * @property {string} [mime="image/png"] - The MIME type to be used to render the image for the QR code.
	 * @property {number} [padding] - The padding for the QR code in pixels.
	 * @property {number} [size=100] - The size of the QR code in pixels.
	 * @property {string} [value=""] - The value to be encoded within the QR code.
	 */

	/*
	 * QRious
	 * Copyright (C) 2017 Alasdair Mercer
	 * Copyright (C) 2010 Tom Zerucha
	 *
	 * This program is free software: you can redistribute it and/or modify
	 * it under the terms of the GNU General Public License as published by
	 * the Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	 * GNU General Public License for more details.
	 *
	 * You should have received a copy of the GNU General Public License
	 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
	 */

	QRious$1.use(new BrowserElementService());

	return QRious$1;

})));

//# sourceMappingURL=qrious.js.map
// https://d3js.org Version 4.2.8. Copyright 2016 Mike Bostock.
(function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n(t.d3=t.d3||{})})(this,function(t){"use strict";function n(t){return function(n,e){return bs(t(n),e)}}function e(t,n,e){var r=Math.abs(n-t)/Math.max(0,e),i=Math.pow(10,Math.floor(Math.log(r)/Math.LN10)),o=r/i;return o>=Ds?i*=10:o>=Os?i*=5:o>=Fs&&(i*=2),n<t?-i:i}function r(t){return t.length}function i(){}function o(t,n){var e=new i;if(t instanceof i)t.each(function(t,n){e.set(n,t)});else if(Array.isArray(t)){var r,o=-1,u=t.length;if(null==n)for(;++o<u;)e.set(o,t[o]);else for(;++o<u;)e.set(n(r=t[o],o,t),r)}else if(t)for(var a in t)e.set(a,t[a]);return e}function u(){return{}}function a(t,n,e){t[n]=e}function c(){return o()}function s(t,n,e){t.set(n,e)}function f(){}function l(t,n){var e=new f;if(t instanceof f)t.each(function(t){e.add(t)});else if(t){var r=-1,i=t.length;if(null==n)for(;++r<i;)e.add(t[r]);else for(;++r<i;)e.add(n(t[r],r,t))}return e}function h(t){return+t}function p(t){return t*t}function d(t){return t*(2-t)}function v(t){return((t*=2)<=1?t*t:--t*(2-t)+1)/2}function _(t){return t*t*t}function y(t){return--t*t*t+1}function g(t){return((t*=2)<=1?t*t*t:(t-=2)*t*t+2)/2}function m(t){return 1-Math.cos(t*wf)}function x(t){return Math.sin(t*wf)}function b(t){return(1-Math.cos(bf*t))/2}function w(t){return Math.pow(2,10*t-10)}function M(t){return 1-Math.pow(2,-10*t)}function T(t){return((t*=2)<=1?Math.pow(2,10*t-10):2-Math.pow(2,10-10*t))/2}function N(t){return 1-Math.sqrt(1-t*t)}function k(t){return Math.sqrt(1- --t*t)}function S(t){return((t*=2)<=1?1-Math.sqrt(1-t*t):Math.sqrt(1-(t-=2)*t)+1)/2}function A(t){return 1-E(1-t)}function E(t){return(t=+t)<Mf?Pf*t*t:t<Nf?Pf*(t-=Tf)*t+kf:t<Af?Pf*(t-=Sf)*t+Ef:Pf*(t-=Cf)*t+zf}function C(t){return((t*=2)<=1?1-E(1-t):E(t-1)+1)/2}function z(t,n){return t[0]-n[0]||t[1]-n[1]}function P(t){for(var n=t.length,e=[0,1],r=2,i=2;i<n;++i){for(;r>1&&Xf(t[e[r-2]],t[e[r-1]],t[i])<=0;)--r;e[r++]=i}return e.slice(0,r)}function q(){this._x0=this._y0=this._x1=this._y1=null,this._=[]}function L(){return new q}function R(t,n,e,r){if(isNaN(n)||isNaN(e))return t;var i,o,u,a,c,s,f,l,h,p=t._root,d={data:r},v=t._x0,_=t._y0,y=t._x1,g=t._y1;if(!p)return t._root=d,t;for(;p.length;)if((s=n>=(o=(v+y)/2))?v=o:y=o,(f=e>=(u=(_+g)/2))?_=u:g=u,i=p,!(p=p[l=f<<1|s]))return i[l]=d,t;if(a=+t._x.call(null,p.data),c=+t._y.call(null,p.data),n===a&&e===c)return d.next=p,i?i[l]=d:t._root=d,t;do i=i?i[l]=new Array(4):t._root=new Array(4),(s=n>=(o=(v+y)/2))?v=o:y=o,(f=e>=(u=(_+g)/2))?_=u:g=u;while((l=f<<1|s)===(h=(c>=u)<<1|a>=o));return i[h]=p,i[l]=d,t}function U(t){var n,e,r,i,o=t.length,u=new Array(o),a=new Array(o),c=1/0,s=1/0,f=-(1/0),l=-(1/0);for(e=0;e<o;++e)isNaN(r=+this._x.call(null,n=t[e]))||isNaN(i=+this._y.call(null,n))||(u[e]=r,a[e]=i,r<c&&(c=r),r>f&&(f=r),i<s&&(s=i),i>l&&(l=i));for(f<c&&(c=this._x0,f=this._x1),l<s&&(s=this._y0,l=this._y1),this.cover(c,s).cover(f,l),e=0;e<o;++e)R(this,u[e],a[e],t[e]);return this}function D(t){for(var n=0,e=t.length;n<e;++n)this.remove(t[n]);return this}function O(t){return t[0]}function F(t){return t[1]}function I(t,n,e){var r=new Y(null==n?O:n,null==e?F:e,NaN,NaN,NaN,NaN);return null==t?r:r.addAll(t)}function Y(t,n,e,r,i,o){this._x=t,this._y=n,this._x0=e,this._y0=r,this._x1=i,this._y1=o,this._root=void 0}function B(t){for(var n={data:t.data},e=n;t=t.next;)e=e.next={data:t.data};return n}function j(t){if(!(t>=1))throw new Error;this._size=t,this._call=this._error=null,this._tasks=[],this._data=[],this._waiting=this._active=this._ended=this._start=0}function H(t){if(!t._start)try{X(t)}catch(n){if(t._tasks[t._ended+t._active-1])W(t,n);else if(!t._data)throw n}}function X(t){for(;t._start=t._waiting&&t._active<t._size;){var n=t._ended+t._active,e=t._tasks[n],r=e.length-1,i=e[r];e[r]=V(t,n),--t._waiting,++t._active,e=i.apply(null,e),t._tasks[n]&&(t._tasks[n]=e||dl)}}function V(t,n){return function(e,r){t._tasks[n]&&(--t._active,++t._ended,t._tasks[n]=null,null==t._error&&(null!=e?W(t,e):(t._data[n]=r,t._waiting?H(t):$(t))))}}function W(t,n){var e,r=t._tasks.length;for(t._error=n,t._data=void 0,t._waiting=NaN;--r>=0;)if((e=t._tasks[r])&&(t._tasks[r]=null,e.abort))try{e.abort()}catch(t){}t._active=NaN,$(t)}function $(t){if(!t._active&&t._call){var n=t._data;t._data=void 0,t._call(t._error,n)}}function Z(t){return new j(arguments.length?+t:1/0)}function G(t){return t.innerRadius}function J(t){return t.outerRadius}function Q(t){return t.startAngle}function K(t){return t.endAngle}function tt(t){return t&&t.padAngle}function nt(t){return t>=1?gl:t<=-1?-gl:Math.asin(t)}function et(t,n,e,r,i,o,u,a){var c=e-t,s=r-n,f=u-i,l=a-o,h=(f*(n-o)-l*(t-i))/(l*c-f*s);return[t+h*c,n+h*s]}function rt(t,n,e,r,i,o,u){var a=t-e,c=n-r,s=(u?o:-o)/Math.sqrt(a*a+c*c),f=s*c,l=-s*a,h=t+f,p=n+l,d=e+f,v=r+l,_=(h+d)/2,y=(p+v)/2,g=d-h,m=v-p,x=g*g+m*m,b=i-o,w=h*v-d*p,M=(m<0?-1:1)*Math.sqrt(Math.max(0,b*b*x-w*w)),T=(w*m-g*M)/x,N=(-w*g-m*M)/x,k=(w*m+g*M)/x,S=(-w*g+m*M)/x,A=T-_,E=N-y,C=k-_,z=S-y;return A*A+E*E>C*C+z*z&&(T=k,N=S),{cx:T,cy:N,x01:-f,y01:-l,x11:T*(i/b-1),y11:N*(i/b-1)}}function it(t){this._context=t}function ot(t){return t[0]}function ut(t){return t[1]}function at(t){this._curve=t}function ct(t){function n(n){return new at(t(n))}return n._curve=t,n}function st(t){var n=t.curve;return t.angle=t.x,delete t.x,t.radius=t.y,delete t.y,t.curve=function(t){return arguments.length?n(ct(t)):n()._curve},t}function ft(t,n,e){t._context.bezierCurveTo((2*t._x0+t._x1)/3,(2*t._y0+t._y1)/3,(t._x0+2*t._x1)/3,(t._y0+2*t._y1)/3,(t._x0+4*t._x1+n)/6,(t._y0+4*t._y1+e)/6)}function lt(t){this._context=t}function ht(t){this._context=t}function pt(t){this._context=t}function dt(t,n){this._basis=new lt(t),this._beta=n}function vt(t,n,e){t._context.bezierCurveTo(t._x1+t._k*(t._x2-t._x0),t._y1+t._k*(t._y2-t._y0),t._x2+t._k*(t._x1-n),t._y2+t._k*(t._y1-e),t._x2,t._y2)}function _t(t,n){this._context=t,this._k=(1-n)/6}function yt(t,n){this._context=t,this._k=(1-n)/6}function gt(t,n){this._context=t,this._k=(1-n)/6}function mt(t,n,e){var r=t._x1,i=t._y1,o=t._x2,u=t._y2;if(t._l01_a>_l){var a=2*t._l01_2a+3*t._l01_a*t._l12_a+t._l12_2a,c=3*t._l01_a*(t._l01_a+t._l12_a);r=(r*a-t._x0*t._l12_2a+t._x2*t._l01_2a)/c,i=(i*a-t._y0*t._l12_2a+t._y2*t._l01_2a)/c}if(t._l23_a>_l){var s=2*t._l23_2a+3*t._l23_a*t._l12_a+t._l12_2a,f=3*t._l23_a*(t._l23_a+t._l12_a);o=(o*s+t._x1*t._l23_2a-n*t._l12_2a)/f,u=(u*s+t._y1*t._l23_2a-e*t._l12_2a)/f}t._context.bezierCurveTo(r,i,o,u,t._x2,t._y2)}function xt(t,n){this._context=t,this._alpha=n}function bt(t,n){this._context=t,this._alpha=n}function wt(t,n){this._context=t,this._alpha=n}function Mt(t){this._context=t}function Tt(t){return t<0?-1:1}function Nt(t,n,e){var r=t._x1-t._x0,i=n-t._x1,o=(t._y1-t._y0)/(r||i<0&&-0),u=(e-t._y1)/(i||r<0&&-0),a=(o*i+u*r)/(r+i);return(Tt(o)+Tt(u))*Math.min(Math.abs(o),Math.abs(u),.5*Math.abs(a))||0}function kt(t,n){var e=t._x1-t._x0;return e?(3*(t._y1-t._y0)/e-n)/2:n}function St(t,n,e){var r=t._x0,i=t._y0,o=t._x1,u=t._y1,a=(o-r)/3;t._context.bezierCurveTo(r+a,i+a*n,o-a,u-a*e,o,u)}function At(t){this._context=t}function Et(t){this._context=new Ct(t)}function Ct(t){this._context=t}function zt(t){return new At(t)}function Pt(t){return new Et(t)}function qt(t){this._context=t}function Lt(t){var n,e,r=t.length-1,i=new Array(r),o=new Array(r),u=new Array(r);for(i[0]=0,o[0]=2,u[0]=t[0]+2*t[1],n=1;n<r-1;++n)i[n]=1,o[n]=4,u[n]=4*t[n]+2*t[n+1];for(i[r-1]=2,o[r-1]=7,u[r-1]=8*t[r-1]+t[r],n=1;n<r;++n)e=i[n]/o[n-1],o[n]-=e,u[n]-=e*u[n-1];for(i[r-1]=u[r-1]/o[r-1],n=r-2;n>=0;--n)i[n]=(u[n]-i[n+1])/o[n];for(o[r-1]=(t[r]+i[r-1])/2,n=0;n<r-1;++n)o[n]=2*t[n+1]-i[n+1];return[i,o]}function Rt(t,n){this._context=t,this._t=n}function Ut(t){return new Rt(t,0)}function Dt(t){return new Rt(t,1)}function Ot(t,n){return t[n]}function Ft(t){for(var n,e=0,r=-1,i=t.length;++r<i;)(n=+t[r][1])&&(e+=n);return e}function It(t,n){var e=Object.create(t.prototype);for(var r in n)e[r]=n[r];return e}function Yt(){}function Bt(t){var n;return t=(t+"").trim().toLowerCase(),(n=Th.exec(t))?(n=parseInt(n[1],16),new Wt(n>>8&15|n>>4&240,n>>4&15|240&n,(15&n)<<4|15&n,1)):(n=Nh.exec(t))?jt(parseInt(n[1],16)):(n=kh.exec(t))?new Wt(n[1],n[2],n[3],1):(n=Sh.exec(t))?new Wt(255*n[1]/100,255*n[2]/100,255*n[3]/100,1):(n=Ah.exec(t))?Ht(n[1],n[2],n[3],n[4]):(n=Eh.exec(t))?Ht(255*n[1]/100,255*n[2]/100,255*n[3]/100,n[4]):(n=Ch.exec(t))?$t(n[1],n[2]/100,n[3]/100,1):(n=zh.exec(t))?$t(n[1],n[2]/100,n[3]/100,n[4]):Ph.hasOwnProperty(t)?jt(Ph[t]):"transparent"===t?new Wt(NaN,NaN,NaN,0):null}function jt(t){return new Wt(t>>16&255,t>>8&255,255&t,1)}function Ht(t,n,e,r){return r<=0&&(t=n=e=NaN),new Wt(t,n,e,r)}function Xt(t){return t instanceof Yt||(t=Bt(t)),t?(t=t.rgb(),new Wt(t.r,t.g,t.b,t.opacity)):new Wt}function Vt(t,n,e,r){return 1===arguments.length?Xt(t):new Wt(t,n,e,null==r?1:r)}function Wt(t,n,e,r){this.r=+t,this.g=+n,this.b=+e,this.opacity=+r}function $t(t,n,e,r){return r<=0?t=n=e=NaN:e<=0||e>=1?t=n=NaN:n<=0&&(t=NaN),new Jt(t,n,e,r)}function Zt(t){if(t instanceof Jt)return new Jt(t.h,t.s,t.l,t.opacity);if(t instanceof Yt||(t=Bt(t)),!t)return new Jt;if(t instanceof Jt)return t;t=t.rgb();var n=t.r/255,e=t.g/255,r=t.b/255,i=Math.min(n,e,r),o=Math.max(n,e,r),u=NaN,a=o-i,c=(o+i)/2;return a?(u=n===o?(e-r)/a+6*(e<r):e===o?(r-n)/a+2:(n-e)/a+4,a/=c<.5?o+i:2-o-i,u*=60):a=c>0&&c<1?0:u,new Jt(u,a,c,t.opacity)}function Gt(t,n,e,r){return 1===arguments.length?Zt(t):new Jt(t,n,e,null==r?1:r)}function Jt(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function Qt(t,n,e){return 255*(t<60?n+(e-n)*t/60:t<180?e:t<240?n+(e-n)*(240-t)/60:n)}function Kt(t){if(t instanceof nn)return new nn(t.l,t.a,t.b,t.opacity);if(t instanceof sn){var n=t.h*qh;return new nn(t.l,Math.cos(n)*t.c,Math.sin(n)*t.c,t.opacity)}t instanceof Wt||(t=Xt(t));var e=un(t.r),r=un(t.g),i=un(t.b),o=en((.4124564*e+.3575761*r+.1804375*i)/Uh),u=en((.2126729*e+.7151522*r+.072175*i)/Dh),a=en((.0193339*e+.119192*r+.9503041*i)/Oh);return new nn(116*u-16,500*(o-u),200*(u-a),t.opacity)}function tn(t,n,e,r){return 1===arguments.length?Kt(t):new nn(t,n,e,null==r?1:r)}function nn(t,n,e,r){this.l=+t,this.a=+n,this.b=+e,this.opacity=+r}function en(t){return t>Bh?Math.pow(t,1/3):t/Yh+Fh}function rn(t){return t>Ih?t*t*t:Yh*(t-Fh)}function on(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function un(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function an(t){if(t instanceof sn)return new sn(t.h,t.c,t.l,t.opacity);t instanceof nn||(t=Kt(t));var n=Math.atan2(t.b,t.a)*Lh;return new sn(n<0?n+360:n,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function cn(t,n,e,r){return 1===arguments.length?an(t):new sn(t,n,e,null==r?1:r)}function sn(t,n,e,r){this.h=+t,this.c=+n,this.l=+e,this.opacity=+r}function fn(t){if(t instanceof hn)return new hn(t.h,t.s,t.l,t.opacity);t instanceof Wt||(t=Xt(t));var n=t.r/255,e=t.g/255,r=t.b/255,i=(Gh*r+$h*n-Zh*e)/(Gh+$h-Zh),o=r-i,u=(Wh*(e-i)-Xh*o)/Vh,a=Math.sqrt(u*u+o*o)/(Wh*i*(1-i)),c=a?Math.atan2(u,o)*Lh-120:NaN;return new hn(c<0?c+360:c,a,i,t.opacity)}function ln(t,n,e,r){return 1===arguments.length?fn(t):new hn(t,n,e,null==r?1:r)}function hn(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function pn(t,n,e,r,i){var o=t*t,u=o*t;return((1-3*t+3*o-u)*n+(4-6*o+3*u)*e+(1+3*t+3*o-3*u)*r+u*i)/6}function dn(t,n){return function(e){return t+e*n}}function vn(t,n,e){return t=Math.pow(t,e),n=Math.pow(n,e)-t,e=1/e,function(r){return Math.pow(t+r*n,e)}}function _n(t,n){var e=n-t;return e?dn(t,e>180||e<-180?e-360*Math.round(e/360):e):rp(isNaN(t)?n:t)}function yn(t){return 1===(t=+t)?gn:function(n,e){return e-n?vn(n,e,t):rp(isNaN(n)?e:n)}}function gn(t,n){var e=n-t;return e?dn(t,e):rp(isNaN(t)?n:t)}function mn(t){return function(n){var e,r,i=n.length,o=new Array(i),u=new Array(i),a=new Array(i);for(e=0;e<i;++e)r=Vt(n[e]),o[e]=r.r||0,u[e]=r.g||0,a[e]=r.b||0;return o=t(o),u=t(u),a=t(a),r.opacity=1,function(t){return r.r=o(t),r.g=u(t),r.b=a(t),r+""}}}function xn(t){return function(){return t}}function bn(t){return function(n){return t(n)+""}}function wn(t){return"none"===t?yp:(Jh||(Jh=document.createElement("DIV"),Qh=document.documentElement,Kh=document.defaultView),Jh.style.transform=t,t=Kh.getComputedStyle(Qh.appendChild(Jh),null).getPropertyValue("transform"),Qh.removeChild(Jh),t=t.slice(7,-1).split(","),gp(+t[0],+t[1],+t[2],+t[3],+t[4],+t[5]))}function Mn(t){return null==t?yp:(tp||(tp=document.createElementNS("http://www.w3.org/2000/svg","g")),tp.setAttribute("transform",t),(t=tp.transform.baseVal.consolidate())?(t=t.matrix,gp(t.a,t.b,t.c,t.d,t.e,t.f)):yp)}function Tn(t,n,e,r){function i(t){return t.length?t.pop()+" ":""}function o(t,r,i,o,u,a){if(t!==i||r!==o){var c=u.push("translate(",null,n,null,e);a.push({i:c-4,x:sp(t,i)},{i:c-2,x:sp(r,o)})}else(i||o)&&u.push("translate("+i+n+o+e)}function u(t,n,e,o){t!==n?(t-n>180?n+=360:n-t>180&&(t+=360),o.push({i:e.push(i(e)+"rotate(",null,r)-2,x:sp(t,n)})):n&&e.push(i(e)+"rotate("+n+r)}function a(t,n,e,o){t!==n?o.push({i:e.push(i(e)+"skewX(",null,r)-2,x:sp(t,n)}):n&&e.push(i(e)+"skewX("+n+r)}function c(t,n,e,r,o,u){if(t!==e||n!==r){var a=o.push(i(o)+"scale(",null,",",null,")");u.push({i:a-4,x:sp(t,e)},{i:a-2,x:sp(n,r)})}else 1===e&&1===r||o.push(i(o)+"scale("+e+","+r+")")}return function(n,e){var r=[],i=[];return n=t(n),e=t(e),o(n.translateX,n.translateY,e.translateX,e.translateY,r,i),u(n.rotate,e.rotate,r,i),a(n.skewX,e.skewX,r,i),c(n.scaleX,n.scaleY,e.scaleX,e.scaleY,r,i),n=e=null,function(t){for(var n,e=-1,o=i.length;++e<o;)r[(n=i[e]).i]=n.x(t);return r.join("")}}}function Nn(t){return((t=Math.exp(t))+1/t)/2}function kn(t){return((t=Math.exp(t))-1/t)/2}function Sn(t){return((t=Math.exp(2*t))-1)/(t+1)}function An(t){return function(n,e){var r=t((n=Gt(n)).h,(e=Gt(e)).h),i=gn(n.s,e.s),o=gn(n.l,e.l),u=gn(n.opacity,e.opacity);return function(t){return n.h=r(t),n.s=i(t),n.l=o(t),n.opacity=u(t),n+""}}}function En(t,n){var e=gn((t=tn(t)).l,(n=tn(n)).l),r=gn(t.a,n.a),i=gn(t.b,n.b),o=gn(t.opacity,n.opacity);return function(n){return t.l=e(n),t.a=r(n),t.b=i(n),t.opacity=o(n),t+""}}function Cn(t){return function(n,e){var r=t((n=cn(n)).h,(e=cn(e)).h),i=gn(n.c,e.c),o=gn(n.l,e.l),u=gn(n.opacity,e.opacity);return function(t){return n.h=r(t),n.c=i(t),n.l=o(t),n.opacity=u(t),n+""}}}function zn(t){return function n(e){function r(n,r){var i=t((n=ln(n)).h,(r=ln(r)).h),o=gn(n.s,r.s),u=gn(n.l,r.l),a=gn(n.opacity,r.opacity);return function(t){return n.h=i(t),n.s=o(t),n.l=u(Math.pow(t,e)),n.opacity=a(t),n+""}}return e=+e,r.gamma=n,r}(1)}function Pn(){for(var t,n=0,e=arguments.length,r={};n<e;++n){if(!(t=arguments[n]+"")||t in r)throw new Error("illegal type: "+t);r[t]=[]}return new qn(r)}function qn(t){this._=t}function Ln(t,n){return t.trim().split(/^|\s+/).map(function(t){var e="",r=t.indexOf(".");if(r>=0&&(e=t.slice(r+1),t=t.slice(0,r)),t&&!n.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:e}})}function Rn(t,n){for(var e,r=0,i=t.length;r<i;++r)if((e=t[r]).name===n)return e.value}function Un(t,n,e){for(var r=0,i=t.length;r<i;++r)if(t[r].name===n){t[r]=qp,t=t.slice(0,r).concat(t.slice(r+1));break}return null!=e&&t.push({name:n,value:e}),t}function Dn(t){return new Function("d","return {"+t.map(function(t,n){return JSON.stringify(t)+": d["+n+"]"}).join(",")+"}")}function On(t,n){var e=Dn(t);return function(r,i){return n(e(r),i,t)}}function Fn(t){var n=Object.create(null),e=[];return t.forEach(function(t){for(var r in t)r in n||e.push(n[r]=r)}),e}function In(t){return function(n,e){t(null==n?e:null)}}function Yn(t){var n=t.responseType;return n&&"text"!==n?t.response:t.responseText}function Bn(t,n){return function(e){return t(e.responseText,n)}}function jn(){return ad||(fd(Hn),ad=sd.now()+cd)}function Hn(){ad=0}function Xn(){this._call=this._time=this._next=null}function Vn(t,n,e){var r=new Xn;return r.restart(t,n,e),r}function Wn(){jn(),++ed;for(var t,n=Lp;n;)(t=ad-n._time)>=0&&n._call.call(null,t),n=n._next;--ed}function $n(){ad=(ud=sd.now())+cd,ed=rd=0;try{Wn()}finally{ed=0,Gn(),ad=0}}function Zn(){var t=sd.now(),n=t-ud;n>od&&(cd-=n,ud=t)}function Gn(){for(var t,n,e=Lp,r=1/0;e;)e._call?(r>e._time&&(r=e._time),t=e,e=e._next):(n=e._next,e._next=null,e=t?t._next=n:Lp=n);Rp=t,Jn(r)}function Jn(t){if(!ed){rd&&(rd=clearTimeout(rd));var n=t-ad;n>24?(t<1/0&&(rd=setTimeout($n,n)),id&&(id=clearInterval(id))):(id||(id=setInterval(Zn,od)),ed=1,fd($n))}}function Qn(t,n,e,r){function i(n){return t(n=new Date(+n)),n}return i.floor=i,i.ceil=function(e){return t(e=new Date(e-1)),n(e,1),t(e),e},i.round=function(t){var n=i(t),e=i.ceil(t);return t-n<e-t?n:e},i.offset=function(t,e){return n(t=new Date(+t),null==e?1:Math.floor(e)),t},i.range=function(e,r,o){var u=[];if(e=i.ceil(e),o=null==o?1:Math.floor(o),!(e<r&&o>0))return u;do u.push(new Date(+e));while(n(e,o),t(e),e<r);return u},i.filter=function(e){return Qn(function(n){if(n>=n)for(;t(n),!e(n);)n.setTime(n-1)},function(t,r){if(t>=t)for(;--r>=0;)for(;n(t,1),!e(t););})},e&&(i.count=function(n,r){return pd.setTime(+n),dd.setTime(+r),t(pd),t(dd),Math.floor(e(pd,dd))},i.every=function(t){return t=Math.floor(t),isFinite(t)&&t>0?t>1?i.filter(r?function(n){return r(n)%t===0}:function(n){return i.count(0,n)%t===0}):i:null}),i}function Kn(t){return Qn(function(n){n.setDate(n.getDate()-(n.getDay()+7-t)%7),n.setHours(0,0,0,0)},function(t,n){t.setDate(t.getDate()+7*n)},function(t,n){return(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*gd)/bd})}function te(t){return Qn(function(n){n.setUTCDate(n.getUTCDate()-(n.getUTCDay()+7-t)%7),n.setUTCHours(0,0,0,0)},function(t,n){t.setUTCDate(t.getUTCDate()+7*n)},function(t,n){return(n-t)/bd})}function ne(t){if(!(n=kv.exec(t)))throw new Error("invalid format: "+t);var n,e=n[1]||" ",r=n[2]||">",i=n[3]||"-",o=n[4]||"",u=!!n[5],a=n[6]&&+n[6],c=!!n[7],s=n[8]&&+n[8].slice(1),f=n[9]||"";"n"===f?(c=!0,f="g"):Nv[f]||(f=""),(u||"0"===e&&"="===r)&&(u=!0,e="0",r="="),this.fill=e,this.align=r,this.sign=i,this.symbol=o,this.zero=u,this.width=a,this.comma=c,this.precision=s,this.type=f}function ee(t){return t}function re(n){return Av=Cv(n),t.format=Av.format,t.formatPrefix=Av.formatPrefix,Av}function ie(t){if(0<=t.y&&t.y<100){var n=new Date(-1,t.m,t.d,t.H,t.M,t.S,t.L);return n.setFullYear(t.y),n}return new Date(t.y,t.m,t.d,t.H,t.M,t.S,t.L)}function oe(t){if(0<=t.y&&t.y<100){var n=new Date(Date.UTC(-1,t.m,t.d,t.H,t.M,t.S,t.L));return n.setUTCFullYear(t.y),n}return new Date(Date.UTC(t.y,t.m,t.d,t.H,t.M,t.S,t.L))}function ue(t){return{y:t,m:0,d:1,H:0,M:0,S:0,L:0}}function ae(t){function n(t,n){return function(e){var r,i,o,u=[],a=-1,c=0,s=t.length;for(e instanceof Date||(e=new Date(+e));++a<s;)37===t.charCodeAt(a)&&(u.push(t.slice(c,a)),null!=(i=Rv[r=t.charAt(++a)])?r=t.charAt(++a):i="e"===r?" ":"0",(o=n[r])&&(r=o(e,i)),u.push(r),c=a+1);return u.push(t.slice(c,a)),u.join("")}}function e(t,n){return function(e){var i=ue(1900),o=r(i,t,e+="",0);if(o!=e.length)return null;if("p"in i&&(i.H=i.H%12+12*i.p),"W"in i||"U"in i){"w"in i||(i.w="W"in i?1:0);var u="Z"in i?oe(ue(i.y)).getUTCDay():n(ue(i.y)).getDay();i.m=0,i.d="W"in i?(i.w+6)%7+7*i.W-(u+5)%7:i.w+7*i.U-(u+6)%7}return"Z"in i?(i.H+=i.Z/100|0,i.M+=i.Z%100,oe(i)):n(i)}}function r(t,n,e,r){for(var i,o,u=0,a=n.length,c=e.length;u<a;){if(r>=c)return-1;if(i=n.charCodeAt(u++),37===i){if(i=n.charAt(u++),o=B[i in Rv?n.charAt(u++):i],!o||(r=o(t,e,r))<0)return-1}else if(i!=e.charCodeAt(r++))return-1}return r}function i(t,n,e){var r=C.exec(n.slice(e));return r?(t.p=z[r[0].toLowerCase()],e+r[0].length):-1}function o(t,n,e){var r=L.exec(n.slice(e));return r?(t.w=R[r[0].toLowerCase()],e+r[0].length):-1}function u(t,n,e){var r=P.exec(n.slice(e));return r?(t.w=q[r[0].toLowerCase()],e+r[0].length):-1}function a(t,n,e){var r=O.exec(n.slice(e));return r?(t.m=F[r[0].toLowerCase()],e+r[0].length):-1}function c(t,n,e){var r=U.exec(n.slice(e));return r?(t.m=D[r[0].toLowerCase()],e+r[0].length):-1}function s(t,n,e){return r(t,w,n,e)}function f(t,n,e){return r(t,M,n,e)}function l(t,n,e){return r(t,T,n,e)}function h(t){return S[t.getDay()]}function p(t){return k[t.getDay()]}function d(t){return E[t.getMonth()]}function v(t){return A[t.getMonth()]}function _(t){return N[+(t.getHours()>=12)]}function y(t){return S[t.getUTCDay()]}function g(t){return k[t.getUTCDay()]}function m(t){return E[t.getUTCMonth()]}function x(t){return A[t.getUTCMonth()]}function b(t){return N[+(t.getUTCHours()>=12)]}var w=t.dateTime,M=t.date,T=t.time,N=t.periods,k=t.days,S=t.shortDays,A=t.months,E=t.shortMonths,C=fe(N),z=le(N),P=fe(k),q=le(k),L=fe(S),R=le(S),U=fe(A),D=le(A),O=fe(E),F=le(E),I={a:h,A:p,b:d,B:v,c:null,d:ke,e:ke,H:Se,I:Ae,j:Ee,L:Ce,m:ze,M:Pe,p:_,S:qe,U:Le,w:Re,W:Ue,x:null,X:null,y:De,Y:Oe,Z:Fe,"%":tr},Y={a:y,A:g,b:m,B:x,c:null,d:Ie,e:Ie,H:Ye,I:Be,j:je,L:He,m:Xe,M:Ve,p:b,S:We,U:$e,w:Ze,W:Ge,x:null,X:null,y:Je,Y:Qe,Z:Ke,"%":tr},B={a:o,A:u,b:a,B:c,c:s,d:me,e:me,H:be,I:be,j:xe,L:Te,m:ge,M:we,p:i,S:Me,U:pe,w:he,W:de,x:f,X:l,y:_e,Y:ve,Z:ye,"%":Ne};return I.x=n(M,I),I.X=n(T,I),I.c=n(w,I),Y.x=n(M,Y),Y.X=n(T,Y),Y.c=n(w,Y),{format:function(t){var e=n(t+="",I);return e.toString=function(){return t},e},parse:function(t){var n=e(t+="",ie);return n.toString=function(){return t},n},utcFormat:function(t){var e=n(t+="",Y);return e.toString=function(){return t},e},utcParse:function(t){var n=e(t,oe);return n.toString=function(){return t},n}}}function ce(t,n,e){var r=t<0?"-":"",i=(r?-t:t)+"",o=i.length;return r+(o<e?new Array(e-o+1).join(n)+i:i)}function se(t){return t.replace(Ov,"\\$&")}function fe(t){return new RegExp("^(?:"+t.map(se).join("|")+")","i")}function le(t){for(var n={},e=-1,r=t.length;++e<r;)n[t[e].toLowerCase()]=e;return n}function he(t,n,e){var r=Uv.exec(n.slice(e,e+1));return r?(t.w=+r[0],e+r[0].length):-1}function pe(t,n,e){var r=Uv.exec(n.slice(e));return r?(t.U=+r[0],e+r[0].length):-1}function de(t,n,e){var r=Uv.exec(n.slice(e));return r?(t.W=+r[0],e+r[0].length):-1}function ve(t,n,e){var r=Uv.exec(n.slice(e,e+4));return r?(t.y=+r[0],e+r[0].length):-1}function _e(t,n,e){var r=Uv.exec(n.slice(e,e+2));return r?(t.y=+r[0]+(+r[0]>68?1900:2e3),e+r[0].length):-1}function ye(t,n,e){var r=/^(Z)|([+-]\d\d)(?:\:?(\d\d))?/.exec(n.slice(e,e+6));return r?(t.Z=r[1]?0:-(r[2]+(r[3]||"00")),e+r[0].length):-1}function ge(t,n,e){var r=Uv.exec(n.slice(e,e+2));return r?(t.m=r[0]-1,e+r[0].length):-1}function me(t,n,e){var r=Uv.exec(n.slice(e,e+2));return r?(t.d=+r[0],e+r[0].length):-1}function xe(t,n,e){var r=Uv.exec(n.slice(e,e+3));return r?(t.m=0,t.d=+r[0],e+r[0].length):-1}function be(t,n,e){var r=Uv.exec(n.slice(e,e+2));return r?(t.H=+r[0],e+r[0].length):-1}function we(t,n,e){var r=Uv.exec(n.slice(e,e+2));return r?(t.M=+r[0],e+r[0].length):-1}function Me(t,n,e){var r=Uv.exec(n.slice(e,e+2));return r?(t.S=+r[0],e+r[0].length):-1}function Te(t,n,e){var r=Uv.exec(n.slice(e,e+3));return r?(t.L=+r[0],e+r[0].length):-1}function Ne(t,n,e){var r=Dv.exec(n.slice(e,e+1));return r?e+r[0].length:-1}function ke(t,n){return ce(t.getDate(),n,2)}function Se(t,n){return ce(t.getHours(),n,2)}function Ae(t,n){return ce(t.getHours()%12||12,n,2)}function Ee(t,n){return ce(1+Ad.count(Vd(t),t),n,3)}function Ce(t,n){return ce(t.getMilliseconds(),n,3)}function ze(t,n){return ce(t.getMonth()+1,n,2)}function Pe(t,n){return ce(t.getMinutes(),n,2)}function qe(t,n){return ce(t.getSeconds(),n,2)}function Le(t,n){return ce(Cd.count(Vd(t),t),n,2)}function Re(t){return t.getDay()}function Ue(t,n){return ce(zd.count(Vd(t),t),n,2)}function De(t,n){return ce(t.getFullYear()%100,n,2)}function Oe(t,n){return ce(t.getFullYear()%1e4,n,4)}function Fe(t){var n=t.getTimezoneOffset();return(n>0?"-":(n*=-1,"+"))+ce(n/60|0,"0",2)+ce(n%60,"0",2)}function Ie(t,n){return ce(t.getUTCDate(),n,2)}function Ye(t,n){return ce(t.getUTCHours(),n,2)}function Be(t,n){return ce(t.getUTCHours()%12||12,n,2)}function je(t,n){return ce(1+Qd.count(_v(t),t),n,3)}function He(t,n){return ce(t.getUTCMilliseconds(),n,3)}function Xe(t,n){return ce(t.getUTCMonth()+1,n,2)}function Ve(t,n){return ce(t.getUTCMinutes(),n,2)}function We(t,n){return ce(t.getUTCSeconds(),n,2)}function $e(t,n){return ce(tv.count(_v(t),t),n,2)}function Ze(t){return t.getUTCDay()}function Ge(t,n){return ce(nv.count(_v(t),t),n,2)}function Je(t,n){return ce(t.getUTCFullYear()%100,n,2)}function Qe(t,n){return ce(t.getUTCFullYear()%1e4,n,4)}function Ke(){return"+0000"}function tr(){return"%"}function nr(n){return zv=ae(n),t.timeFormat=zv.format,t.timeParse=zv.parse,t.utcFormat=zv.utcFormat,t.utcParse=zv.utcParse,zv}function er(t){return t.toISOString()}function rr(t){var n=new Date(t);return isNaN(n)?null:n}function ir(t){function n(n){var o=n+"",u=e.get(o);if(!u){if(i!==Xv)return i;e.set(o,u=r.push(n))}return t[(u-1)%t.length]}var e=o(),r=[],i=Xv;return t=null==t?[]:Hv.call(t),n.domain=function(t){if(!arguments.length)return r.slice();r=[],e=o();for(var i,u,a=-1,c=t.length;++a<c;)e.has(u=(i=t[a])+"")||e.set(u,r.push(i));return n},n.range=function(e){return arguments.length?(t=Hv.call(e),n):t.slice()},n.unknown=function(t){return arguments.length?(i=t,n):i},n.copy=function(){return ir().domain(r).range(t).unknown(i)},n}function or(){function t(){var t=i().length,r=u[1]<u[0],l=u[r-0],h=u[1-r];n=(h-l)/Math.max(1,t-c+2*s),a&&(n=Math.floor(n)),l+=(h-l-n*(t-c))*f,e=n*(1-c),a&&(l=Math.round(l),e=Math.round(e));var p=Us(t).map(function(t){return l+n*t});return o(r?p.reverse():p)}var n,e,r=ir().unknown(void 0),i=r.domain,o=r.range,u=[0,1],a=!1,c=0,s=0,f=.5;return delete r.unknown,r.domain=function(n){return arguments.length?(i(n),t()):i()},r.range=function(n){return arguments.length?(u=[+n[0],+n[1]],t()):u.slice()},r.rangeRound=function(n){return u=[+n[0],+n[1]],a=!0,t()},r.bandwidth=function(){return e},r.step=function(){return n},r.round=function(n){return arguments.length?(a=!!n,t()):a},r.padding=function(n){return arguments.length?(c=s=Math.max(0,Math.min(1,n)),t()):c},r.paddingInner=function(n){return arguments.length?(c=Math.max(0,Math.min(1,n)),t()):c},r.paddingOuter=function(n){return arguments.length?(s=Math.max(0,Math.min(1,n)),t()):s},r.align=function(n){return arguments.length?(f=Math.max(0,Math.min(1,n)),t()):f},r.copy=function(){return or().domain(i()).range(u).round(a).paddingInner(c).paddingOuter(s).align(f)},t()}function ur(t){var n=t.copy;return t.padding=t.paddingOuter,delete t.paddingInner,delete t.paddingOuter,t.copy=function(){return ur(n())},t}function ar(){return ur(or().paddingInner(1))}function cr(t,n){return(n-=t=+t)?function(e){return(e-t)/n}:Vv(n)}function sr(t){return function(n,e){var r=t(n=+n,e=+e);return function(t){return t<=n?0:t>=e?1:r(t)}}}function fr(t){return function(n,e){var r=t(n=+n,e=+e);return function(t){return t<=0?n:t>=1?e:r(t)}}}function lr(t,n,e,r){var i=t[0],o=t[1],u=n[0],a=n[1];return o<i?(i=e(o,i),u=r(a,u)):(i=e(i,o),u=r(u,a)),function(t){return u(i(t))}}function hr(t,n,e,r){var i=Math.min(t.length,n.length)-1,o=new Array(i),u=new Array(i),a=-1;for(t[i]<t[0]&&(t=t.slice().reverse(),n=n.slice().reverse());++a<i;)o[a]=e(t[a],t[a+1]),u[a]=r(n[a],n[a+1]);return function(n){var e=Ts(t,n,1,i)-1;return u[e](o[e](n))}}function pr(t,n){return n.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp())}function dr(t,n){function e(){return i=Math.min(a.length,c.length)>2?hr:lr,o=u=null,r}function r(n){return(o||(o=i(a,c,f?sr(t):t,s)))(+n)}var i,o,u,a=$v,c=$v,s=dp,f=!1;return r.invert=function(t){return(u||(u=i(c,a,cr,f?fr(n):n)))(+t)},r.domain=function(t){return arguments.length?(a=jv.call(t,Wv),e()):a.slice()},r.range=function(t){return arguments.length?(c=Hv.call(t),e()):c.slice()},r.rangeRound=function(t){return c=Hv.call(t),s=vp,e()},r.clamp=function(t){return arguments.length?(f=!!t,e()):f},r.interpolate=function(t){return arguments.length?(s=t,e()):s},e()}function vr(t){var n=t.domain;return t.ticks=function(t){var e=n();return Is(e[0],e[e.length-1],null==t?10:t)},t.tickFormat=function(t,e){return Zv(n(),t,e)},t.nice=function(r){var i=n(),o=i.length-1,u=null==r?10:r,a=i[0],c=i[o],s=e(a,c,u);return s&&(s=e(Math.floor(a/s)*s,Math.ceil(c/s)*s,u),i[0]=Math.floor(a/s)*s,i[o]=Math.ceil(c/s)*s,n(i)),t},t}function _r(){var t=dr(cr,sp);return t.copy=function(){return pr(t,_r())},vr(t)}function yr(){function t(t){return+t}var n=[0,1];return t.invert=t,t.domain=t.range=function(e){return arguments.length?(n=jv.call(e,Wv),t):n.slice()},t.copy=function(){return yr().domain(n)},vr(t)}function gr(t,n){return(n=Math.log(n/t))?function(e){return Math.log(e/t)/n}:Vv(n)}function mr(t,n){return t<0?function(e){return-Math.pow(-n,e)*Math.pow(-t,1-e)}:function(e){return Math.pow(n,e)*Math.pow(t,1-e)}}function xr(t){return isFinite(t)?+("1e"+t):t<0?0:t}function br(t){return 10===t?xr:t===Math.E?Math.exp:function(n){return Math.pow(t,n)}}function wr(t){return t===Math.E?Math.log:10===t&&Math.log10||2===t&&Math.log2||(t=Math.log(t),function(n){return Math.log(n)/t})}function Mr(t){return function(n){return-t(-n)}}function Tr(){function n(){return o=wr(i),u=br(i),r()[0]<0&&(o=Mr(o),u=Mr(u)),e}var e=dr(gr,mr).domain([1,10]),r=e.domain,i=10,o=wr(10),u=br(10);return e.base=function(t){return arguments.length?(i=+t,n()):i},e.domain=function(t){return arguments.length?(r(t),n()):r()},e.ticks=function(t){var n,e=r(),a=e[0],c=e[e.length-1];(n=c<a)&&(h=a,a=c,c=h);var s,f,l,h=o(a),p=o(c),d=null==t?10:+t,v=[];if(!(i%1)&&p-h<d){if(h=Math.round(h)-1,p=Math.round(p)+1,a>0){for(;h<p;++h)for(f=1,s=u(h);f<i;++f)if(l=s*f,!(l<a)){if(l>c)break;v.push(l)}}else for(;h<p;++h)for(f=i-1,s=u(h);f>=1;--f)if(l=s*f,!(l<a)){if(l>c)break;v.push(l)}}else v=Is(h,p,Math.min(p-h,d)).map(u);return n?v.reverse():v},e.tickFormat=function(n,r){if(null==r&&(r=10===i?".0e":","),"function"!=typeof r&&(r=t.format(r)),n===1/0)return r;null==n&&(n=10);var a=Math.max(1,i*n/e.ticks().length);return function(t){var n=t/u(Math.round(o(t)));return n*i<i-.5&&(n*=i),n<=a?r(t):""}},e.nice=function(){return r(Gv(r(),{floor:function(t){return u(Math.floor(o(t)))},ceil:function(t){return u(Math.ceil(o(t)))}}))},e.copy=function(){return pr(e,Tr().base(i))},e}function Nr(t,n){return t<0?-Math.pow(-t,n):Math.pow(t,n)}function kr(){function t(t,n){return(n=Nr(n,e)-(t=Nr(t,e)))?function(r){return(Nr(r,e)-t)/n}:Vv(n)}function n(t,n){return n=Nr(n,e)-(t=Nr(t,e)),function(r){return Nr(t+n*r,1/e)}}var e=1,r=dr(t,n),i=r.domain;return r.exponent=function(t){return arguments.length?(e=+t,i(i())):e},r.copy=function(){return pr(r,kr().exponent(e))},vr(r)}function Sr(){return kr().exponent(.5)}function Ar(){function t(){var t=0,o=Math.max(1,r.length);for(i=new Array(o-1);++t<o;)i[t-1]=js(e,t/o);return n}function n(t){if(!isNaN(t=+t))return r[Ts(i,t)]}var e=[],r=[],i=[];return n.invertExtent=function(t){var n=r.indexOf(t);return n<0?[NaN,NaN]:[n>0?i[n-1]:e[0],n<i.length?i[n]:e[e.length-1]]},n.domain=function(n){if(!arguments.length)return e.slice();e=[];for(var r,i=0,o=n.length;i<o;++i)r=n[i],null==r||isNaN(r=+r)||e.push(r);return e.sort(bs),t()},n.range=function(n){return arguments.length?(r=Hv.call(n),t()):r.slice()},n.quantiles=function(){return i.slice()},n.copy=function(){return Ar().domain(e).range(r)},n}function Er(){function t(t){if(t<=t)return u[Ts(o,t,0,i)]}function n(){var n=-1;for(o=new Array(i);++n<i;)o[n]=((n+1)*r-(n-i)*e)/(i+1);return t}var e=0,r=1,i=1,o=[.5],u=[0,1];return t.domain=function(t){return arguments.length?(e=+t[0],r=+t[1],n()):[e,r]},t.range=function(t){return arguments.length?(i=(u=Hv.call(t)).length-1,n()):u.slice()},t.invertExtent=function(t){var n=u.indexOf(t);return n<0?[NaN,NaN]:n<1?[e,o[0]]:n>=i?[o[i-1],r]:[o[n-1],o[n]]},t.copy=function(){return Er().domain([e,r]).range(u)},vr(t)}function Cr(){function t(t){if(t<=t)return e[Ts(n,t,0,r)]}var n=[.5],e=[0,1],r=1;return t.domain=function(i){return arguments.length?(n=Hv.call(i),r=Math.min(n.length,e.length-1),t):n.slice()},t.range=function(i){return arguments.length?(e=Hv.call(i),r=Math.min(n.length,e.length-1),t):e.slice()},t.invertExtent=function(t){var r=e.indexOf(t);return[n[r-1],n[r]]},t.copy=function(){return Cr().domain(n).range(e)},t}function zr(t){return new Date(t);
}function Pr(t){return t instanceof Date?+t:+new Date(+t)}function qr(t,n,r,i,o,u,a,c,s){function f(e){return(a(e)<e?v:u(e)<e?_:o(e)<e?y:i(e)<e?g:n(e)<e?r(e)<e?m:x:t(e)<e?b:w)(e)}function l(n,r,i,o){if(null==n&&(n=10),"number"==typeof n){var u=Math.abs(i-r)/n,a=ws(function(t){return t[2]}).right(M,u);a===M.length?(o=e(r/r_,i/r_,n),n=t):a?(a=M[u/M[a-1][2]<M[a][2]/u?a-1:a],o=a[1],n=a[0]):(o=e(r,i,n),n=c)}return null==o?n:n.every(o)}var h=dr(cr,sp),p=h.invert,d=h.domain,v=s(".%L"),_=s(":%S"),y=s("%I:%M"),g=s("%I %p"),m=s("%a %d"),x=s("%b %d"),b=s("%B"),w=s("%Y"),M=[[a,1,Jv],[a,5,5*Jv],[a,15,15*Jv],[a,30,30*Jv],[u,1,Qv],[u,5,5*Qv],[u,15,15*Qv],[u,30,30*Qv],[o,1,Kv],[o,3,3*Kv],[o,6,6*Kv],[o,12,12*Kv],[i,1,t_],[i,2,2*t_],[r,1,n_],[n,1,e_],[n,3,3*e_],[t,1,r_]];return h.invert=function(t){return new Date(p(t))},h.domain=function(t){return arguments.length?d(jv.call(t,Pr)):d().map(zr)},h.ticks=function(t,n){var e,r=d(),i=r[0],o=r[r.length-1],u=o<i;return u&&(e=i,i=o,o=e),e=l(t,i,o,n),e=e?e.range(i,o+1):[],u?e.reverse():e},h.tickFormat=function(t,n){return null==n?f:s(n)},h.nice=function(t,n){var e=d();return(t=l(t,e[0],e[e.length-1],n))?d(Gv(e,t)):h},h.copy=function(){return pr(h,qr(t,n,r,i,o,u,a,c,s))},h}function Lr(t){var n=t.length;return function(e){return t[Math.max(0,Math.min(n-1,Math.floor(e*n)))]}}function Rr(t){function n(n){var o=(n-e)/(r-e);return t(i?Math.max(0,Math.min(1,o)):o)}var e=0,r=1,i=!1;return n.domain=function(t){return arguments.length?(e=+t[0],r=+t[1],n):[e,r]},n.clamp=function(t){return arguments.length?(i=!!t,n):i},n.interpolator=function(e){return arguments.length?(t=e,n):t},n.copy=function(){return Rr(t).domain([e,r]).clamp(i)},vr(n)}function Ur(t){return function(){var n=this.ownerDocument,e=this.namespaceURI;return e===x_&&n.documentElement.namespaceURI===x_?n.createElement(t):n.createElementNS(e,t)}}function Dr(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}function Or(){return new Fr}function Fr(){this._="@"+(++T_).toString(36)}function Ir(t,n,e){return t=Yr(t,n,e),function(n){var e=n.relatedTarget;e&&(e===this||8&e.compareDocumentPosition(this))||t.call(this,n)}}function Yr(n,e,r){return function(i){var o=t.event;t.event=i;try{n.call(this,this.__data__,e,r)}finally{t.event=o}}}function Br(t){return t.trim().split(/^|\s+/).map(function(t){var n="",e=t.indexOf(".");return e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),{type:t,name:n}})}function jr(t){return function(){var n=this.__on;if(n){for(var e,r=0,i=-1,o=n.length;r<o;++r)e=n[r],t.type&&e.type!==t.type||e.name!==t.name?n[++i]=e:this.removeEventListener(e.type,e.listener,e.capture);++i?n.length=i:delete this.__on}}}function Hr(t,n,e){var r=E_.hasOwnProperty(t.type)?Ir:Yr;return function(i,o,u){var a,c=this.__on,s=r(n,o,u);if(c)for(var f=0,l=c.length;f<l;++f)if((a=c[f]).type===t.type&&a.name===t.name)return this.removeEventListener(a.type,a.listener,a.capture),this.addEventListener(a.type,a.listener=s,a.capture=e),void(a.value=n);this.addEventListener(t.type,s,e),a={type:t.type,name:t.name,value:n,listener:s,capture:e},c?c.push(a):this.__on=[a]}}function Xr(n,e,r,i){var o=t.event;n.sourceEvent=t.event,t.event=n;try{return e.apply(r,i)}finally{t.event=o}}function Vr(){}function Wr(){return[]}function $r(t,n){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=n}function Zr(t,n,e,r,i,o){for(var u,a=0,c=n.length,s=o.length;a<s;++a)(u=n[a])?(u.__data__=o[a],r[a]=u):e[a]=new $r(t,o[a]);for(;a<c;++a)(u=n[a])&&(i[a]=u)}function Gr(t,n,e,r,i,o,u){var a,c,s,f={},l=n.length,h=o.length,p=new Array(l);for(a=0;a<l;++a)(c=n[a])&&(p[a]=s=j_+u.call(c,c.__data__,a,n),s in f?i[a]=c:f[s]=c);for(a=0;a<h;++a)s=j_+u.call(t,o[a],a,o),(c=f[s])?(r[a]=c,c.__data__=o[a],f[s]=null):e[a]=new $r(t,o[a]);for(a=0;a<l;++a)(c=n[a])&&f[p[a]]===c&&(i[a]=c)}function Jr(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function Qr(t){return function(){this.removeAttribute(t)}}function Kr(t){return function(){this.removeAttributeNS(t.space,t.local)}}function ti(t,n){return function(){this.setAttribute(t,n)}}function ni(t,n){return function(){this.setAttributeNS(t.space,t.local,n)}}function ei(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}}function ri(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}}function ii(t){return function(){this.style.removeProperty(t)}}function oi(t,n,e){return function(){this.style.setProperty(t,n,e)}}function ui(t,n,e){return function(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}}function ai(t){return function(){delete this[t]}}function ci(t,n){return function(){this[t]=n}}function si(t,n){return function(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}}function fi(t){return t.trim().split(/^|\s+/)}function li(t){return t.classList||new hi(t)}function hi(t){this._node=t,this._names=fi(t.getAttribute("class")||"")}function pi(t,n){for(var e=li(t),r=-1,i=n.length;++r<i;)e.add(n[r])}function di(t,n){for(var e=li(t),r=-1,i=n.length;++r<i;)e.remove(n[r])}function vi(t){return function(){pi(this,t)}}function _i(t){return function(){di(this,t)}}function yi(t,n){return function(){(n.apply(this,arguments)?pi:di)(this,t)}}function gi(){this.textContent=""}function mi(t){return function(){this.textContent=t}}function xi(t){return function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}}function bi(){this.innerHTML=""}function wi(t){return function(){this.innerHTML=t}}function Mi(t){return function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}}function Ti(){this.nextSibling&&this.parentNode.appendChild(this)}function Ni(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function ki(){return null}function Si(){var t=this.parentNode;t&&t.removeChild(this)}function Ai(t,n,e){var r=ey(t),i=r.CustomEvent;i?i=new i(n,e):(i=r.document.createEvent("Event"),e?(i.initEvent(n,e.bubbles,e.cancelable),i.detail=e.detail):i.initEvent(n,!1,!1)),t.dispatchEvent(i)}function Ei(t,n){return function(){return Ai(this,t,n)}}function Ci(t,n){return function(){return Ai(this,t,n.apply(this,arguments))}}function zi(t,n){this._groups=t,this._parents=n}function Pi(){return new zi([[document.documentElement]],vy)}function qi(t,n){var e=t.__transition;if(!e||!(e=e[n])||e.state>wy)throw new Error("too late");return e}function Li(t,n){var e=t.__transition;if(!e||!(e=e[n])||e.state>Ty)throw new Error("too late");return e}function Ri(t,n){var e=t.__transition;if(!e||!(e=e[n]))throw new Error("too late");return e}function Ui(t,n,e){function r(t){e.state=My,e.timer.restart(i,e.delay,e.time),e.delay<=t&&i(t-e.delay)}function i(r){var s,f,l,h;if(e.state!==My)return u();for(s in c)if(h=c[s],h.name===e.name){if(h.state===Ny)return ld(i);h.state===ky?(h.state=Ay,h.timer.stop(),h.on.call("interrupt",t,t.__data__,h.index,h.group),delete c[s]):+s<n&&(h.state=Ay,h.timer.stop(),delete c[s])}if(ld(function(){e.state===Ny&&(e.state=ky,e.timer.restart(o,e.delay,e.time),o(r))}),e.state=Ty,e.on.call("start",t,t.__data__,e.index,e.group),e.state===Ty){for(e.state=Ny,a=new Array(l=e.tween.length),s=0,f=-1;s<l;++s)(h=e.tween[s].value.call(t,t.__data__,e.index,e.group))&&(a[++f]=h);a.length=f+1}}function o(n){for(var r=n<e.duration?e.ease.call(null,n/e.duration):(e.timer.restart(u),e.state=Sy,1),i=-1,o=a.length;++i<o;)a[i].call(null,r);e.state===Sy&&(e.on.call("end",t,t.__data__,e.index,e.group),u())}function u(){e.state=Ay,e.timer.stop(),delete c[n];for(var r in c)return;delete t.__transition}var a,c=t.__transition;c[n]=e,e.timer=Vn(r,0,e.time)}function Di(t,n){var e,r;return function(){var i=Li(this,t),o=i.tween;if(o!==e){r=e=o;for(var u=0,a=r.length;u<a;++u)if(r[u].name===n){r=r.slice(),r.splice(u,1);break}}i.tween=r}}function Oi(t,n,e){var r,i;if("function"!=typeof e)throw new Error;return function(){var o=Li(this,t),u=o.tween;if(u!==r){i=(r=u).slice();for(var a={name:n,value:e},c=0,s=i.length;c<s;++c)if(i[c].name===n){i[c]=a;break}c===s&&i.push(a)}o.tween=i}}function Fi(t,n,e){var r=t._id;return t.each(function(){var t=Li(this,r);(t.value||(t.value={}))[n]=e.apply(this,arguments)}),function(t){return Ri(t,r).value[n]}}function Ii(t){return function(){this.removeAttribute(t)}}function Yi(t){return function(){this.removeAttributeNS(t.space,t.local)}}function Bi(t,n,e){var r,i;return function(){var o=this.getAttribute(t);return o===e?null:o===r?i:i=n(r=o,e)}}function ji(t,n,e){var r,i;return function(){var o=this.getAttributeNS(t.space,t.local);return o===e?null:o===r?i:i=n(r=o,e)}}function Hi(t,n,e){var r,i,o;return function(){var u,a=e(this);return null==a?void this.removeAttribute(t):(u=this.getAttribute(t),u===a?null:u===r&&a===i?o:o=n(r=u,i=a))}}function Xi(t,n,e){var r,i,o;return function(){var u,a=e(this);return null==a?void this.removeAttributeNS(t.space,t.local):(u=this.getAttributeNS(t.space,t.local),u===a?null:u===r&&a===i?o:o=n(r=u,i=a))}}function Vi(t,n){function e(){var e=this,r=n.apply(e,arguments);return r&&function(n){e.setAttributeNS(t.space,t.local,r(n))}}return e._value=n,e}function Wi(t,n){function e(){var e=this,r=n.apply(e,arguments);return r&&function(n){e.setAttribute(t,r(n))}}return e._value=n,e}function $i(t,n){return function(){qi(this,t).delay=+n.apply(this,arguments)}}function Zi(t,n){return n=+n,function(){qi(this,t).delay=n}}function Gi(t,n){return function(){Li(this,t).duration=+n.apply(this,arguments)}}function Ji(t,n){return n=+n,function(){Li(this,t).duration=n}}function Qi(t,n){if("function"!=typeof n)throw new Error;return function(){Li(this,t).ease=n}}function Ki(t){return(t+"").trim().split(/^|\s+/).every(function(t){var n=t.indexOf(".");return n>=0&&(t=t.slice(0,n)),!t||"start"===t})}function to(t,n,e){var r,i,o=Ki(n)?qi:Li;return function(){var u=o(this,t),a=u.on;a!==r&&(i=(r=a).copy()).on(n,e),u.on=i}}function no(t){return function(){var n=this.parentNode;for(var e in this.__transition)if(+e!==t)return;n&&n.removeChild(this)}}function eo(t,n){var e,r,i;return function(){var o=ey(this).getComputedStyle(this,null),u=o.getPropertyValue(t),a=(this.style.removeProperty(t),o.getPropertyValue(t));return u===a?null:u===e&&a===r?i:i=n(e=u,r=a)}}function ro(t){return function(){this.style.removeProperty(t)}}function io(t,n,e){var r,i;return function(){var o=ey(this).getComputedStyle(this,null).getPropertyValue(t);return o===e?null:o===r?i:i=n(r=o,e)}}function oo(t,n,e){var r,i,o;return function(){var u=ey(this).getComputedStyle(this,null),a=u.getPropertyValue(t),c=e(this);return null==c&&(this.style.removeProperty(t),c=u.getPropertyValue(t)),a===c?null:a===r&&c===i?o:o=n(r=a,i=c)}}function uo(t,n,e){function r(){var r=this,i=n.apply(r,arguments);return i&&function(n){r.style.setProperty(t,i(n),e)}}return r._value=n,r}function ao(t){return function(){this.textContent=t}}function co(t){return function(){var n=t(this);this.textContent=null==n?"":n}}function so(t,n,e,r){this._groups=t,this._parents=n,this._name=e,this._id=r}function fo(t){return Pi().transition(t)}function lo(){return++Jy}function ho(t,n){for(var e;!(e=t.__transition)||!(e=e[n]);)if(!(t=t.parentNode))return Ky.time=jn(),Ky;return e}function po(t,n,e){var r=t(e);return"translate("+(isFinite(r)?r:n(e))+",0)"}function vo(t,n,e){var r=t(e);return"translate(0,"+(isFinite(r)?r:n(e))+")"}function _o(t){var n=t.bandwidth()/2;return t.round()&&(n=Math.round(n)),function(e){return t(e)+n}}function yo(){return!this.__axis}function go(t,n){function e(e){var s,f=null==i?n.ticks?n.ticks.apply(n,r):n.domain():i,l=null==o?n.tickFormat?n.tickFormat.apply(n,r):ig:o,h=Math.max(u,0)+c,p=t===og||t===ag?po:vo,d=n.range(),v=d[0]+.5,_=d[d.length-1]+.5,y=(n.bandwidth?_o:ig)(n.copy()),g=e.selection?e.selection():e,m=g.selectAll(".domain").data([null]),x=g.selectAll(".tick").data(f,n).order(),b=x.exit(),w=x.enter().append("g").attr("class","tick"),M=x.select("line"),T=x.select("text"),N=t===og||t===cg?-1:1,k=t===cg||t===ug?(s="x","y"):(s="y","x");m=m.merge(m.enter().insert("path",".tick").attr("class","domain").attr("stroke","#000")),x=x.merge(w),M=M.merge(w.append("line").attr("stroke","#000").attr(s+"2",N*u).attr(k+"1",.5).attr(k+"2",.5)),T=T.merge(w.append("text").attr("fill","#000").attr(s,N*h).attr(k,.5).attr("dy",t===og?"0em":t===ag?"0.71em":"0.32em")),e!==g&&(m=m.transition(e),x=x.transition(e),M=M.transition(e),T=T.transition(e),b=b.transition(e).attr("opacity",sg).attr("transform",function(t){return p(y,this.parentNode.__axis||y,t)}),w.attr("opacity",sg).attr("transform",function(t){return p(this.parentNode.__axis||y,y,t)})),b.remove(),m.attr("d",t===cg||t==ug?"M"+N*a+","+v+"H0.5V"+_+"H"+N*a:"M"+v+","+N*a+"V0.5H"+_+"V"+N*a),x.attr("opacity",1).attr("transform",function(t){return p(y,y,t)}),M.attr(s+"2",N*u),T.attr(s,N*h).text(l),g.filter(yo).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===ug?"start":t===cg?"end":"middle"),g.each(function(){this.__axis=y})}var r=[],i=null,o=null,u=6,a=6,c=3;return e.scale=function(t){return arguments.length?(n=t,e):n},e.ticks=function(){return r=rg.call(arguments),e},e.tickArguments=function(t){return arguments.length?(r=null==t?[]:rg.call(t),e):r.slice()},e.tickValues=function(t){return arguments.length?(i=null==t?null:rg.call(t),e):i&&i.slice()},e.tickFormat=function(t){return arguments.length?(o=t,e):o},e.tickSize=function(t){return arguments.length?(u=a=+t,e):u},e.tickSizeInner=function(t){return arguments.length?(u=+t,e):u},e.tickSizeOuter=function(t){return arguments.length?(a=+t,e):a},e.tickPadding=function(t){return arguments.length?(c=+t,e):c},e}function mo(t){return go(og,t)}function xo(t){return go(ug,t)}function bo(t){return go(ag,t)}function wo(t){return go(cg,t)}function Mo(t,n){return t.parent===n.parent?1:2}function To(t){return t.reduce(No,0)/t.length}function No(t,n){return t+n.x}function ko(t){return 1+t.reduce(So,0)}function So(t,n){return Math.max(t,n.y)}function Ao(t){for(var n;n=t.children;)t=n[0];return t}function Eo(t){for(var n;n=t.children;)t=n[n.length-1];return t}function Co(t,n){if(t===n)return t;var e=t.ancestors(),r=n.ancestors(),i=null;for(t=e.pop(),n=r.pop();t===n;)i=t,t=e.pop(),n=r.pop();return i}function zo(t,n){var e,r,i,o,u,a=new Uo(t),c=+t.value&&(a.value=t.value),s=[a];for(null==n&&(n=qo);e=s.pop();)if(c&&(e.value=+e.data.value),(i=n(e.data))&&(u=i.length))for(e.children=new Array(u),o=u-1;o>=0;--o)s.push(r=e.children[o]=new Uo(i[o])),r.parent=e,r.depth=e.depth+1;return a.eachBefore(Ro)}function Po(){return zo(this).eachBefore(Lo)}function qo(t){return t.children}function Lo(t){t.data=t.data.data}function Ro(t){var n=0;do t.height=n;while((t=t.parent)&&t.height<++n)}function Uo(t){this.data=t,this.depth=this.height=0,this.parent=null}function Do(t){this._=t,this.next=null}function Oo(t,n){var e=n.x-t.x,r=n.y-t.y,i=t.r-n.r;return i*i+1e-6>e*e+r*r}function Fo(t,n){var e,r,i,o=null,u=t.head;switch(n.length){case 1:e=Io(n[0]);break;case 2:e=Yo(n[0],n[1]);break;case 3:e=Bo(n[0],n[1],n[2])}for(;u;)i=u._,r=u.next,e&&Oo(e,i)?o=u:(o?(t.tail=o,o.next=null):t.head=t.tail=null,n.push(i),e=Fo(t,n),n.pop(),t.head?(u.next=t.head,t.head=u):(u.next=null,t.head=t.tail=u),o=t.tail,o.next=r),u=r;return t.tail=o,e}function Io(t){return{x:t.x,y:t.y,r:t.r}}function Yo(t,n){var e=t.x,r=t.y,i=t.r,o=n.x,u=n.y,a=n.r,c=o-e,s=u-r,f=a-i,l=Math.sqrt(c*c+s*s);return{x:(e+o+c/l*f)/2,y:(r+u+s/l*f)/2,r:(l+i+a)/2}}function Bo(t,n,e){var r=t.x,i=t.y,o=t.r,u=n.x,a=n.y,c=n.r,s=e.x,f=e.y,l=e.r,h=2*(r-u),p=2*(i-a),d=2*(c-o),v=r*r+i*i-o*o-u*u-a*a+c*c,_=2*(r-s),y=2*(i-f),g=2*(l-o),m=r*r+i*i-o*o-s*s-f*f+l*l,x=_*p-h*y,b=(p*m-y*v)/x-r,w=(y*d-p*g)/x,M=(_*v-h*m)/x-i,T=(h*g-_*d)/x,N=w*w+T*T-1,k=2*(b*w+M*T+o),S=b*b+M*M-o*o,A=(-k-Math.sqrt(k*k-4*N*S))/(2*N);return{x:b+w*A+r,y:M+T*A+i,r:A}}function jo(t,n,e){var r=t.x,i=t.y,o=n.r+e.r,u=t.r+e.r,a=n.x-r,c=n.y-i,s=a*a+c*c;if(s){var f=.5+((u*=u)-(o*=o))/(2*s),l=Math.sqrt(Math.max(0,2*o*(u+s)-(u-=s)*u-o*o))/(2*s);e.x=r+f*a+l*c,e.y=i+f*c-l*a}else e.x=r+u,e.y=i}function Ho(t,n){var e=n.x-t.x,r=n.y-t.y,i=t.r+n.r;return i*i>e*e+r*r}function Xo(t,n,e){var r=t.x-n,i=t.y-e;return r*r+i*i}function Vo(t){this._=t,this.next=null,this.previous=null}function Wo(t){if(!(i=t.length))return 0;var n,e,r,i;if(n=t[0],n.x=0,n.y=0,!(i>1))return n.r;if(e=t[1],n.x=-e.r,e.x=n.r,e.y=0,!(i>2))return n.r+e.r;jo(e,n,r=t[2]);var o,u,a,c,s,f,l,h=n.r*n.r,p=e.r*e.r,d=r.r*r.r,v=h+p+d,_=h*n.x+p*e.x+d*r.x,y=h*n.y+p*e.y+d*r.y;n=new Vo(n),e=new Vo(e),r=new Vo(r),n.next=r.previous=e,e.next=n.previous=r,r.next=e.previous=n;t:for(a=3;a<i;++a){if(jo(n._,e._,r=t[a]),r=new Vo(r),(s=n.previous)===(c=e.next)){if(Ho(c._,r._)){n=e,e=c,--a;continue t}}else{f=c._.r,l=s._.r;do if(f<=l){if(Ho(c._,r._)){e=c,n.next=e,e.previous=n,--a;continue t}c=c.next,f+=c._.r}else{if(Ho(s._,r._)){n=s,n.next=e,e.previous=n,--a;continue t}s=s.previous,l+=s._.r}while(c!==s.next)}for(r.previous=n,r.next=e,n.next=e.previous=e=r,v+=d=r._.r*r._.r,_+=d*r._.x,y+=d*r._.y,h=Xo(n._,o=_/v,u=y/v);(r=r.next)!==e;)(d=Xo(r._,o,u))<h&&(n=r,h=d);e=n.next}for(n=[e._],r=e;(r=r.next)!==e;)n.push(r._);for(r=wg(n),a=0;a<i;++a)n=t[a],n.x-=r.x,n.y-=r.y;return r.r}function $o(t){return null==t?null:Zo(t)}function Zo(t){if("function"!=typeof t)throw new Error;return t}function Go(){return 0}function Jo(t){return Math.sqrt(t.value)}function Qo(t){return function(n){n.children||(n.r=Math.max(0,+t(n)||0))}}function Ko(t,n){return function(e){if(r=e.children){var r,i,o,u=r.length,a=t(e)*n||0;if(a)for(i=0;i<u;++i)r[i].r+=a;if(o=Wo(r),a)for(i=0;i<u;++i)r[i].r-=a;e.r=o+a}}}function tu(t){return function(n){var e=n.parent;n.r*=t,e&&(n.x=e.x+t*n.x,n.y=e.y+t*n.y)}}function nu(t){return t.id}function eu(t){return t.parentId}function ru(t,n){return t.parent===n.parent?1:2}function iu(t){var n=t.children;return n?n[0]:t.t}function ou(t){var n=t.children;return n?n[n.length-1]:t.t}function uu(t,n,e){var r=e/(n.i-t.i);n.c-=r,n.s+=e,t.c+=r,n.z+=e,n.m+=e}function au(t){for(var n,e=0,r=0,i=t.children,o=i.length;--o>=0;)n=i[o],n.z+=e,n.m+=e,e+=n.s+(r+=n.c)}function cu(t,n,e){return t.a.parent===n.parent?t.a:e}function su(t,n){this._=t,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=n}function fu(t){for(var n,e,r,i,o,u=new su(t,0),a=[u];n=a.pop();)if(r=n._.children)for(n.children=new Array(o=r.length),i=o-1;i>=0;--i)a.push(e=n.children[i]=new su(r[i],i)),e.parent=n;return(u.parent=new su(null,0)).children=[u],u}function lu(t,n,e,r,i,o){for(var u,a,c,s,f,l,h,p,d,v,_,y,g=[],m=n.children,x=0,b=m.length,w=n.value;x<b;){for(s=i-e,f=o-r,h=p=l=m[x].value,_=Math.max(f/s,s/f)/(w*t),y=l*l*_,v=Math.max(p/y,y/h),c=x+1;c<b;++c){if(l+=a=m[c].value,a<h&&(h=a),a>p&&(p=a),y=l*l*_,d=Math.max(p/y,y/h),d>v){l-=a;break}v=d}g.push(u={value:l,dice:s<f,children:m.slice(x,c)}),u.dice?Sg(u,e,r,i,w?r+=f*l/w:o):Lg(u,e,r,w?e+=s*l/w:i,o),w-=l,x=c}return g}function hu(t){return t.x+t.vx}function pu(t){return t.y+t.vy}function du(t,n){return n}function vu(t,n){var e=t.get(n);if(!e)throw new Error("missing: "+n);return e}function _u(t){return t.x}function yu(t){return t.y}function gu(){t.event.stopImmediatePropagation()}function mu(t,n){var e=t.document.documentElement,r=_y(t).on("dragstart.drag",null);n&&(r.on("click.drag",Qg,!0),setTimeout(function(){r.on("click.drag",null)},0)),"onselectstart"in e?r.on("selectstart.drag",null):(e.style.MozUserSelect=e.__noselect,delete e.__noselect)}function xu(t,n,e,r,i,o,u,a,c,s){this.target=t,this.type=n,this.subject=e,this.identifier=r,this.active=i,this.x=o,this.y=u,this.dx=a,this.dy=c,this._=s}function bu(){return!t.event.button}function wu(){return this.parentNode}function Mu(n){return null==n?{x:t.event.x,y:t.event.y}:n}function Tu(t){return t[0]}function Nu(t){return t[1]}function ku(){this._=null}function Su(t){t.U=t.C=t.L=t.R=t.P=t.N=null}function Au(t,n){var e=n,r=n.R,i=e.U;i?i.L===e?i.L=r:i.R=r:t._=r,r.U=i,e.U=r,e.R=r.L,e.R&&(e.R.U=e),r.L=e}function Eu(t,n){var e=n,r=n.L,i=e.U;i?i.L===e?i.L=r:i.R=r:t._=r,r.U=i,e.U=r,e.L=r.R,e.L&&(e.L.U=e),r.R=e}function Cu(t){for(;t.L;)t=t.L;return t}function zu(t,n,e,r){var i=[null,null],o=am.push(i)-1;return i.left=t,i.right=n,e&&qu(i,t,n,e),r&&qu(i,n,t,r),om[t.index].halfedges.push(o),om[n.index].halfedges.push(o),i}function Pu(t,n,e){var r=[n,e];return r.left=t,r}function qu(t,n,e,r){t[0]||t[1]?t.left===e?t[1]=r:t[0]=r:(t[0]=r,t.left=n,t.right=e)}function Lu(t,n,e,r,i){var o,u=t[0],a=t[1],c=u[0],s=u[1],f=a[0],l=a[1],h=0,p=1,d=f-c,v=l-s;if(o=n-c,d||!(o>0)){if(o/=d,d<0){if(o<h)return;o<p&&(p=o)}else if(d>0){if(o>p)return;o>h&&(h=o)}if(o=r-c,d||!(o<0)){if(o/=d,d<0){if(o>p)return;o>h&&(h=o)}else if(d>0){if(o<h)return;o<p&&(p=o)}if(o=e-s,v||!(o>0)){if(o/=v,v<0){if(o<h)return;o<p&&(p=o)}else if(v>0){if(o>p)return;o>h&&(h=o)}if(o=i-s,v||!(o<0)){if(o/=v,v<0){if(o>p)return;o>h&&(h=o)}else if(v>0){if(o<h)return;o<p&&(p=o)}return!(h>0||p<1)||(h>0&&(t[0]=[c+h*d,s+h*v]),p<1&&(t[1]=[c+p*d,s+p*v]),!0)}}}}}function Ru(t,n,e,r,i){var o=t[1];if(o)return!0;var u,a,c=t[0],s=t.left,f=t.right,l=s[0],h=s[1],p=f[0],d=f[1],v=(l+p)/2,_=(h+d)/2;if(d===h){if(v<n||v>=r)return;if(l>p){if(c){if(c[1]>=i)return}else c=[v,e];o=[v,i]}else{if(c){if(c[1]<e)return}else c=[v,i];o=[v,e]}}else if(u=(l-p)/(d-h),a=_-u*v,u<-1||u>1)if(l>p){if(c){if(c[1]>=i)return}else c=[(e-a)/u,e];o=[(i-a)/u,i]}else{if(c){if(c[1]<e)return}else c=[(i-a)/u,i];o=[(e-a)/u,e]}else if(h<d){if(c){if(c[0]>=r)return}else c=[n,u*n+a];o=[r,u*r+a]}else{if(c){if(c[0]<n)return}else c=[r,u*r+a];o=[n,u*n+a]}return t[0]=c,t[1]=o,!0}function Uu(t,n,e,r){for(var i,o=am.length;o--;)Ru(i=am[o],t,n,e,r)&&Lu(i,t,n,e,r)&&(Math.abs(i[0][0]-i[1][0])>fm||Math.abs(i[0][1]-i[1][1])>fm)||delete am[o]}function Du(t){return om[t.index]={site:t,halfedges:[]}}function Ou(t,n){var e=t.site,r=n.left,i=n.right;return e===i&&(i=r,r=e),i?Math.atan2(i[1]-r[1],i[0]-r[0]):(e===r?(r=n[1],i=n[0]):(r=n[0],i=n[1]),Math.atan2(r[0]-i[0],i[1]-r[1]))}function Fu(t,n){return n[+(n.left!==t.site)]}function Iu(t,n){return n[+(n.left===t.site)]}function Yu(){for(var t,n,e,r,i=0,o=om.length;i<o;++i)if((t=om[i])&&(r=(n=t.halfedges).length)){var u=new Array(r),a=new Array(r);for(e=0;e<r;++e)u[e]=e,a[e]=Ou(t,am[n[e]]);for(u.sort(function(t,n){return a[n]-a[t]}),e=0;e<r;++e)a[e]=n[u[e]];for(e=0;e<r;++e)n[e]=a[e]}}function Bu(t,n,e,r){var i,o,u,a,c,s,f,l,h,p,d,v,_=om.length,y=!0;for(i=0;i<_;++i)if(o=om[i]){for(u=o.site,c=o.halfedges,a=c.length;a--;)am[c[a]]||c.splice(a,1);for(a=0,s=c.length;a<s;)p=Iu(o,am[c[a]]),d=p[0],v=p[1],f=Fu(o,am[c[++a%s]]),l=f[0],h=f[1],(Math.abs(d-l)>fm||Math.abs(v-h)>fm)&&(c.splice(a,0,am.push(Pu(u,p,Math.abs(d-t)<fm&&r-v>fm?[t,Math.abs(l-t)<fm?h:r]:Math.abs(v-r)<fm&&e-d>fm?[Math.abs(h-r)<fm?l:e,r]:Math.abs(d-e)<fm&&v-n>fm?[e,Math.abs(l-e)<fm?h:n]:Math.abs(v-n)<fm&&d-t>fm?[Math.abs(h-n)<fm?l:t,n]:null))-1),++s);s&&(y=!1)}if(y){var g,m,x,b=1/0;for(i=0,y=null;i<_;++i)(o=om[i])&&(u=o.site,g=u[0]-t,m=u[1]-n,x=g*g+m*m,x<b&&(b=x,y=o));if(y){var w=[t,n],M=[t,r],T=[e,r],N=[e,n];y.halfedges.push(am.push(Pu(u=y.site,w,M))-1,am.push(Pu(u,M,T))-1,am.push(Pu(u,T,N))-1,am.push(Pu(u,N,w))-1)}}for(i=0;i<_;++i)(o=om[i])&&(o.halfedges.length||delete om[i])}function ju(){Su(this),this.x=this.y=this.arc=this.site=this.cy=null}function Hu(t){var n=t.P,e=t.N;if(n&&e){var r=n.site,i=t.site,o=e.site;if(r!==o){var u=i[0],a=i[1],c=r[0]-u,s=r[1]-a,f=o[0]-u,l=o[1]-a,h=2*(c*l-s*f);if(!(h>=-lm)){var p=c*c+s*s,d=f*f+l*l,v=(l*p-s*d)/h,_=(c*d-f*p)/h,y=cm.pop()||new ju;y.arc=t,y.site=i,y.x=v+u,y.y=(y.cy=_+a)+Math.sqrt(v*v+_*_),t.circle=y;for(var g=null,m=um._;m;)if(y.y<m.y||y.y===m.y&&y.x<=m.x){if(!m.L){g=m.P;break}m=m.L}else{if(!m.R){g=m;break}m=m.R}um.insert(g,y),g||(rm=y)}}}}function Xu(t){var n=t.circle;n&&(n.P||(rm=n.N),um.remove(n),cm.push(n),Su(n),t.circle=null)}function Vu(){Su(this),this.edge=this.site=this.circle=null}function Wu(t){var n=sm.pop()||new Vu;return n.site=t,n}function $u(t){Xu(t),im.remove(t),sm.push(t),Su(t)}function Zu(t){var n=t.circle,e=n.x,r=n.cy,i=[e,r],o=t.P,u=t.N,a=[t];$u(t);for(var c=o;c.circle&&Math.abs(e-c.circle.x)<fm&&Math.abs(r-c.circle.cy)<fm;)o=c.P,a.unshift(c),$u(c),c=o;a.unshift(c),Xu(c);for(var s=u;s.circle&&Math.abs(e-s.circle.x)<fm&&Math.abs(r-s.circle.cy)<fm;)u=s.N,a.push(s),$u(s),s=u;a.push(s),Xu(s);var f,l=a.length;for(f=1;f<l;++f)s=a[f],c=a[f-1],qu(s.edge,c.site,s.site,i);c=a[0],s=a[l-1],s.edge=zu(c.site,s.site,null,i),Hu(c),Hu(s)}function Gu(t){for(var n,e,r,i,o=t[0],u=t[1],a=im._;a;)if(r=Ju(a,u)-o,r>fm)a=a.L;else{if(i=o-Qu(a,u),!(i>fm)){r>-fm?(n=a.P,e=a):i>-fm?(n=a,e=a.N):n=e=a;break}if(!a.R){n=a;break}a=a.R}Du(t);var c=Wu(t);if(im.insert(n,c),n||e){if(n===e)return Xu(n),e=Wu(n.site),im.insert(c,e),c.edge=e.edge=zu(n.site,c.site),Hu(n),void Hu(e);if(!e)return void(c.edge=zu(n.site,c.site));Xu(n),Xu(e);var s=n.site,f=s[0],l=s[1],h=t[0]-f,p=t[1]-l,d=e.site,v=d[0]-f,_=d[1]-l,y=2*(h*_-p*v),g=h*h+p*p,m=v*v+_*_,x=[(_*g-p*m)/y+f,(h*m-v*g)/y+l];qu(e.edge,s,d,x),c.edge=zu(s,t,null,x),e.edge=zu(t,d,null,x),Hu(n),Hu(e)}}function Ju(t,n){var e=t.site,r=e[0],i=e[1],o=i-n;if(!o)return r;var u=t.P;if(!u)return-(1/0);e=u.site;var a=e[0],c=e[1],s=c-n;if(!s)return a;var f=a-r,l=1/o-1/s,h=f/s;return l?(-h+Math.sqrt(h*h-2*l*(f*f/(-2*s)-c+s/2+i-o/2)))/l+r:(r+a)/2}function Qu(t,n){var e=t.N;if(e)return Ju(e,n);var r=t.site;return r[1]===n?r[0]:1/0}function Ku(t,n,e){return(t[0]-e[0])*(n[1]-t[1])-(t[0]-n[0])*(e[1]-t[1])}function ta(t,n){return n[1]-t[1]||n[0]-t[0]}function na(t,n){var e,r,i,o=t.sort(ta).pop();for(am=[],om=new Array(t.length),im=new ku,um=new ku;;)if(i=rm,o&&(!i||o[1]<i.y||o[1]===i.y&&o[0]<i.x))o[0]===e&&o[1]===r||(Gu(o),e=o[0],r=o[1]),o=t.pop();else{if(!i)break;Zu(i.arc)}if(Yu(),n){var u=+n[0][0],a=+n[0][1],c=+n[1][0],s=+n[1][1];Uu(u,a,c,s),Bu(u,a,c,s)}this.edges=am,this.cells=om,im=um=am=om=null}function ea(t,n,e){this.target=t,this.type=n,this.transform=e}function ra(t,n,e){this.k=t,this.x=n,this.y=e}function ia(t){return t.__zoom||dm}function oa(){t.event.stopImmediatePropagation()}function ua(){return!t.event.button}function aa(){var t,n,e=this;return e instanceof SVGElement?(e=e.ownerSVGElement||e,t=e.width.baseVal.value,n=e.height.baseVal.value):(t=e.clientWidth,n=e.clientHeight),[[0,0],[t,n]]}function ca(){return this.__zoom||dm}function sa(){t.event.stopImmediatePropagation()}function fa(t){return{type:t}}function la(){return!t.event.button}function ha(){var t=this.ownerSVGElement||this;return[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]}function pa(t){for(;!t.__brush;)if(!(t=t.parentNode))return;return t.__brush}function da(t){return t[0][0]===t[1][0]||t[0][1]===t[1][1]}function va(t){var n=t.__brush;return n?n.dim.output(n.selection):null}function _a(){return ga(Tm)}function ya(){return ga(Nm)}function ga(n){function e(t){var e=t.property("__brush",a).selectAll(".overlay").data([fa("overlay")]);e.enter().append("rect").attr("class","overlay").attr("pointer-events","all").attr("cursor",Sm.overlay).merge(e).each(function(){var t=pa(this).extent;_y(this).attr("x",t[0][0]).attr("y",t[0][1]).attr("width",t[1][0]-t[0][0]).attr("height",t[1][1]-t[0][1])}),t.selectAll(".selection").data([fa("selection")]).enter().append("rect").attr("class","selection").attr("cursor",Sm.selection).attr("fill","#777").attr("fill-opacity",.3).attr("stroke","#fff").attr("shape-rendering","crispEdges");var i=t.selectAll(".handle").data(n.handles,function(t){return t.type});i.exit().remove(),i.enter().append("rect").attr("class",function(t){return"handle handle--"+t.type}).attr("cursor",function(t){return Sm[t.type]}),t.each(r).attr("fill","none").attr("pointer-events","all").style("-webkit-tap-highlight-color","rgba(0,0,0,0)").on("mousedown.brush touchstart.brush",u)}function r(){var t=_y(this),n=pa(this).selection;n?(t.selectAll(".selection").style("display",null).attr("x",n[0][0]).attr("y",n[0][1]).attr("width",n[1][0]-n[0][0]).attr("height",n[1][1]-n[0][1]),t.selectAll(".handle").style("display",null).attr("x",function(t){return"e"===t.type[t.type.length-1]?n[1][0]-h/2:n[0][0]-h/2}).attr("y",function(t){return"s"===t.type[0]?n[1][1]-h/2:n[0][1]-h/2}).attr("width",function(t){return"n"===t.type||"s"===t.type?n[1][0]-n[0][0]+h:h}).attr("height",function(t){return"e"===t.type||"w"===t.type?n[1][1]-n[0][1]+h:h})):t.selectAll(".selection,.handle").style("display","none").attr("x",null).attr("y",null).attr("width",null).attr("height",null)}function i(t,n){return t.__brush.emitter||new o(t,n)}function o(t,n){this.that=t,this.args=n,this.state=t.__brush,this.active=0}function u(){function e(){var t=L_(T);!U||w||M||(Math.abs(t[0]-O[0])>Math.abs(t[1]-O[1])?M=!0:w=!0),O=t,b=!0,mm(),o()}function o(){var t;switch(m=O[0]-D[0],x=O[1]-D[1],k){case bm:case xm:S&&(m=Math.max(P-l,Math.min(L-v,m)),h=l+m,_=v+m),A&&(x=Math.max(q-p,Math.min(R-y,x)),d=p+x,g=y+x);break;case wm:S<0?(m=Math.max(P-l,Math.min(L-l,m)),h=l+m,_=v):S>0&&(m=Math.max(P-v,Math.min(L-v,m)),h=l,_=v+m),A<0?(x=Math.max(q-p,Math.min(R-p,x)),d=p+x,g=y):A>0&&(x=Math.max(q-y,Math.min(R-y,x)),d=p,g=y+x);break;case Mm:S&&(h=Math.max(P,Math.min(L,l-m*S)),_=Math.max(P,Math.min(L,v+m*S))),A&&(d=Math.max(q,Math.min(R,p-x*A)),g=Math.max(q,Math.min(R,y+x*A)))}_<h&&(S*=-1,t=l,l=v,v=t,t=h,h=_,_=t,N in Am&&Y.attr("cursor",Sm[N=Am[N]])),g<d&&(A*=-1,t=p,p=y,y=t,t=d,d=g,g=t,N in Em&&Y.attr("cursor",Sm[N=Em[N]])),E.selection&&(z=E.selection),w&&(h=z[0][0],_=z[1][0]),M&&(d=z[0][1],g=z[1][1]),z[0][0]===h&&z[0][1]===d&&z[1][0]===_&&z[1][1]===g||(E.selection=[[h,d],[_,g]],r.call(T),F.brush())}function u(){if(sa(),t.event.touches){if(t.event.touches.length)return;c&&clearTimeout(c),c=setTimeout(function(){c=null},500),I.on("touchmove.brush touchend.brush touchcancel.brush",null)}else mu(t.event.view,b),B.on("keydown.brush keyup.brush mousemove.brush mouseup.brush",null);I.attr("pointer-events","all"),Y.attr("cursor",Sm.overlay),E.selection&&(z=E.selection),da(z)&&(E.selection=null,r.call(T)),F.end()}function a(){switch(t.event.keyCode){case 16:U=S&&A;break;case 18:k===wm&&(S&&(v=_-m*S,l=h+m*S),A&&(y=g-x*A,p=d+x*A),k=Mm,o());break;case 32:k!==wm&&k!==Mm||(S<0?v=_-m:S>0&&(l=h-m),A<0?y=g-x:A>0&&(p=d-x),k=bm,Y.attr("cursor",Sm.selection),o());break;default:return}mm()}function s(){switch(t.event.keyCode){case 16:U&&(w=M=U=!1,o());break;case 18:k===Mm&&(S<0?v=_:S>0&&(l=h),A<0?y=g:A>0&&(p=d),k=wm,o());break;case 32:k===bm&&(t.event.altKey?(S&&(v=_-m*S,l=h+m*S),A&&(y=g-x*A,p=d+x*A),k=Mm):(S<0?v=_:S>0&&(l=h),A<0?y=g:A>0&&(p=d),k=wm),Y.attr("cursor",Sm[N]),o());break;default:return}mm()}if(t.event.touches){if(t.event.changedTouches.length<t.event.touches.length)return mm()}else if(c)return;if(f.apply(this,arguments)){var l,h,p,d,v,_,y,g,m,x,b,w,M,T=this,N=t.event.target.__data__.type,k="selection"===(t.event.metaKey?N="overlay":N)?xm:t.event.altKey?Mm:wm,S=n===Nm?null:Cm[N],A=n===Tm?null:zm[N],E=pa(T),C=E.extent,z=E.selection,P=C[0][0],q=C[0][1],L=C[1][0],R=C[1][1],U=S&&A&&t.event.shiftKey,D=L_(T),O=D,F=i(T,arguments).beforestart();"overlay"===N?E.selection=z=[[l=n===Nm?P:D[0],p=n===Tm?q:D[1]],[v=n===Nm?L:l,y=n===Tm?R:p]]:(l=z[0][0],p=z[0][1],v=z[1][0],y=z[1][1]),h=l,d=p,_=v,g=y;var I=_y(T).attr("pointer-events","none"),Y=I.selectAll(".overlay").attr("cursor",Sm[N]);if(t.event.touches)I.on("touchmove.brush",e,!0).on("touchend.brush touchcancel.brush",u,!0);else{var B=_y(t.event.view).on("keydown.brush",a,!0).on("keyup.brush",s,!0).on("mousemove.brush",e,!0).on("mouseup.brush",u,!0);Kg(t.event.view)}sa(),Cy(T),r.call(T),F.start()}}function a(){var t=this.__brush||{selection:null};return t.extent=s.apply(this,arguments),t.dim=n,t}var c,s=ha,f=la,l=Pn(e,"start","brush","end"),h=6;return e.move=function(t,e){t.selection?t.on("start.brush",function(){i(this,arguments).beforestart().start()}).on("interrupt.brush end.brush",function(){i(this,arguments).end()}).tween("brush",function(){function t(t){u.selection=1===t&&da(s)?null:f(t),r.call(o),a.brush()}var o=this,u=o.__brush,a=i(o,arguments),c=u.selection,s=n.input("function"==typeof e?e.apply(this,arguments):e,u.extent),f=dp(c,s);
return c&&s?t:t(1)}):t.each(function(){var t=this,o=arguments,u=t.__brush,a=n.input("function"==typeof e?e.apply(t,o):e,u.extent),c=i(t,o).beforestart();Cy(t),u.selection=null==a||da(a)?null:a,r.call(t),c.start().brush().end()})},o.prototype={beforestart:function(){return 1===++this.active&&(this.state.emitter=this,this.starting=!0),this},start:function(){return this.starting&&(this.starting=!1,this.emit("start")),this},brush:function(){return this.emit("brush"),this},end:function(){return 0===--this.active&&(delete this.state.emitter,this.emit("end")),this},emit:function(t){Xr(new gm(e,t,n.output(this.state.selection)),l.apply,l,[t,this.that,this.args])}},e.extent=function(t){return arguments.length?(s="function"==typeof t?t:ym([[+t[0][0],+t[0][1]],[+t[1][0],+t[1][1]]]),e):s},e.filter=function(t){return arguments.length?(f="function"==typeof t?t:ym(!!t),e):f},e.handleSize=function(t){return arguments.length?(h=+t,e):h},e.on=function(){var t=l.on.apply(l,arguments);return t===l?e:t},e}function ma(t){return function(n,e){return t(n.source.value+n.target.value,e.source.value+e.target.value)}}function xa(t){return t.source}function ba(t){return t.target}function wa(t){return t.radius}function Ma(t){return t.startAngle}function Ta(t){return t.endAngle}function Na(){this.reset()}function ka(t,n,e){var r=t.s=n+e,i=r-n,o=r-i;t.t=n-o+(e-i)}function Sa(t){return t>1?0:t<-1?Tx:Math.acos(t)}function Aa(t){return t>1?Nx:t<-1?-Nx:Math.asin(t)}function Ea(t){return(t=Ox(t/2))*t}function Ca(){}function za(t,n){t&&jx.hasOwnProperty(t.type)&&jx[t.type](t,n)}function Pa(t,n,e){var r,i=-1,o=t.length-e;for(n.lineStart();++i<o;)r=t[i],n.point(r[0],r[1],r[2]);n.lineEnd()}function qa(t,n){var e=-1,r=t.length;for(n.polygonStart();++e<r;)Pa(t[e],n,1);n.polygonEnd()}function La(){Wx.point=Ua}function Ra(){Da(Hm,Xm)}function Ua(t,n){Wx.point=Da,Hm=t,Xm=n,t*=Ex,n*=Ex,Vm=t,Wm=qx(n=n/2+kx),$m=Ox(n)}function Da(t,n){t*=Ex,n*=Ex,n=n/2+kx;var e=t-Vm,r=e>=0?1:-1,i=r*e,o=qx(n),u=Ox(n),a=$m*u,c=Wm*o+a*qx(i),s=a*r*Ox(i);Xx.add(Px(s,c)),Vm=t,Wm=o,$m=u}function Oa(t){return[Px(t[1],t[0]),Aa(t[2])]}function Fa(t){var n=t[0],e=t[1],r=qx(e);return[r*qx(n),r*Ox(n),Ox(e)]}function Ia(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function Ya(t,n){return[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]]}function Ba(t,n){t[0]+=n[0],t[1]+=n[1],t[2]+=n[2]}function ja(t,n){return[t[0]*n,t[1]*n,t[2]*n]}function Ha(t){var n=Ix(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]/=n,t[1]/=n,t[2]/=n}function Xa(t,n){rx.push(ix=[Zm=t,Jm=t]),n<Gm&&(Gm=n),n>Qm&&(Qm=n)}function Va(t,n){var e=Fa([t*Ex,n*Ex]);if(ex){var r=Ya(ex,e),i=[r[1],-r[0],0],o=Ya(i,r);Ha(o),o=Oa(o);var u,a=t-Km,c=a>0?1:-1,s=o[0]*Ax*c,f=Cx(a)>180;f^(c*Km<s&&s<c*t)?(u=o[1]*Ax,u>Qm&&(Qm=u)):(s=(s+360)%360-180,f^(c*Km<s&&s<c*t)?(u=-o[1]*Ax,u<Gm&&(Gm=u)):(n<Gm&&(Gm=n),n>Qm&&(Qm=n))),f?t<Km?Qa(Zm,t)>Qa(Zm,Jm)&&(Jm=t):Qa(t,Jm)>Qa(Zm,Jm)&&(Zm=t):Jm>=Zm?(t<Zm&&(Zm=t),t>Jm&&(Jm=t)):t>Km?Qa(Zm,t)>Qa(Zm,Jm)&&(Jm=t):Qa(t,Jm)>Qa(Zm,Jm)&&(Zm=t)}else Xa(t,n);ex=e,Km=t}function Wa(){Gx.point=Va}function $a(){ix[0]=Zm,ix[1]=Jm,Gx.point=Xa,ex=null}function Za(t,n){if(ex){var e=t-Km;Zx.add(Cx(e)>180?e+(e>0?360:-360):e)}else tx=t,nx=n;Wx.point(t,n),Va(t,n)}function Ga(){Wx.lineStart()}function Ja(){Za(tx,nx),Wx.lineEnd(),Cx(Zx)>wx&&(Zm=-(Jm=180)),ix[0]=Zm,ix[1]=Jm,ex=null}function Qa(t,n){return(n-=t)<0?n+360:n}function Ka(t,n){return t[0]-n[0]}function tc(t,n){return t[0]<=t[1]?t[0]<=n&&n<=t[1]:n<t[0]||t[1]<n}function nc(t,n){t*=Ex,n*=Ex;var e=qx(n);ec(e*qx(t),e*Ox(t),Ox(n))}function ec(t,n,e){++ox,ax+=(t-ax)/ox,cx+=(n-cx)/ox,sx+=(e-sx)/ox}function rc(){Qx.point=ic}function ic(t,n){t*=Ex,n*=Ex;var e=qx(n);gx=e*qx(t),mx=e*Ox(t),xx=Ox(n),Qx.point=oc,ec(gx,mx,xx)}function oc(t,n){t*=Ex,n*=Ex;var e=qx(n),r=e*qx(t),i=e*Ox(t),o=Ox(n),u=Px(Ix((u=mx*o-xx*i)*u+(u=xx*r-gx*o)*u+(u=gx*i-mx*r)*u),gx*r+mx*i+xx*o);ux+=u,fx+=u*(gx+(gx=r)),lx+=u*(mx+(mx=i)),hx+=u*(xx+(xx=o)),ec(gx,mx,xx)}function uc(){Qx.point=nc}function ac(){Qx.point=sc}function cc(){fc(_x,yx),Qx.point=nc}function sc(t,n){_x=t,yx=n,t*=Ex,n*=Ex,Qx.point=fc;var e=qx(n);gx=e*qx(t),mx=e*Ox(t),xx=Ox(n),ec(gx,mx,xx)}function fc(t,n){t*=Ex,n*=Ex;var e=qx(n),r=e*qx(t),i=e*Ox(t),o=Ox(n),u=mx*o-xx*i,a=xx*r-gx*o,c=gx*i-mx*r,s=Ix(u*u+a*a+c*c),f=gx*r+mx*i+xx*o,l=s&&-Sa(f)/s,h=Px(s,f);px+=l*u,dx+=l*a,vx+=l*c,ux+=h,fx+=h*(gx+(gx=r)),lx+=h*(mx+(mx=i)),hx+=h*(xx+(xx=o)),ec(gx,mx,xx)}function lc(t,n){return[t>Tx?t-Sx:t<-Tx?t+Sx:t,n]}function hc(t,n,e){return(t%=Sx)?n||e?nb(dc(t),vc(n,e)):dc(t):n||e?vc(n,e):lc}function pc(t){return function(n,e){return n+=t,[n>Tx?n-Sx:n<-Tx?n+Sx:n,e]}}function dc(t){var n=pc(t);return n.invert=pc(-t),n}function vc(t,n){function e(t,n){var e=qx(n),a=qx(t)*e,c=Ox(t)*e,s=Ox(n),f=s*r+a*i;return[Px(c*o-f*u,a*r-s*i),Aa(f*o+c*u)]}var r=qx(t),i=Ox(t),o=qx(n),u=Ox(n);return e.invert=function(t,n){var e=qx(n),a=qx(t)*e,c=Ox(t)*e,s=Ox(n),f=s*o-c*u;return[Px(c*o+s*u,a*r+f*i),Aa(f*r-a*i)]},e}function _c(t,n,e,r,i,o){if(e){var u=qx(n),a=Ox(n),c=r*e;null==i?(i=n+r*Sx,o=n-c/2):(i=yc(u,i),o=yc(u,o),(r>0?i<o:i>o)&&(i+=r*Sx));for(var s,f=i;r>0?f>o:f<o;f-=c)s=Oa([u,-a*qx(f),-a*Ox(f)]),t.point(s[0],s[1])}}function yc(t,n){n=Fa(n),n[0]-=t,Ha(n);var e=Sa(-n[1]);return((-n[2]<0?-e:e)+Sx-wx)%Sx}function gc(t,n,e,r){this.x=t,this.z=n,this.o=e,this.e=r,this.v=!1,this.n=this.p=null}function mc(t){if(n=t.length){for(var n,e,r=0,i=t[0];++r<n;)i.n=e=t[r],e.p=i,i=e;i.n=e=t[0],e.p=i}}function xc(t,n,e,r){function i(i,o){return t<=i&&i<=e&&n<=o&&o<=r}function o(i,o,a,s){var f=0,l=0;if(null==i||(f=u(i,a))!==(l=u(o,a))||c(i,o)<0^a>0){do s.point(0===f||3===f?t:e,f>1?r:n);while((f=(f+a+4)%4)!==l)}else s.point(o[0],o[1])}function u(r,i){return Cx(r[0]-t)<wx?i>0?0:3:Cx(r[0]-e)<wx?i>0?2:1:Cx(r[1]-n)<wx?i>0?1:0:i>0?3:2}function a(t,n){return c(t.x,n.x)}function c(t,n){var e=u(t,1),r=u(n,1);return e!==r?e-r:0===e?n[1]-t[1]:1===e?t[0]-n[0]:2===e?t[1]-n[1]:n[0]-t[0]}return function(u){function c(t,n){i(t,n)&&k.point(t,n)}function s(){for(var n=0,e=0,i=_.length;e<i;++e)for(var o,u,a=_[e],c=1,s=a.length,f=a[0],l=f[0],h=f[1];c<s;++c)o=l,u=h,f=a[c],l=f[0],h=f[1],u<=r?h>r&&(l-o)*(r-u)>(h-u)*(t-o)&&++n:h<=r&&(l-o)*(r-u)<(h-u)*(t-o)&&--n;return n}function f(){k=S,v=[],_=[],N=!0}function l(){var t=s(),n=N&&t,e=(v=Zs(v)).length;(n||e)&&(u.polygonStart(),n&&(u.lineStart(),o(null,null,1,u),u.lineEnd()),e&&gb(v,a,t,o,u),u.polygonEnd()),k=u,v=_=y=null}function h(){A.point=d,_&&_.push(y=[]),T=!0,M=!1,b=w=NaN}function p(){v&&(d(g,m),x&&M&&S.rejoin(),v.push(S.result())),A.point=c,M&&k.lineEnd()}function d(o,u){var a=i(o,u);if(_&&y.push([o,u]),T)g=o,m=u,x=a,T=!1,a&&(k.lineStart(),k.point(o,u));else if(a&&M)k.point(o,u);else{var c=[b=Math.max(xb,Math.min(mb,b)),w=Math.max(xb,Math.min(mb,w))],s=[o=Math.max(xb,Math.min(mb,o)),u=Math.max(xb,Math.min(mb,u))];_b(c,s,t,n,e,r)?(M||(k.lineStart(),k.point(c[0],c[1])),k.point(s[0],s[1]),a||k.lineEnd(),N=!1):a&&(k.lineStart(),k.point(o,u),N=!1)}b=o,w=u,M=a}var v,_,y,g,m,x,b,w,M,T,N,k=u,S=vb(),A={point:c,lineStart:h,lineEnd:p,polygonStart:f,polygonEnd:l};return A}}function bc(){Mb.point=Mc,Mb.lineEnd=wc}function wc(){Mb.point=Mb.lineEnd=Ca}function Mc(t,n){t*=Ex,n*=Ex,eb=t,rb=Ox(n),ib=qx(n),Mb.point=Tc}function Tc(t,n){t*=Ex,n*=Ex;var e=Ox(n),r=qx(n),i=Cx(t-eb),o=qx(i),u=Ox(i),a=r*u,c=ib*e-rb*r*o,s=rb*e+ib*r*o;wb.add(Px(Ix(a*a+c*c),s)),eb=t,rb=e,ib=r}function Nc(t,n,e){var r=Us(t,n-wx,e).concat(n);return function(t){return r.map(function(n){return[t,n]})}}function kc(t,n,e){var r=Us(t,n-wx,e).concat(n);return function(t){return r.map(function(n){return[n,t]})}}function Sc(){qb.point=Ac}function Ac(t,n){qb.point=Ec,ob=ab=t,ub=cb=n}function Ec(t,n){Pb.add(cb*t-ab*n),ab=t,cb=n}function Cc(){Ec(ob,ub)}function zc(t,n){t<Lb&&(Lb=t),t>Ub&&(Ub=t),n<Rb&&(Rb=n),n>Db&&(Db=n)}function Pc(t,n){Fb+=t,Ib+=n,++Yb}function qc(){$b.point=Lc}function Lc(t,n){$b.point=Rc,Pc(lb=t,hb=n)}function Rc(t,n){var e=t-lb,r=n-hb,i=Ix(e*e+r*r);Bb+=i*(lb+t)/2,jb+=i*(hb+n)/2,Hb+=i,Pc(lb=t,hb=n)}function Uc(){$b.point=Pc}function Dc(){$b.point=Fc}function Oc(){Ic(sb,fb)}function Fc(t,n){$b.point=Ic,Pc(sb=lb=t,fb=hb=n)}function Ic(t,n){var e=t-lb,r=n-hb,i=Ix(e*e+r*r);Bb+=i*(lb+t)/2,jb+=i*(hb+n)/2,Hb+=i,i=hb*t-lb*n,Xb+=i*(lb+t),Vb+=i*(hb+n),Wb+=3*i,Pc(lb=t,hb=n)}function Yc(t){this._context=t}function Bc(){this._string=[]}function jc(t){return"m0,"+t+"a"+t+","+t+" 0 1,1 0,"+-2*t+"a"+t+","+t+" 0 1,1 0,"+2*t+"z"}function Hc(t){return t.length>1}function Xc(t,n){return((t=t.x)[0]<0?t[1]-Nx-wx:Nx-t[1])-((n=n.x)[0]<0?n[1]-Nx-wx:Nx-n[1])}function Vc(t){var n,e=NaN,r=NaN,i=NaN;return{lineStart:function(){t.lineStart(),n=1},point:function(o,u){var a=o>0?Tx:-Tx,c=Cx(o-e);Cx(c-Tx)<wx?(t.point(e,r=(r+u)/2>0?Nx:-Nx),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(a,r),t.point(o,r),n=0):i!==a&&c>=Tx&&(Cx(e-i)<wx&&(e-=i*wx),Cx(o-a)<wx&&(o-=a*wx),r=Wc(e,r,o,u),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(a,r),n=0),t.point(e=o,r=u),i=a},lineEnd:function(){t.lineEnd(),e=r=NaN},clean:function(){return 2-n}}}function Wc(t,n,e,r){var i,o,u=Ox(t-e);return Cx(u)>wx?zx((Ox(n)*(o=qx(r))*Ox(e)-Ox(r)*(i=qx(n))*Ox(t))/(i*o*u)):(n+r)/2}function $c(t,n,e,r){var i;if(null==t)i=e*Nx,r.point(-Tx,i),r.point(0,i),r.point(Tx,i),r.point(Tx,0),r.point(Tx,-i),r.point(0,-i),r.point(-Tx,-i),r.point(-Tx,0),r.point(-Tx,i);else if(Cx(t[0]-n[0])>wx){var o=t[0]<n[0]?Tx:-Tx;i=e*o/2,r.point(-o,i),r.point(0,i),r.point(o,i)}else r.point(n[0],n[1])}function Zc(t){function n(){}var e=n.prototype=Object.create(Gc.prototype);for(var r in t)e[r]=t[r];return function(t){var e=new n;return e.stream=t,e}}function Gc(){}function Jc(t,n,e){var r=n[1][0]-n[0][0],i=n[1][1]-n[0][1],o=t.clipExtent&&t.clipExtent();t.scale(150).translate([0,0]),null!=o&&t.clipExtent(null),Hx(e,t.stream(Ob));var u=Ob.result(),a=Math.min(r/(u[1][0]-u[0][0]),i/(u[1][1]-u[0][1])),c=+n[0][0]+(r-a*(u[1][0]+u[0][0]))/2,s=+n[0][1]+(i-a*(u[1][1]+u[0][1]))/2;return null!=o&&t.clipExtent(o),t.scale(150*a).translate([c,s])}function Qc(t){return function(n,e){return Jc(t,[[0,0],n],e)}}function Kc(t){return function(n,e){return Jc(t,n,e)}}function ts(t){return Zc({point:function(n,e){n=t(n,e),this.stream.point(n[0],n[1])}})}function ns(t,n){function e(r,i,o,u,a,c,s,f,l,h,p,d,v,_){var y=s-r,g=f-i,m=y*y+g*g;if(m>4*n&&v--){var x=u+h,b=a+p,w=c+d,M=Ix(x*x+b*b+w*w),T=Aa(w/=M),N=Cx(Cx(w)-1)<wx||Cx(o-l)<wx?(o+l)/2:Px(b,x),k=t(N,T),S=k[0],A=k[1],E=S-r,C=A-i,z=g*E-y*C;(z*z/m>n||Cx((y*E+g*C)/m-.5)>.3||u*h+a*p+c*d<rw)&&(e(r,i,o,u,a,c,S,A,N,x/=M,b/=M,w,v,_),_.point(S,A),e(S,A,N,x,b,w,s,f,l,h,p,d,v,_))}}return function(n){function r(e,r){e=t(e,r),n.point(e[0],e[1])}function i(){y=NaN,w.point=o,n.lineStart()}function o(r,i){var o=Fa([r,i]),u=t(r,i);e(y,g,_,m,x,b,y=u[0],g=u[1],_=r,m=o[0],x=o[1],b=o[2],ew,n),n.point(y,g)}function u(){w.point=r,n.lineEnd()}function a(){i(),w.point=c,w.lineEnd=s}function c(t,n){o(f=t,n),l=y,h=g,p=m,d=x,v=b,w.point=o}function s(){e(y,g,_,m,x,b,l,h,f,p,d,v,ew,n),w.lineEnd=u,u()}var f,l,h,p,d,v,_,y,g,m,x,b,w={point:r,lineStart:i,lineEnd:u,polygonStart:function(){n.polygonStart(),w.lineStart=a},polygonEnd:function(){n.polygonEnd(),w.lineStart=i}};return w}}function es(t){return rs(function(){return t})()}function rs(t){function n(t){return t=f(t[0]*Ex,t[1]*Ex),[t[0]*_+a,c-t[1]*_]}function e(t){return t=f.invert((t[0]-a)/_,(c-t[1])/_),t&&[t[0]*Ax,t[1]*Ax]}function r(t,n){return t=u(t,n),[t[0]*_+a,c-t[1]*_]}function i(){f=nb(s=hc(b,w,M),u);var t=u(m,x);return a=y-t[0]*_,c=g+t[1]*_,o()}function o(){return d=v=null,n}var u,a,c,s,f,l,h,p,d,v,_=150,y=480,g=250,m=0,x=0,b=0,w=0,M=0,T=null,N=Kb,k=null,S=Cb,A=.5,E=iw(r,A);return n.stream=function(t){return d&&v===t?d:d=ow(N(s,E(S(v=t))))},n.clipAngle=function(t){return arguments.length?(N=+t?tw(T=t*Ex,6*Ex):(T=null,Kb),o()):T*Ax},n.clipExtent=function(t){return arguments.length?(S=null==t?(k=l=h=p=null,Cb):xc(k=+t[0][0],l=+t[0][1],h=+t[1][0],p=+t[1][1]),o()):null==k?null:[[k,l],[h,p]]},n.scale=function(t){return arguments.length?(_=+t,i()):_},n.translate=function(t){return arguments.length?(y=+t[0],g=+t[1],i()):[y,g]},n.center=function(t){return arguments.length?(m=t[0]%360*Ex,x=t[1]%360*Ex,i()):[m*Ax,x*Ax]},n.rotate=function(t){return arguments.length?(b=t[0]%360*Ex,w=t[1]%360*Ex,M=t.length>2?t[2]%360*Ex:0,i()):[b*Ax,w*Ax,M*Ax]},n.precision=function(t){return arguments.length?(E=iw(r,A=t*t),o()):Ix(A)},n.fitExtent=Kc(n),n.fitSize=Qc(n),function(){return u=t.apply(this,arguments),n.invert=u.invert&&e,i()}}function is(t){var n=0,e=Tx/3,r=rs(t),i=r(n,e);return i.parallels=function(t){return arguments.length?r(n=t[0]*Ex,e=t[1]*Ex):[n*Ax,e*Ax]},i}function os(t){function n(t,n){return[t*e,Ox(n)/e]}var e=qx(t);return n.invert=function(t,n){return[t/e,Aa(n*e)]},n}function us(t,n){function e(t,n){var e=Ix(o-2*i*Ox(n))/i;return[e*Ox(t*=i),u-e*qx(t)]}var r=Ox(t),i=(r+Ox(n))/2;if(Cx(i)<wx)return os(t);var o=1+r*(2*i-r),u=Ix(o)/i;return e.invert=function(t,n){var e=u-n;return[Px(t,Cx(e))/i*Fx(e),Aa((o-(t*t+e*e)*i*i)/(2*i))]},e}function as(t){var n=t.length;return{point:function(e,r){for(var i=-1;++i<n;)t[i].point(e,r)},sphere:function(){for(var e=-1;++e<n;)t[e].sphere()},lineStart:function(){for(var e=-1;++e<n;)t[e].lineStart()},lineEnd:function(){for(var e=-1;++e<n;)t[e].lineEnd()},polygonStart:function(){for(var e=-1;++e<n;)t[e].polygonStart()},polygonEnd:function(){for(var e=-1;++e<n;)t[e].polygonEnd()}}}function cs(t){return function(n,e){var r=qx(n),i=qx(e),o=t(r*i);return[o*i*Ox(n),o*Ox(e)]}}function ss(t){return function(n,e){var r=Ix(n*n+e*e),i=t(r),o=Ox(i),u=qx(i);return[Px(n*o,r*u),Aa(r&&e*o/r)]}}function fs(t,n){return[t,Ux(Yx((Nx+n)/2))]}function ls(t){var n,e=es(t),r=e.scale,i=e.translate,o=e.clipExtent;return e.scale=function(t){return arguments.length?(r(t),n&&e.clipExtent(null),e):r()},e.translate=function(t){return arguments.length?(i(t),n&&e.clipExtent(null),e):i()},e.clipExtent=function(t){if(!arguments.length)return n?null:o();if(n=null==t){var u=Tx*r(),a=i();t=[[a[0]-u,a[1]-u],[a[0]+u,a[1]+u]]}return o(t),e},e.clipExtent(null)}function hs(t){return Yx((Nx+t)/2)}function ps(t,n){function e(t,n){o>0?n<-Nx+wx&&(n=-Nx+wx):n>Nx-wx&&(n=Nx-wx);var e=o/Dx(hs(n),i);return[e*Ox(i*t),o-e*qx(i*t)]}var r=qx(t),i=t===n?Ox(t):Ux(r/qx(n))/Ux(hs(n)/hs(t)),o=r*Dx(hs(t),i)/i;return i?(e.invert=function(t,n){var e=o-n,r=Fx(i)*Ix(t*t+e*e);return[Px(t,Cx(e))/i*Fx(e),2*zx(Dx(o/r,1/i))-Nx]},e):fs}function ds(t,n){return[t,n]}function vs(t,n){function e(t,n){var e=o-n,r=i*t;return[e*Ox(r),o-e*qx(r)]}var r=qx(t),i=t===n?Ox(t):(r-qx(n))/(n-t),o=r/i+t;return Cx(i)<wx?ds:(e.invert=function(t,n){var e=o-n;return[Px(t,Cx(e))/i*Fx(e),o-Fx(i)*Ix(t*t+e*e)]},e)}function _s(t,n){var e=qx(n),r=qx(t)*e;return[e*Ox(t)/r,Ox(n)/r]}function ys(t,n){return[qx(n)*Ox(t),Ox(n)]}function gs(t,n){var e=qx(n),r=1+qx(t)*e;return[e*Ox(t)/r,Ox(n)/r]}function ms(t,n){return[Ux(Yx((Nx+n)/2)),-t]}var xs="4.2.8",bs=function(t,n){return t<n?-1:t>n?1:t>=n?0:NaN},ws=function(t){return 1===t.length&&(t=n(t)),{left:function(n,e,r,i){for(null==r&&(r=0),null==i&&(i=n.length);r<i;){var o=r+i>>>1;t(n[o],e)<0?r=o+1:i=o}return r},right:function(n,e,r,i){for(null==r&&(r=0),null==i&&(i=n.length);r<i;){var o=r+i>>>1;t(n[o],e)>0?i=o:r=o+1}return r}}},Ms=ws(bs),Ts=Ms.right,Ns=Ms.left,ks=function(t,n){return n<t?-1:n>t?1:n>=t?0:NaN},Ss=function(t){return null===t?NaN:+t},As=function(t,n){var e,r,i=t.length,o=0,u=0,a=-1,c=0;if(null==n)for(;++a<i;)isNaN(e=Ss(t[a]))||(r=e-o,o+=r/++c,u+=r*(e-o));else for(;++a<i;)isNaN(e=Ss(n(t[a],a,t)))||(r=e-o,o+=r/++c,u+=r*(e-o));if(c>1)return u/(c-1)},Es=function(t,n){var e=As(t,n);return e?Math.sqrt(e):e},Cs=function(t,n){var e,r,i,o=-1,u=t.length;if(null==n){for(;++o<u;)if(null!=(r=t[o])&&r>=r){e=i=r;break}for(;++o<u;)null!=(r=t[o])&&(e>r&&(e=r),i<r&&(i=r))}else{for(;++o<u;)if(null!=(r=n(t[o],o,t))&&r>=r){e=i=r;break}for(;++o<u;)null!=(r=n(t[o],o,t))&&(e>r&&(e=r),i<r&&(i=r))}return[e,i]},zs=Array.prototype,Ps=zs.slice,qs=zs.map,Ls=function(t){return function(){return t}},Rs=function(t){return t},Us=function(t,n,e){t=+t,n=+n,e=(i=arguments.length)<2?(n=t,t=0,1):i<3?1:+e;for(var r=-1,i=0|Math.max(0,Math.ceil((n-t)/e)),o=new Array(i);++r<i;)o[r]=t+r*e;return o},Ds=Math.sqrt(50),Os=Math.sqrt(10),Fs=Math.sqrt(2),Is=function(t,n,r){var i=e(t,n,r);return Us(Math.ceil(t/i)*i,Math.floor(n/i)*i+i/2,i)},Ys=function(t){return Math.ceil(Math.log(t.length)/Math.LN2)+1},Bs=function(){function t(t){var i,o,u=t.length,a=new Array(u);for(i=0;i<u;++i)a[i]=n(t[i],i,t);var c=e(a),s=c[0],f=c[1],l=r(a,s,f);Array.isArray(l)||(l=Is(s,f,l));for(var h=l.length;l[0]<=s;)l.shift(),--h;for(;l[h-1]>=f;)l.pop(),--h;var p,d=new Array(h+1);for(i=0;i<=h;++i)p=d[i]=[],p.x0=i>0?l[i-1]:s,p.x1=i<h?l[i]:f;for(i=0;i<u;++i)o=a[i],s<=o&&o<=f&&d[Ts(l,o,0,h)].push(t[i]);return d}var n=Rs,e=Cs,r=Ys;return t.value=function(e){return arguments.length?(n="function"==typeof e?e:Ls(e),t):n},t.domain=function(n){return arguments.length?(e="function"==typeof n?n:Ls([n[0],n[1]]),t):e},t.thresholds=function(n){return arguments.length?(r="function"==typeof n?n:Ls(Array.isArray(n)?Ps.call(n):n),t):r},t},js=function(t,n,e){if(null==e&&(e=Ss),r=t.length){if((n=+n)<=0||r<2)return+e(t[0],0,t);if(n>=1)return+e(t[r-1],r-1,t);var r,i=(r-1)*n,o=Math.floor(i),u=+e(t[o],o,t),a=+e(t[o+1],o+1,t);return u+(a-u)*(i-o)}},Hs=function(t,n,e){return t=qs.call(t,Ss).sort(bs),Math.ceil((e-n)/(2*(js(t,.75)-js(t,.25))*Math.pow(t.length,-1/3)))},Xs=function(t,n,e){return Math.ceil((e-n)/(3.5*Es(t)*Math.pow(t.length,-1/3)))},Vs=function(t,n){var e,r,i=-1,o=t.length;if(null==n){for(;++i<o;)if(null!=(r=t[i])&&r>=r){e=r;break}for(;++i<o;)null!=(r=t[i])&&r>e&&(e=r)}else{for(;++i<o;)if(null!=(r=n(t[i],i,t))&&r>=r){e=r;break}for(;++i<o;)null!=(r=n(t[i],i,t))&&r>e&&(e=r)}return e},Ws=function(t,n){var e,r=0,i=t.length,o=-1,u=i;if(null==n)for(;++o<i;)isNaN(e=Ss(t[o]))?--u:r+=e;else for(;++o<i;)isNaN(e=Ss(n(t[o],o,t)))?--u:r+=e;if(u)return r/u},$s=function(t,n){var e,r=[],i=t.length,o=-1;if(null==n)for(;++o<i;)isNaN(e=Ss(t[o]))||r.push(e);else for(;++o<i;)isNaN(e=Ss(n(t[o],o,t)))||r.push(e);return js(r.sort(bs),.5)},Zs=function(t){for(var n,e,r,i=t.length,o=-1,u=0;++o<i;)u+=t[o].length;for(e=new Array(u);--i>=0;)for(r=t[i],n=r.length;--n>=0;)e[--u]=r[n];return e},Gs=function(t,n){var e,r,i=-1,o=t.length;if(null==n){for(;++i<o;)if(null!=(r=t[i])&&r>=r){e=r;break}for(;++i<o;)null!=(r=t[i])&&e>r&&(e=r)}else{for(;++i<o;)if(null!=(r=n(t[i],i,t))&&r>=r){e=r;break}for(;++i<o;)null!=(r=n(t[i],i,t))&&e>r&&(e=r)}return e},Js=function(t){for(var n=0,e=t.length-1,r=t[0],i=new Array(e<0?0:e);n<e;)i[n]=[r,r=t[++n]];return i},Qs=function(t,n){for(var e=n.length,r=new Array(e);e--;)r[e]=t[n[e]];return r},Ks=function(t,n){if(e=t.length){var e,r,i=0,o=0,u=t[o];for(n||(n=bs);++i<e;)(n(r=t[i],u)<0||0!==n(u,u))&&(u=r,o=i);return 0===n(u,u)?o:void 0}},tf=function(t,n,e){for(var r,i,o=(null==e?t.length:e)-(n=null==n?0:+n);o;)i=Math.random()*o--|0,r=t[o+n],t[o+n]=t[i+n],t[i+n]=r;return t},nf=function(t,n){var e,r=0,i=t.length,o=-1;if(null==n)for(;++o<i;)(e=+t[o])&&(r+=e);else for(;++o<i;)(e=+n(t[o],o,t))&&(r+=e);return r},ef=function(t){if(!(o=t.length))return[];for(var n=-1,e=Gs(t,r),i=new Array(e);++n<e;)for(var o,u=-1,a=i[n]=new Array(o);++u<o;)a[u]=t[u][n];return i},rf=function(){return ef(arguments)},of="$";i.prototype=o.prototype={constructor:i,has:function(t){return of+t in this},get:function(t){return this[of+t]},set:function(t,n){return this[of+t]=n,this},remove:function(t){var n=of+t;return n in this&&delete this[n]},clear:function(){for(var t in this)t[0]===of&&delete this[t]},keys:function(){var t=[];for(var n in this)n[0]===of&&t.push(n.slice(1));return t},values:function(){var t=[];for(var n in this)n[0]===of&&t.push(this[n]);return t},entries:function(){var t=[];for(var n in this)n[0]===of&&t.push({key:n.slice(1),value:this[n]});return t},size:function(){var t=0;for(var n in this)n[0]===of&&++t;return t},empty:function(){for(var t in this)if(t[0]===of)return!1;return!0},each:function(t){for(var n in this)n[0]===of&&t(this[n],n.slice(1),this)}};var uf=function(){function t(n,i,u,a){if(i>=f.length)return null!=r?r(n):null!=e?n.sort(e):n;for(var c,s,l,h=-1,p=n.length,d=f[i++],v=o(),_=u();++h<p;)(l=v.get(c=d(s=n[h])+""))?l.push(s):v.set(c,[s]);return v.each(function(n,e){a(_,e,t(n,i,u,a))}),_}function n(t,e){if(++e>f.length)return t;var i,o=l[e-1];return null!=r&&e>=f.length?i=t.entries():(i=[],t.each(function(t,r){i.push({key:r,values:n(t,e)})})),null!=o?i.sort(function(t,n){return o(t.key,n.key)}):i}var e,r,i,f=[],l=[];return i={object:function(n){return t(n,0,u,a)},map:function(n){return t(n,0,c,s)},entries:function(e){return n(t(e,0,c,s),0)},key:function(t){return f.push(t),i},sortKeys:function(t){return l[f.length-1]=t,i},sortValues:function(t){return e=t,i},rollup:function(t){return r=t,i}}},af=o.prototype;f.prototype=l.prototype={constructor:f,has:af.has,add:function(t){return t+="",this[of+t]=t,this},remove:af.remove,clear:af.clear,values:af.keys,size:af.size,empty:af.empty,each:af.each};var cf=function(t){var n=[];for(var e in t)n.push(e);return n},sf=function(t){var n=[];for(var e in t)n.push(t[e]);return n},ff=function(t){var n=[];for(var e in t)n.push({key:e,value:t[e]});return n},lf=function(t,n){return t=null==t?0:+t,n=null==n?1:+n,1===arguments.length?(n=t,t=0):n-=t,function(){return Math.random()*n+t}},hf=function(t,n){var e,r;return t=null==t?0:+t,n=null==n?1:+n,function(){var i;if(null!=e)i=e,e=null;else do e=2*Math.random()-1,i=2*Math.random()-1,r=e*e+i*i;while(!r||r>1);return t+n*i*Math.sqrt(-2*Math.log(r)/r)}},pf=function(){var t=hf.apply(this,arguments);return function(){return Math.exp(t())}},df=function(t){return function(){for(var n=0,e=0;e<t;++e)n+=Math.random();return n}},vf=function(t){var n=df(t);return function(){return n()/t}},_f=function(t){return function(){return-Math.log(1-Math.random())/t}},yf=3,gf=function t(n){function e(t){return Math.pow(t,n)}return n=+n,e.exponent=t,e}(yf),mf=function t(n){function e(t){return 1-Math.pow(1-t,n)}return n=+n,e.exponent=t,e}(yf),xf=function t(n){function e(t){return((t*=2)<=1?Math.pow(t,n):2-Math.pow(2-t,n))/2}return n=+n,e.exponent=t,e}(yf),bf=Math.PI,wf=bf/2,Mf=4/11,Tf=6/11,Nf=8/11,kf=.75,Sf=9/11,Af=10/11,Ef=.9375,Cf=21/22,zf=63/64,Pf=1/Mf/Mf,qf=1.70158,Lf=function t(n){function e(t){return t*t*((n+1)*t-n)}return n=+n,e.overshoot=t,e}(qf),Rf=function t(n){function e(t){return--t*t*((n+1)*t+n)+1}return n=+n,e.overshoot=t,e}(qf),Uf=function t(n){function e(t){return((t*=2)<1?t*t*((n+1)*t-n):(t-=2)*t*((n+1)*t+n)+2)/2}return n=+n,e.overshoot=t,e}(qf),Df=2*Math.PI,Of=1,Ff=.3,If=function t(n,e){function r(t){return n*Math.pow(2,10*--t)*Math.sin((i-t)/e)}var i=Math.asin(1/(n=Math.max(1,n)))*(e/=Df);return r.amplitude=function(n){return t(n,e*Df)},r.period=function(e){return t(n,e)},r}(Of,Ff),Yf=function t(n,e){function r(t){return 1-n*Math.pow(2,-10*(t=+t))*Math.sin((t+i)/e)}var i=Math.asin(1/(n=Math.max(1,n)))*(e/=Df);return r.amplitude=function(n){return t(n,e*Df)},r.period=function(e){return t(n,e)},r}(Of,Ff),Bf=function t(n,e){function r(t){return((t=2*t-1)<0?n*Math.pow(2,10*t)*Math.sin((i-t)/e):2-n*Math.pow(2,-10*t)*Math.sin((i+t)/e))/2}var i=Math.asin(1/(n=Math.max(1,n)))*(e/=Df);return r.amplitude=function(n){return t(n,e*Df)},r.period=function(e){return t(n,e)},r}(Of,Ff),jf=function(t){for(var n,e=-1,r=t.length,i=t[r-1],o=0;++e<r;)n=i,i=t[e],o+=n[1]*i[0]-n[0]*i[1];return o/2},Hf=function(t){for(var n,e,r=-1,i=t.length,o=0,u=0,a=t[i-1],c=0;++r<i;)n=a,a=t[r],c+=e=n[0]*a[1]-a[0]*n[1],o+=(n[0]+a[0])*e,u+=(n[1]+a[1])*e;return c*=3,[o/c,u/c]},Xf=function(t,n,e){return(n[0]-t[0])*(e[1]-t[1])-(n[1]-t[1])*(e[0]-t[0])},Vf=function(t){if((e=t.length)<3)return null;var n,e,r=new Array(e),i=new Array(e);for(n=0;n<e;++n)r[n]=[+t[n][0],+t[n][1],n];for(r.sort(z),n=0;n<e;++n)i[n]=[r[n][0],-r[n][1]];var o=P(r),u=P(i),a=u[0]===o[0],c=u[u.length-1]===o[o.length-1],s=[];for(n=o.length-1;n>=0;--n)s.push(t[r[o[n]][2]]);for(n=+a;n<u.length-c;++n)s.push(t[r[u[n]][2]]);return s},Wf=function(t,n){for(var e,r,i=t.length,o=t[i-1],u=n[0],a=n[1],c=o[0],s=o[1],f=!1,l=0;l<i;++l)o=t[l],e=o[0],r=o[1],r>a!=s>a&&u<(c-e)*(a-r)/(s-r)+e&&(f=!f),c=e,s=r;return f},$f=function(t){for(var n,e,r=-1,i=t.length,o=t[i-1],u=o[0],a=o[1],c=0;++r<i;)n=u,e=a,o=t[r],u=o[0],a=o[1],n-=u,e-=a,c+=Math.sqrt(n*n+e*e);return c},Zf=Math.PI,Gf=2*Zf,Jf=1e-6,Qf=Gf-Jf;q.prototype=L.prototype={constructor:q,moveTo:function(t,n){this._.push("M",this._x0=this._x1=+t,",",this._y0=this._y1=+n)},closePath:function(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._.push("Z"))},lineTo:function(t,n){this._.push("L",this._x1=+t,",",this._y1=+n)},quadraticCurveTo:function(t,n,e,r){this._.push("Q",+t,",",+n,",",this._x1=+e,",",this._y1=+r)},bezierCurveTo:function(t,n,e,r,i,o){this._.push("C",+t,",",+n,",",+e,",",+r,",",this._x1=+i,",",this._y1=+o)},arcTo:function(t,n,e,r,i){t=+t,n=+n,e=+e,r=+r,i=+i;var o=this._x1,u=this._y1,a=e-t,c=r-n,s=o-t,f=u-n,l=s*s+f*f;if(i<0)throw new Error("negative radius: "+i);if(null===this._x1)this._.push("M",this._x1=t,",",this._y1=n);else if(l>Jf)if(Math.abs(f*a-c*s)>Jf&&i){var h=e-o,p=r-u,d=a*a+c*c,v=h*h+p*p,_=Math.sqrt(d),y=Math.sqrt(l),g=i*Math.tan((Zf-Math.acos((d+l-v)/(2*_*y)))/2),m=g/y,x=g/_;Math.abs(m-1)>Jf&&this._.push("L",t+m*s,",",n+m*f),this._.push("A",i,",",i,",0,0,",+(f*h>s*p),",",this._x1=t+x*a,",",this._y1=n+x*c)}else this._.push("L",this._x1=t,",",this._y1=n);else;},arc:function(t,n,e,r,i,o){t=+t,n=+n,e=+e;var u=e*Math.cos(r),a=e*Math.sin(r),c=t+u,s=n+a,f=1^o,l=o?r-i:i-r;if(e<0)throw new Error("negative radius: "+e);null===this._x1?this._.push("M",c,",",s):(Math.abs(this._x1-c)>Jf||Math.abs(this._y1-s)>Jf)&&this._.push("L",c,",",s),e&&(l>Qf?this._.push("A",e,",",e,",0,1,",f,",",t-u,",",n-a,"A",e,",",e,",0,1,",f,",",this._x1=c,",",this._y1=s):(l<0&&(l=l%Gf+Gf),this._.push("A",e,",",e,",0,",+(l>=Zf),",",f,",",this._x1=t+e*Math.cos(i),",",this._y1=n+e*Math.sin(i))))},rect:function(t,n,e,r){this._.push("M",this._x0=this._x1=+t,",",this._y0=this._y1=+n,"h",+e,"v",+r,"h",-e,"Z")},toString:function(){return this._.join("")}};var Kf=function(t){var n=+this._x.call(null,t),e=+this._y.call(null,t);return R(this.cover(n,e),n,e,t)},tl=function(t,n){if(isNaN(t=+t)||isNaN(n=+n))return this;var e=this._x0,r=this._y0,i=this._x1,o=this._y1;if(isNaN(e))i=(e=Math.floor(t))+1,o=(r=Math.floor(n))+1;else{if(!(e>t||t>i||r>n||n>o))return this;var u,a,c=i-e,s=this._root;switch(a=(n<(r+o)/2)<<1|t<(e+i)/2){case 0:do u=new Array(4),u[a]=s,s=u;while(c*=2,i=e+c,o=r+c,t>i||n>o);break;case 1:do u=new Array(4),u[a]=s,s=u;while(c*=2,e=i-c,o=r+c,e>t||n>o);break;case 2:do u=new Array(4),u[a]=s,s=u;while(c*=2,i=e+c,r=o-c,t>i||r>n);break;case 3:do u=new Array(4),u[a]=s,s=u;while(c*=2,e=i-c,r=o-c,e>t||r>n)}this._root&&this._root.length&&(this._root=s)}return this._x0=e,this._y0=r,this._x1=i,this._y1=o,this},nl=function(){var t=[];return this.visit(function(n){if(!n.length)do t.push(n.data);while(n=n.next)}),t},el=function(t){return arguments.length?this.cover(+t[0][0],+t[0][1]).cover(+t[1][0],+t[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]},rl=function(t,n,e,r,i){this.node=t,this.x0=n,this.y0=e,this.x1=r,this.y1=i},il=function(t,n,e){var r,i,o,u,a,c,s,f=this._x0,l=this._y0,h=this._x1,p=this._y1,d=[],v=this._root;for(v&&d.push(new rl(v,f,l,h,p)),null==e?e=1/0:(f=t-e,l=n-e,h=t+e,p=n+e,e*=e);c=d.pop();)if(!(!(v=c.node)||(i=c.x0)>h||(o=c.y0)>p||(u=c.x1)<f||(a=c.y1)<l))if(v.length){var _=(i+u)/2,y=(o+a)/2;d.push(new rl(v[3],_,y,u,a),new rl(v[2],i,y,_,a),new rl(v[1],_,o,u,y),new rl(v[0],i,o,_,y)),(s=(n>=y)<<1|t>=_)&&(c=d[d.length-1],d[d.length-1]=d[d.length-1-s],d[d.length-1-s]=c)}else{var g=t-+this._x.call(null,v.data),m=n-+this._y.call(null,v.data),x=g*g+m*m;if(x<e){var b=Math.sqrt(e=x);f=t-b,l=n-b,h=t+b,p=n+b,r=v.data}}return r},ol=function(t){if(isNaN(o=+this._x.call(null,t))||isNaN(u=+this._y.call(null,t)))return this;var n,e,r,i,o,u,a,c,s,f,l,h,p=this._root,d=this._x0,v=this._y0,_=this._x1,y=this._y1;if(!p)return this;if(p.length)for(;;){if((s=o>=(a=(d+_)/2))?d=a:_=a,(f=u>=(c=(v+y)/2))?v=c:y=c,n=p,!(p=p[l=f<<1|s]))return this;if(!p.length)break;(n[l+1&3]||n[l+2&3]||n[l+3&3])&&(e=n,h=l)}for(;p.data!==t;)if(r=p,!(p=p.next))return this;return(i=p.next)&&delete p.next,r?(i?r.next=i:delete r.next,this):n?(i?n[l]=i:delete n[l],(p=n[0]||n[1]||n[2]||n[3])&&p===(n[3]||n[2]||n[1]||n[0])&&!p.length&&(e?e[h]=p:this._root=p),this):(this._root=i,this)},ul=function(){return this._root},al=function(){var t=0;return this.visit(function(n){if(!n.length)do++t;while(n=n.next)}),t},cl=function(t){var n,e,r,i,o,u,a=[],c=this._root;for(c&&a.push(new rl(c,this._x0,this._y0,this._x1,this._y1));n=a.pop();)if(!t(c=n.node,r=n.x0,i=n.y0,o=n.x1,u=n.y1)&&c.length){var s=(r+o)/2,f=(i+u)/2;(e=c[3])&&a.push(new rl(e,s,f,o,u)),(e=c[2])&&a.push(new rl(e,r,f,s,u)),(e=c[1])&&a.push(new rl(e,s,i,o,f)),(e=c[0])&&a.push(new rl(e,r,i,s,f))}return this},sl=function(t){var n,e=[],r=[];for(this._root&&e.push(new rl(this._root,this._x0,this._y0,this._x1,this._y1));n=e.pop();){var i=n.node;if(i.length){var o,u=n.x0,a=n.y0,c=n.x1,s=n.y1,f=(u+c)/2,l=(a+s)/2;(o=i[0])&&e.push(new rl(o,u,a,f,l)),(o=i[1])&&e.push(new rl(o,f,a,c,l)),(o=i[2])&&e.push(new rl(o,u,l,f,s)),(o=i[3])&&e.push(new rl(o,f,l,c,s))}r.push(n)}for(;n=r.pop();)t(n.node,n.x0,n.y0,n.x1,n.y1);return this},fl=function(t){return arguments.length?(this._x=t,this):this._x},ll=function(t){return arguments.length?(this._y=t,this):this._y},hl=I.prototype=Y.prototype;hl.copy=function(){var t,n,e=new Y(this._x,this._y,this._x0,this._y0,this._x1,this._y1),r=this._root;if(!r)return e;if(!r.length)return e._root=B(r),e;for(t=[{source:r,target:e._root=new Array(4)}];r=t.pop();)for(var i=0;i<4;++i)(n=r.source[i])&&(n.length?t.push({source:n,target:r.target[i]=new Array(4)}):r.target[i]=B(n));return e},hl.add=Kf,hl.addAll=U,hl.cover=tl,hl.data=nl,hl.extent=el,hl.find=il,hl.remove=ol,hl.removeAll=D,hl.root=ul,hl.size=al,hl.visit=cl,hl.visitAfter=sl,hl.x=fl,hl.y=ll;var pl=[].slice,dl={};j.prototype=Z.prototype={constructor:j,defer:function(t){if("function"!=typeof t||this._call)throw new Error;if(null!=this._error)return this;var n=pl.call(arguments,1);return n.push(t),++this._waiting,this._tasks.push(n),H(this),this},abort:function(){return null==this._error&&W(this,new Error("abort")),this},await:function(t){if("function"!=typeof t||this._call)throw new Error;return this._call=function(n,e){t.apply(null,[n].concat(e))},$(this),this},awaitAll:function(t){if("function"!=typeof t||this._call)throw new Error;return this._call=t,$(this),this}};var vl=function(t){return function(){return t}},_l=1e-12,yl=Math.PI,gl=yl/2,ml=2*yl,xl=function(){function t(){var t,s,f=+n.apply(this,arguments),l=+e.apply(this,arguments),h=o.apply(this,arguments)-gl,p=u.apply(this,arguments)-gl,d=Math.abs(p-h),v=p>h;if(c||(c=t=L()),l<f&&(s=l,l=f,f=s),l>_l)if(d>ml-_l)c.moveTo(l*Math.cos(h),l*Math.sin(h)),c.arc(0,0,l,h,p,!v),f>_l&&(c.moveTo(f*Math.cos(p),f*Math.sin(p)),c.arc(0,0,f,p,h,v));else{var _,y,g=h,m=p,x=h,b=p,w=d,M=d,T=a.apply(this,arguments)/2,N=T>_l&&(i?+i.apply(this,arguments):Math.sqrt(f*f+l*l)),k=Math.min(Math.abs(l-f)/2,+r.apply(this,arguments)),S=k,A=k;if(N>_l){var E=nt(N/f*Math.sin(T)),C=nt(N/l*Math.sin(T));(w-=2*E)>_l?(E*=v?1:-1,x+=E,b-=E):(w=0,x=b=(h+p)/2),(M-=2*C)>_l?(C*=v?1:-1,g+=C,m-=C):(M=0,g=m=(h+p)/2)}var z=l*Math.cos(g),P=l*Math.sin(g),q=f*Math.cos(b),R=f*Math.sin(b);if(k>_l){var U=l*Math.cos(m),D=l*Math.sin(m),O=f*Math.cos(x),F=f*Math.sin(x);if(d<yl){var I=w>_l?et(z,P,O,F,U,D,q,R):[q,R],Y=z-I[0],B=P-I[1],j=U-I[0],H=D-I[1],X=1/Math.sin(Math.acos((Y*j+B*H)/(Math.sqrt(Y*Y+B*B)*Math.sqrt(j*j+H*H)))/2),V=Math.sqrt(I[0]*I[0]+I[1]*I[1]);S=Math.min(k,(f-V)/(X-1)),A=Math.min(k,(l-V)/(X+1))}}M>_l?A>_l?(_=rt(O,F,z,P,l,A,v),y=rt(U,D,q,R,l,A,v),c.moveTo(_.cx+_.x01,_.cy+_.y01),A<k?c.arc(_.cx,_.cy,A,Math.atan2(_.y01,_.x01),Math.atan2(y.y01,y.x01),!v):(c.arc(_.cx,_.cy,A,Math.atan2(_.y01,_.x01),Math.atan2(_.y11,_.x11),!v),c.arc(0,0,l,Math.atan2(_.cy+_.y11,_.cx+_.x11),Math.atan2(y.cy+y.y11,y.cx+y.x11),!v),c.arc(y.cx,y.cy,A,Math.atan2(y.y11,y.x11),Math.atan2(y.y01,y.x01),!v))):(c.moveTo(z,P),
c.arc(0,0,l,g,m,!v)):c.moveTo(z,P),f>_l&&w>_l?S>_l?(_=rt(q,R,U,D,f,-S,v),y=rt(z,P,O,F,f,-S,v),c.lineTo(_.cx+_.x01,_.cy+_.y01),S<k?c.arc(_.cx,_.cy,S,Math.atan2(_.y01,_.x01),Math.atan2(y.y01,y.x01),!v):(c.arc(_.cx,_.cy,S,Math.atan2(_.y01,_.x01),Math.atan2(_.y11,_.x11),!v),c.arc(0,0,f,Math.atan2(_.cy+_.y11,_.cx+_.x11),Math.atan2(y.cy+y.y11,y.cx+y.x11),v),c.arc(y.cx,y.cy,S,Math.atan2(y.y11,y.x11),Math.atan2(y.y01,y.x01),!v))):c.arc(0,0,f,b,x,v):c.lineTo(q,R)}else c.moveTo(0,0);if(c.closePath(),t)return c=null,t+""||null}var n=G,e=J,r=vl(0),i=null,o=Q,u=K,a=tt,c=null;return t.centroid=function(){var t=(+n.apply(this,arguments)+ +e.apply(this,arguments))/2,r=(+o.apply(this,arguments)+ +u.apply(this,arguments))/2-yl/2;return[Math.cos(r)*t,Math.sin(r)*t]},t.innerRadius=function(e){return arguments.length?(n="function"==typeof e?e:vl(+e),t):n},t.outerRadius=function(n){return arguments.length?(e="function"==typeof n?n:vl(+n),t):e},t.cornerRadius=function(n){return arguments.length?(r="function"==typeof n?n:vl(+n),t):r},t.padRadius=function(n){return arguments.length?(i=null==n?null:"function"==typeof n?n:vl(+n),t):i},t.startAngle=function(n){return arguments.length?(o="function"==typeof n?n:vl(+n),t):o},t.endAngle=function(n){return arguments.length?(u="function"==typeof n?n:vl(+n),t):u},t.padAngle=function(n){return arguments.length?(a="function"==typeof n?n:vl(+n),t):a},t.context=function(n){return arguments.length?(c=null==n?null:n,t):c},t};it.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:this._context.lineTo(t,n)}}};var bl=function(t){return new it(t)},wl=function(){function t(t){var a,c,s,f=t.length,l=!1;for(null==i&&(u=o(s=L())),a=0;a<=f;++a)!(a<f&&r(c=t[a],a,t))===l&&((l=!l)?u.lineStart():u.lineEnd()),l&&u.point(+n(c,a,t),+e(c,a,t));if(s)return u=null,s+""||null}var n=ot,e=ut,r=vl(!0),i=null,o=bl,u=null;return t.x=function(e){return arguments.length?(n="function"==typeof e?e:vl(+e),t):n},t.y=function(n){return arguments.length?(e="function"==typeof n?n:vl(+n),t):e},t.defined=function(n){return arguments.length?(r="function"==typeof n?n:vl(!!n),t):r},t.curve=function(n){return arguments.length?(o=n,null!=i&&(u=o(i)),t):o},t.context=function(n){return arguments.length?(null==n?i=u=null:u=o(i=n),t):i},t},Ml=function(){function t(t){var n,f,l,h,p,d=t.length,v=!1,_=new Array(d),y=new Array(d);for(null==a&&(s=c(p=L())),n=0;n<=d;++n){if(!(n<d&&u(h=t[n],n,t))===v)if(v=!v)f=n,s.areaStart(),s.lineStart();else{for(s.lineEnd(),s.lineStart(),l=n-1;l>=f;--l)s.point(_[l],y[l]);s.lineEnd(),s.areaEnd()}v&&(_[n]=+e(h,n,t),y[n]=+i(h,n,t),s.point(r?+r(h,n,t):_[n],o?+o(h,n,t):y[n]))}if(p)return s=null,p+""||null}function n(){return wl().defined(u).curve(c).context(a)}var e=ot,r=null,i=vl(0),o=ut,u=vl(!0),a=null,c=bl,s=null;return t.x=function(n){return arguments.length?(e="function"==typeof n?n:vl(+n),r=null,t):e},t.x0=function(n){return arguments.length?(e="function"==typeof n?n:vl(+n),t):e},t.x1=function(n){return arguments.length?(r=null==n?null:"function"==typeof n?n:vl(+n),t):r},t.y=function(n){return arguments.length?(i="function"==typeof n?n:vl(+n),o=null,t):i},t.y0=function(n){return arguments.length?(i="function"==typeof n?n:vl(+n),t):i},t.y1=function(n){return arguments.length?(o=null==n?null:"function"==typeof n?n:vl(+n),t):o},t.lineX0=t.lineY0=function(){return n().x(e).y(i)},t.lineY1=function(){return n().x(e).y(o)},t.lineX1=function(){return n().x(r).y(i)},t.defined=function(n){return arguments.length?(u="function"==typeof n?n:vl(!!n),t):u},t.curve=function(n){return arguments.length?(c=n,null!=a&&(s=c(a)),t):c},t.context=function(n){return arguments.length?(null==n?a=s=null:s=c(a=n),t):a},t},Tl=function(t,n){return n<t?-1:n>t?1:n>=t?0:NaN},Nl=function(t){return t},kl=function(){function t(t){var a,c,s,f,l,h=t.length,p=0,d=new Array(h),v=new Array(h),_=+i.apply(this,arguments),y=Math.min(ml,Math.max(-ml,o.apply(this,arguments)-_)),g=Math.min(Math.abs(y)/h,u.apply(this,arguments)),m=g*(y<0?-1:1);for(a=0;a<h;++a)(l=v[d[a]=a]=+n(t[a],a,t))>0&&(p+=l);for(null!=e?d.sort(function(t,n){return e(v[t],v[n])}):null!=r&&d.sort(function(n,e){return r(t[n],t[e])}),a=0,s=p?(y-h*m)/p:0;a<h;++a,_=f)c=d[a],l=v[c],f=_+(l>0?l*s:0)+m,v[c]={data:t[c],index:a,value:l,startAngle:_,endAngle:f,padAngle:g};return v}var n=Nl,e=Tl,r=null,i=vl(0),o=vl(ml),u=vl(0);return t.value=function(e){return arguments.length?(n="function"==typeof e?e:vl(+e),t):n},t.sortValues=function(n){return arguments.length?(e=n,r=null,t):e},t.sort=function(n){return arguments.length?(r=n,e=null,t):r},t.startAngle=function(n){return arguments.length?(i="function"==typeof n?n:vl(+n),t):i},t.endAngle=function(n){return arguments.length?(o="function"==typeof n?n:vl(+n),t):o},t.padAngle=function(n){return arguments.length?(u="function"==typeof n?n:vl(+n),t):u},t},Sl=ct(bl);at.prototype={areaStart:function(){this._curve.areaStart()},areaEnd:function(){this._curve.areaEnd()},lineStart:function(){this._curve.lineStart()},lineEnd:function(){this._curve.lineEnd()},point:function(t,n){this._curve.point(n*Math.sin(t),n*-Math.cos(t))}};var Al=function(){return st(wl().curve(Sl))},El=function(){var t=Ml().curve(Sl),n=t.curve,e=t.lineX0,r=t.lineX1,i=t.lineY0,o=t.lineY1;return t.angle=t.x,delete t.x,t.startAngle=t.x0,delete t.x0,t.endAngle=t.x1,delete t.x1,t.radius=t.y,delete t.y,t.innerRadius=t.y0,delete t.y0,t.outerRadius=t.y1,delete t.y1,t.lineStartAngle=function(){return st(e())},delete t.lineX0,t.lineEndAngle=function(){return st(r())},delete t.lineX1,t.lineInnerRadius=function(){return st(i())},delete t.lineY0,t.lineOuterRadius=function(){return st(o())},delete t.lineY1,t.curve=function(t){return arguments.length?n(ct(t)):n()._curve},t},Cl={draw:function(t,n){var e=Math.sqrt(n/yl);t.moveTo(e,0),t.arc(0,0,e,0,ml)}},zl={draw:function(t,n){var e=Math.sqrt(n/5)/2;t.moveTo(-3*e,-e),t.lineTo(-e,-e),t.lineTo(-e,-3*e),t.lineTo(e,-3*e),t.lineTo(e,-e),t.lineTo(3*e,-e),t.lineTo(3*e,e),t.lineTo(e,e),t.lineTo(e,3*e),t.lineTo(-e,3*e),t.lineTo(-e,e),t.lineTo(-3*e,e),t.closePath()}},Pl=Math.sqrt(1/3),ql=2*Pl,Ll={draw:function(t,n){var e=Math.sqrt(n/ql),r=e*Pl;t.moveTo(0,-e),t.lineTo(r,0),t.lineTo(0,e),t.lineTo(-r,0),t.closePath()}},Rl=.8908130915292852,Ul=Math.sin(yl/10)/Math.sin(7*yl/10),Dl=Math.sin(ml/10)*Ul,Ol=-Math.cos(ml/10)*Ul,Fl={draw:function(t,n){var e=Math.sqrt(n*Rl),r=Dl*e,i=Ol*e;t.moveTo(0,-e),t.lineTo(r,i);for(var o=1;o<5;++o){var u=ml*o/5,a=Math.cos(u),c=Math.sin(u);t.lineTo(c*e,-a*e),t.lineTo(a*r-c*i,c*r+a*i)}t.closePath()}},Il={draw:function(t,n){var e=Math.sqrt(n),r=-e/2;t.rect(r,r,e,e)}},Yl=Math.sqrt(3),Bl={draw:function(t,n){var e=-Math.sqrt(n/(3*Yl));t.moveTo(0,2*e),t.lineTo(-Yl*e,-e),t.lineTo(Yl*e,-e),t.closePath()}},jl=-.5,Hl=Math.sqrt(3)/2,Xl=1/Math.sqrt(12),Vl=3*(Xl/2+1),Wl={draw:function(t,n){var e=Math.sqrt(n/Vl),r=e/2,i=e*Xl,o=r,u=e*Xl+e,a=-o,c=u;t.moveTo(r,i),t.lineTo(o,u),t.lineTo(a,c),t.lineTo(jl*r-Hl*i,Hl*r+jl*i),t.lineTo(jl*o-Hl*u,Hl*o+jl*u),t.lineTo(jl*a-Hl*c,Hl*a+jl*c),t.lineTo(jl*r+Hl*i,jl*i-Hl*r),t.lineTo(jl*o+Hl*u,jl*u-Hl*o),t.lineTo(jl*a+Hl*c,jl*c-Hl*a),t.closePath()}},$l=[Cl,zl,Ll,Il,Fl,Bl,Wl],Zl=function(){function t(){var t;if(r||(r=t=L()),n.apply(this,arguments).draw(r,+e.apply(this,arguments)),t)return r=null,t+""||null}var n=vl(Cl),e=vl(64),r=null;return t.type=function(e){return arguments.length?(n="function"==typeof e?e:vl(e),t):n},t.size=function(n){return arguments.length?(e="function"==typeof n?n:vl(+n),t):e},t.context=function(n){return arguments.length?(r=null==n?null:n,t):r},t},Gl=function(){};lt.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){switch(this._point){case 3:ft(this,this._x1,this._y1);case 2:this._context.lineTo(this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,this._context.lineTo((5*this._x0+this._x1)/6,(5*this._y0+this._y1)/6);default:ft(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}};var Jl=function(t){return new lt(t)};ht.prototype={areaStart:Gl,areaEnd:Gl,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._y0=this._y1=this._y2=this._y3=this._y4=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x2,this._y2),this._context.closePath();break;case 2:this._context.moveTo((this._x2+2*this._x3)/3,(this._y2+2*this._y3)/3),this._context.lineTo((this._x3+2*this._x2)/3,(this._y3+2*this._y2)/3),this._context.closePath();break;case 3:this.point(this._x2,this._y2),this.point(this._x3,this._y3),this.point(this._x4,this._y4)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x2=t,this._y2=n;break;case 1:this._point=2,this._x3=t,this._y3=n;break;case 2:this._point=3,this._x4=t,this._y4=n,this._context.moveTo((this._x0+4*this._x1+t)/6,(this._y0+4*this._y1+n)/6);break;default:ft(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}};var Ql=function(t){return new ht(t)};pt.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3;var e=(this._x0+4*this._x1+t)/6,r=(this._y0+4*this._y1+n)/6;this._line?this._context.lineTo(e,r):this._context.moveTo(e,r);break;case 3:this._point=4;default:ft(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}};var Kl=function(t){return new pt(t)};dt.prototype={lineStart:function(){this._x=[],this._y=[],this._basis.lineStart()},lineEnd:function(){var t=this._x,n=this._y,e=t.length-1;if(e>0)for(var r,i=t[0],o=n[0],u=t[e]-i,a=n[e]-o,c=-1;++c<=e;)r=c/e,this._basis.point(this._beta*t[c]+(1-this._beta)*(i+r*u),this._beta*n[c]+(1-this._beta)*(o+r*a));this._x=this._y=null,this._basis.lineEnd()},point:function(t,n){this._x.push(+t),this._y.push(+n)}};var th=function t(n){function e(t){return 1===n?new lt(t):new dt(t,n)}return e.beta=function(n){return t(+n)},e}(.85);_t.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:vt(this,this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2,this._x1=t,this._y1=n;break;case 2:this._point=3;default:vt(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var nh=function t(n){function e(t){return new _t(t,n)}return e.tension=function(n){return t(+n)},e}(0);yt.prototype={areaStart:Gl,areaEnd:Gl,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:vt(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var eh=function t(n){function e(t){return new yt(t,n)}return e.tension=function(n){return t(+n)},e}(0);gt.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:vt(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var rh=function t(n){function e(t){return new gt(t,n)}return e.tension=function(n){return t(+n)},e}(0);xt.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:this.point(this._x2,this._y2)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3;default:mt(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var ih=function t(n){function e(t){return n?new xt(t,n):new _t(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);bt.prototype={areaStart:Gl,areaEnd:Gl,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:mt(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var oh=function t(n){function e(t){return n?new bt(t,n):new yt(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);wt.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:mt(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var uh=function t(n){function e(t){return n?new wt(t,n):new gt(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);Mt.prototype={areaStart:Gl,areaEnd:Gl,lineStart:function(){this._point=0},lineEnd:function(){this._point&&this._context.closePath()},point:function(t,n){t=+t,n=+n,this._point?this._context.lineTo(t,n):(this._point=1,this._context.moveTo(t,n))}};var ah=function(t){return new Mt(t)};At.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=this._t0=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x1,this._y1);break;case 3:St(this,this._t0,kt(this,this._t0))}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){var e=NaN;if(t=+t,n=+n,t!==this._x1||n!==this._y1){switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,St(this,kt(this,e=Nt(this,t,n)),e);break;default:St(this,this._t0,e=Nt(this,t,n))}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n,this._t0=e}}},(Et.prototype=Object.create(At.prototype)).point=function(t,n){At.prototype.point.call(this,n,t)},Ct.prototype={moveTo:function(t,n){this._context.moveTo(n,t)},closePath:function(){this._context.closePath()},lineTo:function(t,n){this._context.lineTo(n,t)},bezierCurveTo:function(t,n,e,r,i,o){this._context.bezierCurveTo(n,t,r,e,o,i)}},qt.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=[],this._y=[]},lineEnd:function(){var t=this._x,n=this._y,e=t.length;if(e)if(this._line?this._context.lineTo(t[0],n[0]):this._context.moveTo(t[0],n[0]),2===e)this._context.lineTo(t[1],n[1]);else for(var r=Lt(t),i=Lt(n),o=0,u=1;u<e;++o,++u)this._context.bezierCurveTo(r[0][o],i[0][o],r[1][o],i[1][o],t[u],n[u]);(this._line||0!==this._line&&1===e)&&this._context.closePath(),this._line=1-this._line,this._x=this._y=null},point:function(t,n){this._x.push(+t),this._y.push(+n)}};var ch=function(t){return new qt(t)};Rt.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=this._y=NaN,this._point=0},lineEnd:function(){0<this._t&&this._t<1&&2===this._point&&this._context.lineTo(this._x,this._y),(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line>=0&&(this._t=1-this._t,this._line=1-this._line)},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:if(this._t<=0)this._context.lineTo(this._x,n),this._context.lineTo(t,n);else{var e=this._x*(1-this._t)+t*this._t;this._context.lineTo(e,this._y),this._context.lineTo(e,n)}}this._x=t,this._y=n}};var sh=function(t){return new Rt(t,.5)},fh=Array.prototype.slice,lh=function(t,n){if((r=t.length)>1)for(var e,r,i=1,o=t[n[0]],u=o.length;i<r;++i){e=o,o=t[n[i]];for(var a=0;a<u;++a)o[a][1]+=o[a][0]=isNaN(e[a][1])?e[a][0]:e[a][1]}},hh=function(t){for(var n=t.length,e=new Array(n);--n>=0;)e[n]=n;return e},ph=function(){function t(t){var o,u,a=n.apply(this,arguments),c=t.length,s=a.length,f=new Array(s);for(o=0;o<s;++o){for(var l,h=a[o],p=f[o]=new Array(c),d=0;d<c;++d)p[d]=l=[0,+i(t[d],h,d,t)],l.data=t[d];p.key=h}for(o=0,u=e(f);o<s;++o)f[u[o]].index=o;return r(f,u),f}var n=vl([]),e=hh,r=lh,i=Ot;return t.keys=function(e){return arguments.length?(n="function"==typeof e?e:vl(fh.call(e)),t):n},t.value=function(n){return arguments.length?(i="function"==typeof n?n:vl(+n),t):i},t.order=function(n){return arguments.length?(e=null==n?hh:"function"==typeof n?n:vl(fh.call(n)),t):e},t.offset=function(n){return arguments.length?(r=null==n?lh:n,t):r},t},dh=function(t,n){if((r=t.length)>0){for(var e,r,i,o=0,u=t[0].length;o<u;++o){for(i=e=0;e<r;++e)i+=t[e][o][1]||0;if(i)for(e=0;e<r;++e)t[e][o][1]/=i}lh(t,n)}},vh=function(t,n){if((e=t.length)>0){for(var e,r=0,i=t[n[0]],o=i.length;r<o;++r){for(var u=0,a=0;u<e;++u)a+=t[u][r][1]||0;i[r][1]+=i[r][0]=-a/2}lh(t,n)}},_h=function(t,n){if((i=t.length)>0&&(r=(e=t[n[0]]).length)>0){for(var e,r,i,o=0,u=1;u<r;++u){for(var a=0,c=0,s=0;a<i;++a){for(var f=t[n[a]],l=f[u][1]||0,h=f[u-1][1]||0,p=(l-h)/2,d=0;d<a;++d){var v=t[n[d]],_=v[u][1]||0,y=v[u-1][1]||0;p+=_-y}c+=l,s+=p*l}e[u-1][1]+=e[u-1][0]=o,c&&(o-=s/c)}e[u-1][1]+=e[u-1][0]=o,lh(t,n)}},yh=function(t){var n=t.map(Ft);return hh(t).sort(function(t,e){return n[t]-n[e]})},gh=function(t){return yh(t).reverse()},mh=function(t){var n,e,r=t.length,i=t.map(Ft),o=hh(t).sort(function(t,n){return i[n]-i[t]}),u=0,a=0,c=[],s=[];for(n=0;n<r;++n)e=o[n],u<a?(u+=i[e],c.push(e)):(a+=i[e],s.push(e));return s.reverse().concat(c)},xh=function(t){return hh(t).reverse()},bh=function(t,n,e){t.prototype=n.prototype=e,e.constructor=t},wh=.7,Mh=1/wh,Th=/^#([0-9a-f]{3})$/,Nh=/^#([0-9a-f]{6})$/,kh=/^rgb\(\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*\)$/,Sh=/^rgb\(\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/,Ah=/^rgba\(\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/,Eh=/^rgba\(\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/,Ch=/^hsl\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/,zh=/^hsla\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/,Ph={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};bh(Yt,Bt,{displayable:function(){return this.rgb().displayable()},toString:function(){return this.rgb()+""}}),bh(Wt,Vt,It(Yt,{brighter:function(t){return t=null==t?Mh:Math.pow(Mh,t),new Wt(this.r*t,this.g*t,this.b*t,this.opacity)},darker:function(t){return t=null==t?wh:Math.pow(wh,t),new Wt(this.r*t,this.g*t,this.b*t,this.opacity)},rgb:function(){return this},displayable:function(){return 0<=this.r&&this.r<=255&&0<=this.g&&this.g<=255&&0<=this.b&&this.b<=255&&0<=this.opacity&&this.opacity<=1},toString:function(){var t=this.opacity;return t=isNaN(t)?1:Math.max(0,Math.min(1,t)),(1===t?"rgb(":"rgba(")+Math.max(0,Math.min(255,Math.round(this.r)||0))+", "+Math.max(0,Math.min(255,Math.round(this.g)||0))+", "+Math.max(0,Math.min(255,Math.round(this.b)||0))+(1===t?")":", "+t+")")}})),bh(Jt,Gt,It(Yt,{brighter:function(t){return t=null==t?Mh:Math.pow(Mh,t),new Jt(this.h,this.s,this.l*t,this.opacity)},darker:function(t){return t=null==t?wh:Math.pow(wh,t),new Jt(this.h,this.s,this.l*t,this.opacity)},rgb:function(){var t=this.h%360+360*(this.h<0),n=isNaN(t)||isNaN(this.s)?0:this.s,e=this.l,r=e+(e<.5?e:1-e)*n,i=2*e-r;return new Wt(Qt(t>=240?t-240:t+120,i,r),Qt(t,i,r),Qt(t<120?t+240:t-120,i,r),this.opacity)},displayable:function(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1}}));var qh=Math.PI/180,Lh=180/Math.PI,Rh=18,Uh=.95047,Dh=1,Oh=1.08883,Fh=4/29,Ih=6/29,Yh=3*Ih*Ih,Bh=Ih*Ih*Ih;bh(nn,tn,It(Yt,{brighter:function(t){return new nn(this.l+Rh*(null==t?1:t),this.a,this.b,this.opacity)},darker:function(t){return new nn(this.l-Rh*(null==t?1:t),this.a,this.b,this.opacity)},rgb:function(){var t=(this.l+16)/116,n=isNaN(this.a)?t:t+this.a/500,e=isNaN(this.b)?t:t-this.b/200;return t=Dh*rn(t),n=Uh*rn(n),e=Oh*rn(e),new Wt(on(3.2404542*n-1.5371385*t-.4985314*e),on(-.969266*n+1.8760108*t+.041556*e),on(.0556434*n-.2040259*t+1.0572252*e),this.opacity)}})),bh(sn,cn,It(Yt,{brighter:function(t){return new sn(this.h,this.c,this.l+Rh*(null==t?1:t),this.opacity)},darker:function(t){return new sn(this.h,this.c,this.l-Rh*(null==t?1:t),this.opacity)},rgb:function(){return Kt(this).rgb()}}));var jh=-.14861,Hh=1.78277,Xh=-.29227,Vh=-.90649,Wh=1.97294,$h=Wh*Vh,Zh=Wh*Hh,Gh=Hh*Xh-Vh*jh;bh(hn,ln,It(Yt,{brighter:function(t){return t=null==t?Mh:Math.pow(Mh,t),new hn(this.h,this.s,this.l*t,this.opacity)},darker:function(t){return t=null==t?wh:Math.pow(wh,t),new hn(this.h,this.s,this.l*t,this.opacity)},rgb:function(){var t=isNaN(this.h)?0:(this.h+120)*qh,n=+this.l,e=isNaN(this.s)?0:this.s*n*(1-n),r=Math.cos(t),i=Math.sin(t);return new Wt(255*(n+e*(jh*r+Hh*i)),255*(n+e*(Xh*r+Vh*i)),255*(n+e*(Wh*r)),this.opacity)}}));var Jh,Qh,Kh,tp,np=function(t){var n=t.length-1;return function(e){var r=e<=0?e=0:e>=1?(e=1,n-1):Math.floor(e*n),i=t[r],o=t[r+1],u=r>0?t[r-1]:2*i-o,a=r<n-1?t[r+2]:2*o-i;return pn((e-r/n)*n,u,i,o,a)}},ep=function(t){var n=t.length;return function(e){var r=Math.floor(((e%=1)<0?++e:e)*n),i=t[(r+n-1)%n],o=t[r%n],u=t[(r+1)%n],a=t[(r+2)%n];return pn((e-r/n)*n,i,o,u,a)}},rp=function(t){return function(){return t}},ip=function t(n){function e(t,n){var e=r((t=Vt(t)).r,(n=Vt(n)).r),i=r(t.g,n.g),o=r(t.b,n.b),u=r(t.opacity,n.opacity);return function(n){return t.r=e(n),t.g=i(n),t.b=o(n),t.opacity=u(n),t+""}}var r=yn(n);return e.gamma=t,e}(1),op=mn(np),up=mn(ep),ap=function(t,n){var e,r=n?n.length:0,i=t?Math.min(r,t.length):0,o=new Array(r),u=new Array(r);for(e=0;e<i;++e)o[e]=dp(t[e],n[e]);for(;e<r;++e)u[e]=n[e];return function(t){for(e=0;e<i;++e)u[e]=o[e](t);return u}},cp=function(t,n){var e=new Date;return t=+t,n-=t,function(r){return e.setTime(t+n*r),e}},sp=function(t,n){return t=+t,n-=t,function(e){return t+n*e}},fp=function(t,n){var e,r={},i={};null!==t&&"object"==typeof t||(t={}),null!==n&&"object"==typeof n||(n={});for(e in n)e in t?r[e]=dp(t[e],n[e]):i[e]=n[e];return function(t){for(e in r)i[e]=r[e](t);return i}},lp=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,hp=new RegExp(lp.source,"g"),pp=function(t,n){var e,r,i,o=lp.lastIndex=hp.lastIndex=0,u=-1,a=[],c=[];for(t+="",n+="";(e=lp.exec(t))&&(r=hp.exec(n));)(i=r.index)>o&&(i=n.slice(o,i),a[u]?a[u]+=i:a[++u]=i),(e=e[0])===(r=r[0])?a[u]?a[u]+=r:a[++u]=r:(a[++u]=null,c.push({i:u,x:sp(e,r)})),o=hp.lastIndex;return o<n.length&&(i=n.slice(o),a[u]?a[u]+=i:a[++u]=i),a.length<2?c[0]?bn(c[0].x):xn(n):(n=c.length,function(t){for(var e,r=0;r<n;++r)a[(e=c[r]).i]=e.x(t);return a.join("")})},dp=function(t,n){var e,r=typeof n;return null==n||"boolean"===r?rp(n):("number"===r?sp:"string"===r?(e=Bt(n))?(n=e,ip):pp:n instanceof Bt?ip:n instanceof Date?cp:Array.isArray(n)?ap:isNaN(n)?fp:sp)(t,n)},vp=function(t,n){return t=+t,n-=t,function(e){return Math.round(t+n*e)}},_p=180/Math.PI,yp={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1},gp=function(t,n,e,r,i,o){var u,a,c;return(u=Math.sqrt(t*t+n*n))&&(t/=u,n/=u),(c=t*e+n*r)&&(e-=t*c,r-=n*c),(a=Math.sqrt(e*e+r*r))&&(e/=a,r/=a,c/=a),t*r<n*e&&(t=-t,n=-n,c=-c,u=-u),{translateX:i,translateY:o,rotate:Math.atan2(n,t)*_p,skewX:Math.atan(c)*_p,scaleX:u,scaleY:a}},mp=Tn(wn,"px, ","px)","deg)"),xp=Tn(Mn,", ",")",")"),bp=Math.SQRT2,wp=2,Mp=4,Tp=1e-12,Np=function(t,n){var e,r,i=t[0],o=t[1],u=t[2],a=n[0],c=n[1],s=n[2],f=a-i,l=c-o,h=f*f+l*l;if(h<Tp)r=Math.log(s/u)/bp,e=function(t){return[i+t*f,o+t*l,u*Math.exp(bp*t*r)]};else{var p=Math.sqrt(h),d=(s*s-u*u+Mp*h)/(2*u*wp*p),v=(s*s-u*u-Mp*h)/(2*s*wp*p),_=Math.log(Math.sqrt(d*d+1)-d),y=Math.log(Math.sqrt(v*v+1)-v);r=(y-_)/bp,e=function(t){var n=t*r,e=Nn(_),a=u/(wp*p)*(e*Sn(bp*n+_)-kn(_));return[i+a*f,o+a*l,u*e/Nn(bp*n+_)]}}return e.duration=1e3*r,e},kp=An(_n),Sp=An(gn),Ap=Cn(_n),Ep=Cn(gn),Cp=zn(_n),zp=zn(gn),Pp=function(t,n){for(var e=new Array(n),r=0;r<n;++r)e[r]=t(r/(n-1));return e},qp={value:function(){}};qn.prototype=Pn.prototype={constructor:qn,on:function(t,n){var e,r=this._,i=Ln(t+"",r),o=-1,u=i.length;{if(!(arguments.length<2)){if(null!=n&&"function"!=typeof n)throw new Error("invalid callback: "+n);for(;++o<u;)if(e=(t=i[o]).type)r[e]=Un(r[e],t.name,n);else if(null==n)for(e in r)r[e]=Un(r[e],t.name,null);return this}for(;++o<u;)if((e=(t=i[o]).type)&&(e=Rn(r[e],t.name)))return e}},copy:function(){var t={},n=this._;for(var e in n)t[e]=n[e].slice();return new qn(t)},call:function(t,n){if((e=arguments.length-2)>0)for(var e,r,i=new Array(e),o=0;o<e;++o)i[o]=arguments[o+2];if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(r=this._[t],o=0,e=r.length;o<e;++o)r[o].value.apply(n,i)},apply:function(t,n,e){if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var r=this._[t],i=0,o=r.length;i<o;++i)r[i].value.apply(n,e)}};var Lp,Rp,Up=function(t){function n(t,n){var r,i,o=e(t,function(t,e){return r?r(t,e-1):(i=t,void(r=n?On(t,n):Dn(t)))});return o.columns=i,o}function e(t,n){function e(){if(f>=s)return u;if(i)return i=!1,o;var n,e=f;if(34===t.charCodeAt(e)){for(var r=e;r++<s;)if(34===t.charCodeAt(r)){if(34!==t.charCodeAt(r+1))break;++r}return f=r+2,n=t.charCodeAt(r+1),13===n?(i=!0,10===t.charCodeAt(r+2)&&++f):10===n&&(i=!0),t.slice(e+1,r).replace(/""/g,'"')}for(;f<s;){var a=1;if(n=t.charCodeAt(f++),10===n)i=!0;else if(13===n)i=!0,10===t.charCodeAt(f)&&(++f,++a);else if(n!==c)continue;return t.slice(e,f-a)}return t.slice(e);
}for(var r,i,o={},u={},a=[],s=t.length,f=0,l=0;(r=e())!==u;){for(var h=[];r!==o&&r!==u;)h.push(r),r=e();n&&null==(h=n(h,l++))||a.push(h)}return a}function r(n,e){return null==e&&(e=Fn(n)),[e.map(u).join(t)].concat(n.map(function(n){return e.map(function(t){return u(n[t])}).join(t)})).join("\n")}function i(t){return t.map(o).join("\n")}function o(n){return n.map(u).join(t)}function u(t){return null==t?"":a.test(t+="")?'"'+t.replace(/\"/g,'""')+'"':t}var a=new RegExp('["'+t+"\n]"),c=t.charCodeAt(0);return{parse:n,parseRows:e,format:r,formatRows:i}},Dp=Up(","),Op=Dp.parse,Fp=Dp.parseRows,Ip=Dp.format,Yp=Dp.formatRows,Bp=Up("\t"),jp=Bp.parse,Hp=Bp.parseRows,Xp=Bp.format,Vp=Bp.formatRows,Wp=function(t,n){function e(t){var n,e=f.status;if(!e&&Yn(f)||e>=200&&e<300||304===e){if(u)try{n=u.call(r,f)}catch(t){return void c.call("error",r,t)}else n=f;c.call("load",r,n)}else c.call("error",r,t)}var r,i,u,a,c=Pn("beforesend","progress","load","error"),s=o(),f=new XMLHttpRequest,l=null,h=null,p=0;if("undefined"==typeof XDomainRequest||"withCredentials"in f||!/^(http(s)?:)?\/\//.test(t)||(f=new XDomainRequest),"onload"in f?f.onload=f.onerror=f.ontimeout=e:f.onreadystatechange=function(t){f.readyState>3&&e(t)},f.onprogress=function(t){c.call("progress",r,t)},r={header:function(t,n){return t=(t+"").toLowerCase(),arguments.length<2?s.get(t):(null==n?s.remove(t):s.set(t,n+""),r)},mimeType:function(t){return arguments.length?(i=null==t?null:t+"",r):i},responseType:function(t){return arguments.length?(a=t,r):a},timeout:function(t){return arguments.length?(p=+t,r):p},user:function(t){return arguments.length<1?l:(l=null==t?null:t+"",r)},password:function(t){return arguments.length<1?h:(h=null==t?null:t+"",r)},response:function(t){return u=t,r},get:function(t,n){return r.send("GET",t,n)},post:function(t,n){return r.send("POST",t,n)},send:function(n,e,o){return f.open(n,t,!0,l,h),null==i||s.has("accept")||s.set("accept",i+",*/*"),f.setRequestHeader&&s.each(function(t,n){f.setRequestHeader(n,t)}),null!=i&&f.overrideMimeType&&f.overrideMimeType(i),null!=a&&(f.responseType=a),p>0&&(f.timeout=p),null==o&&"function"==typeof e&&(o=e,e=null),null!=o&&1===o.length&&(o=In(o)),null!=o&&r.on("error",o).on("load",function(t){o(null,t)}),c.call("beforesend",r,f),f.send(null==e?null:e),r},abort:function(){return f.abort(),r},on:function(){var t=c.on.apply(c,arguments);return t===c?r:t}},null!=n){if("function"!=typeof n)throw new Error("invalid callback: "+n);return r.get(n)}return r},$p=function(t,n){return function(e,r){var i=Wp(e).mimeType(t).response(n);if(null!=r){if("function"!=typeof r)throw new Error("invalid callback: "+r);return i.get(r)}return i}},Zp=$p("text/html",function(t){return document.createRange().createContextualFragment(t.responseText)}),Gp=$p("application/json",function(t){return JSON.parse(t.responseText)}),Jp=$p("text/plain",function(t){return t.responseText}),Qp=$p("application/xml",function(t){var n=t.responseXML;if(!n)throw new Error("parse error");return n}),Kp=function(t,n){return function(e,r,i){arguments.length<3&&(i=r,r=null);var o=Wp(e).mimeType(t);return o.row=function(t){return arguments.length?o.response(Bn(n,r=t)):r},o.row(r),i?o.get(i):o}},td=Kp("text/csv",Op),nd=Kp("text/tab-separated-values",jp),ed=0,rd=0,id=0,od=1e3,ud=0,ad=0,cd=0,sd="object"==typeof performance&&performance.now?performance:Date,fd="function"==typeof requestAnimationFrame?requestAnimationFrame:function(t){setTimeout(t,17)};Xn.prototype=Vn.prototype={constructor:Xn,restart:function(t,n,e){if("function"!=typeof t)throw new TypeError("callback is not a function");e=(null==e?jn():+e)+(null==n?0:+n),this._next||Rp===this||(Rp?Rp._next=this:Lp=this,Rp=this),this._call=t,this._time=e,Jn()},stop:function(){this._call&&(this._call=null,this._time=1/0,Jn())}};var ld=function(t,n,e){var r=new Xn;return n=null==n?0:+n,r.restart(function(e){r.stop(),t(e+n)},n,e),r},hd=function(t,n,e){var r=new Xn,i=n;return null==n?(r.restart(t,n,e),r):(n=+n,e=null==e?jn():+e,r.restart(function o(u){u+=i,r.restart(o,i+=n,e),t(u)},n,e),r)},pd=new Date,dd=new Date,vd=Qn(function(){},function(t,n){t.setTime(+t+n)},function(t,n){return n-t});vd.every=function(t){return t=Math.floor(t),isFinite(t)&&t>0?t>1?Qn(function(n){n.setTime(Math.floor(n/t)*t)},function(n,e){n.setTime(+n+e*t)},function(n,e){return(e-n)/t}):vd:null};var _d=vd.range,yd=1e3,gd=6e4,md=36e5,xd=864e5,bd=6048e5,wd=Qn(function(t){t.setTime(Math.floor(t/yd)*yd)},function(t,n){t.setTime(+t+n*yd)},function(t,n){return(n-t)/yd},function(t){return t.getUTCSeconds()}),Md=wd.range,Td=Qn(function(t){t.setTime(Math.floor(t/gd)*gd)},function(t,n){t.setTime(+t+n*gd)},function(t,n){return(n-t)/gd},function(t){return t.getMinutes()}),Nd=Td.range,kd=Qn(function(t){var n=t.getTimezoneOffset()*gd%md;n<0&&(n+=md),t.setTime(Math.floor((+t-n)/md)*md+n)},function(t,n){t.setTime(+t+n*md)},function(t,n){return(n-t)/md},function(t){return t.getHours()}),Sd=kd.range,Ad=Qn(function(t){t.setHours(0,0,0,0)},function(t,n){t.setDate(t.getDate()+n)},function(t,n){return(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*gd)/xd},function(t){return t.getDate()-1}),Ed=Ad.range,Cd=Kn(0),zd=Kn(1),Pd=Kn(2),qd=Kn(3),Ld=Kn(4),Rd=Kn(5),Ud=Kn(6),Dd=Cd.range,Od=zd.range,Fd=Pd.range,Id=qd.range,Yd=Ld.range,Bd=Rd.range,jd=Ud.range,Hd=Qn(function(t){t.setDate(1),t.setHours(0,0,0,0)},function(t,n){t.setMonth(t.getMonth()+n)},function(t,n){return n.getMonth()-t.getMonth()+12*(n.getFullYear()-t.getFullYear())},function(t){return t.getMonth()}),Xd=Hd.range,Vd=Qn(function(t){t.setMonth(0,1),t.setHours(0,0,0,0)},function(t,n){t.setFullYear(t.getFullYear()+n)},function(t,n){return n.getFullYear()-t.getFullYear()},function(t){return t.getFullYear()});Vd.every=function(t){return isFinite(t=Math.floor(t))&&t>0?Qn(function(n){n.setFullYear(Math.floor(n.getFullYear()/t)*t),n.setMonth(0,1),n.setHours(0,0,0,0)},function(n,e){n.setFullYear(n.getFullYear()+e*t)}):null};var Wd=Vd.range,$d=Qn(function(t){t.setUTCSeconds(0,0)},function(t,n){t.setTime(+t+n*gd)},function(t,n){return(n-t)/gd},function(t){return t.getUTCMinutes()}),Zd=$d.range,Gd=Qn(function(t){t.setUTCMinutes(0,0,0)},function(t,n){t.setTime(+t+n*md)},function(t,n){return(n-t)/md},function(t){return t.getUTCHours()}),Jd=Gd.range,Qd=Qn(function(t){t.setUTCHours(0,0,0,0)},function(t,n){t.setUTCDate(t.getUTCDate()+n)},function(t,n){return(n-t)/xd},function(t){return t.getUTCDate()-1}),Kd=Qd.range,tv=te(0),nv=te(1),ev=te(2),rv=te(3),iv=te(4),ov=te(5),uv=te(6),av=tv.range,cv=nv.range,sv=ev.range,fv=rv.range,lv=iv.range,hv=ov.range,pv=uv.range,dv=Qn(function(t){t.setUTCDate(1),t.setUTCHours(0,0,0,0)},function(t,n){t.setUTCMonth(t.getUTCMonth()+n)},function(t,n){return n.getUTCMonth()-t.getUTCMonth()+12*(n.getUTCFullYear()-t.getUTCFullYear())},function(t){return t.getUTCMonth()}),vv=dv.range,_v=Qn(function(t){t.setUTCMonth(0,1),t.setUTCHours(0,0,0,0)},function(t,n){t.setUTCFullYear(t.getUTCFullYear()+n)},function(t,n){return n.getUTCFullYear()-t.getUTCFullYear()},function(t){return t.getUTCFullYear()});_v.every=function(t){return isFinite(t=Math.floor(t))&&t>0?Qn(function(n){n.setUTCFullYear(Math.floor(n.getUTCFullYear()/t)*t),n.setUTCMonth(0,1),n.setUTCHours(0,0,0,0)},function(n,e){n.setUTCFullYear(n.getUTCFullYear()+e*t)}):null};var yv,gv=_v.range,mv=function(t,n){if((e=(t=n?t.toExponential(n-1):t.toExponential()).indexOf("e"))<0)return null;var e,r=t.slice(0,e);return[r.length>1?r[0]+r.slice(2):r,+t.slice(e+1)]},xv=function(t){return t=mv(Math.abs(t)),t?t[1]:NaN},bv=function(t,n){return function(e,r){for(var i=e.length,o=[],u=0,a=t[0],c=0;i>0&&a>0&&(c+a+1>r&&(a=Math.max(1,r-c)),o.push(e.substring(i-=a,i+a)),!((c+=a+1)>r));)a=t[u=(u+1)%t.length];return o.reverse().join(n)}},wv=function(t,n){t=t.toPrecision(n);t:for(var e,r=t.length,i=1,o=-1;i<r;++i)switch(t[i]){case".":o=e=i;break;case"0":0===o&&(o=i),e=i;break;case"e":break t;default:o>0&&(o=0)}return o>0?t.slice(0,o)+t.slice(e+1):t},Mv=function(t,n){var e=mv(t,n);if(!e)return t+"";var r=e[0],i=e[1],o=i-(yv=3*Math.max(-8,Math.min(8,Math.floor(i/3))))+1,u=r.length;return o===u?r:o>u?r+new Array(o-u+1).join("0"):o>0?r.slice(0,o)+"."+r.slice(o):"0."+new Array(1-o).join("0")+mv(t,Math.max(0,n+o-1))[0]},Tv=function(t,n){var e=mv(t,n);if(!e)return t+"";var r=e[0],i=e[1];return i<0?"0."+new Array(-i).join("0")+r:r.length>i+1?r.slice(0,i+1)+"."+r.slice(i+1):r+new Array(i-r.length+2).join("0")},Nv={"":wv,"%":function(t,n){return(100*t).toFixed(n)},b:function(t){return Math.round(t).toString(2)},c:function(t){return t+""},d:function(t){return Math.round(t).toString(10)},e:function(t,n){return t.toExponential(n)},f:function(t,n){return t.toFixed(n)},g:function(t,n){return t.toPrecision(n)},o:function(t){return Math.round(t).toString(8)},p:function(t,n){return Tv(100*t,n)},r:Tv,s:Mv,X:function(t){return Math.round(t).toString(16).toUpperCase()},x:function(t){return Math.round(t).toString(16)}},kv=/^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i,Sv=function(t){return new ne(t)};ne.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(null==this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(null==this.precision?"":"."+Math.max(0,0|this.precision))+this.type};var Av,Ev=["y","z","a","f","p","n","Âµ","m","","k","M","G","T","P","E","Z","Y"],Cv=function(t){function n(t){function n(t){var n,i,c,g=d,m=v;if("c"===p)m=_(t)+m,t="";else{t=+t;var x=(t<0||1/t<0)&&(t*=-1,!0);if(t=_(t,h),x)for(n=-1,i=t.length,x=!1;++n<i;)if(c=t.charCodeAt(n),48<c&&c<58||"x"===p&&96<c&&c<103||"X"===p&&64<c&&c<71){x=!0;break}if(g=(x?"("===a?a:"-":"-"===a||"("===a?"":a)+g,m=m+("s"===p?Ev[8+yv/3]:"")+(x&&"("===a?")":""),y)for(n=-1,i=t.length;++n<i;)if(c=t.charCodeAt(n),48>c||c>57){m=(46===c?o+t.slice(n+1):t.slice(n))+m,t=t.slice(0,n);break}}l&&!s&&(t=r(t,1/0));var b=g.length+t.length+m.length,w=b<f?new Array(f-b+1).join(e):"";switch(l&&s&&(t=r(w+t,w.length?f-m.length:1/0),w=""),u){case"<":return g+t+m+w;case"=":return g+w+t+m;case"^":return w.slice(0,b=w.length>>1)+g+t+m+w.slice(b)}return w+g+t+m}t=Sv(t);var e=t.fill,u=t.align,a=t.sign,c=t.symbol,s=t.zero,f=t.width,l=t.comma,h=t.precision,p=t.type,d="$"===c?i[0]:"#"===c&&/[boxX]/.test(p)?"0"+p.toLowerCase():"",v="$"===c?i[1]:/[%p]/.test(p)?"%":"",_=Nv[p],y=!p||/[defgprs%]/.test(p);return h=null==h?p?6:12:/[gprs]/.test(p)?Math.max(1,Math.min(21,h)):Math.max(0,Math.min(20,h)),n.toString=function(){return t+""},n}function e(t,e){var r=n((t=Sv(t),t.type="f",t)),i=3*Math.max(-8,Math.min(8,Math.floor(xv(e)/3))),o=Math.pow(10,-i),u=Ev[8+i/3];return function(t){return r(o*t)+u}}var r=t.grouping&&t.thousands?bv(t.grouping,t.thousands):ee,i=t.currency,o=t.decimal;return{format:n,formatPrefix:e}};re({decimal:".",thousands:",",grouping:[3],currency:["$",""]});var zv,Pv=function(t){return Math.max(0,-xv(Math.abs(t)))},qv=function(t,n){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(xv(n)/3)))-xv(Math.abs(t)))},Lv=function(t,n){return t=Math.abs(t),n=Math.abs(n)-t,Math.max(0,xv(n)-xv(t))+1},Rv={"-":"",_:" ",0:"0"},Uv=/^\s*\d+/,Dv=/^%/,Ov=/[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;nr({dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});var Fv="%Y-%m-%dT%H:%M:%S.%LZ",Iv=Date.prototype.toISOString?er:t.utcFormat(Fv),Yv=+new Date("2000-01-01T00:00:00.000Z")?rr:t.utcParse(Fv),Bv=Array.prototype,jv=Bv.map,Hv=Bv.slice,Xv={name:"implicit"},Vv=function(t){return function(){return t}},Wv=function(t){return+t},$v=[0,1],Zv=function(n,r,i){var o,u=n[0],a=n[n.length-1],c=e(u,a,null==r?10:r);switch(i=Sv(null==i?",f":i),i.type){case"s":var s=Math.max(Math.abs(u),Math.abs(a));return null!=i.precision||isNaN(o=qv(c,s))||(i.precision=o),t.formatPrefix(i,s);case"":case"e":case"g":case"p":case"r":null!=i.precision||isNaN(o=Lv(c,Math.max(Math.abs(u),Math.abs(a))))||(i.precision=o-("e"===i.type));break;case"f":case"%":null!=i.precision||isNaN(o=Pv(c))||(i.precision=o-2*("%"===i.type))}return t.format(i)},Gv=function(t,n){t=t.slice();var e,r=0,i=t.length-1,o=t[r],u=t[i];return u<o&&(e=r,r=i,i=e,e=o,o=u,u=e),t[r]=n.floor(o),t[i]=n.ceil(u),t},Jv=1e3,Qv=60*Jv,Kv=60*Qv,t_=24*Kv,n_=7*t_,e_=30*t_,r_=365*t_,i_=function(){return qr(Vd,Hd,Cd,Ad,kd,Td,wd,vd,t.timeFormat).domain([new Date(2e3,0,1),new Date(2e3,0,2)])},o_=function(){return qr(_v,dv,tv,Qd,Gd,$d,wd,vd,t.utcFormat).domain([Date.UTC(2e3,0,1),Date.UTC(2e3,0,2)])},u_=function(t){return t.match(/.{6}/g).map(function(t){return"#"+t})},a_=u_("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf"),c_=u_("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6"),s_=u_("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9"),f_=u_("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5"),l_=zp(ln(300,.5,0),ln(-240,.5,1)),h_=zp(ln(-100,.75,.35),ln(80,1.5,.8)),p_=zp(ln(260,.75,.35),ln(80,1.5,.8)),d_=ln(),v_=function(t){(t<0||t>1)&&(t-=Math.floor(t));var n=Math.abs(t-.5);return d_.h=360*t-100,d_.s=1.5-1.5*n,d_.l=.8-.9*n,d_+""},__=Lr(u_("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725")),y_=Lr(u_("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf")),g_=Lr(u_("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4")),m_=Lr(u_("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921")),x_="http://www.w3.org/1999/xhtml",b_={svg:"http://www.w3.org/2000/svg",xhtml:x_,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"},w_=function(t){var n=t+="",e=n.indexOf(":");return e>=0&&"xmlns"!==(n=t.slice(0,e))&&(t=t.slice(e+1)),b_.hasOwnProperty(n)?{space:b_[n],local:t}:t},M_=function(t){var n=w_(t);return(n.local?Dr:Ur)(n)},T_=0;Fr.prototype=Or.prototype={constructor:Fr,get:function(t){for(var n=this._;!(n in t);)if(!(t=t.parentNode))return;return t[n]},set:function(t,n){return t[this._]=n},remove:function(t){return this._ in t&&delete t[this._]},toString:function(){return this._}};var N_=function(t){return function(){return this.matches(t)}};if("undefined"!=typeof document){var k_=document.documentElement;if(!k_.matches){var S_=k_.webkitMatchesSelector||k_.msMatchesSelector||k_.mozMatchesSelector||k_.oMatchesSelector;N_=function(t){return function(){return S_.call(this,t)}}}}var A_=N_,E_={};if(t.event=null,"undefined"!=typeof document){var C_=document.documentElement;"onmouseenter"in C_||(E_={mouseenter:"mouseover",mouseleave:"mouseout"})}var z_=function(t,n,e){var r,i,o=Br(t+""),u=o.length;{if(!(arguments.length<2)){for(a=n?Hr:jr,null==e&&(e=!1),r=0;r<u;++r)this.each(a(o[r],n,e));return this}var a=this.node().__on;if(a)for(var c,s=0,f=a.length;s<f;++s)for(r=0,c=a[s];r<u;++r)if((i=o[r]).type===c.type&&i.name===c.name)return c.value}},P_=function(){for(var n,e=t.event;n=e.sourceEvent;)e=n;return e},q_=function(t,n){var e=t.ownerSVGElement||t;if(e.createSVGPoint){var r=e.createSVGPoint();return r.x=n.clientX,r.y=n.clientY,r=r.matrixTransform(t.getScreenCTM().inverse()),[r.x,r.y]}var i=t.getBoundingClientRect();return[n.clientX-i.left-t.clientLeft,n.clientY-i.top-t.clientTop]},L_=function(t){var n=P_();return n.changedTouches&&(n=n.changedTouches[0]),q_(t,n)},R_=function(t){return null==t?Vr:function(){return this.querySelector(t)}},U_=function(t){"function"!=typeof t&&(t=R_(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u,a=n[i],c=a.length,s=r[i]=new Array(c),f=0;f<c;++f)(o=a[f])&&(u=t.call(o,o.__data__,f,a))&&("__data__"in o&&(u.__data__=o.__data__),s[f]=u);return new zi(r,this._parents)},D_=function(t){return null==t?Wr:function(){return this.querySelectorAll(t)}},O_=function(t){"function"!=typeof t&&(t=D_(t));for(var n=this._groups,e=n.length,r=[],i=[],o=0;o<e;++o)for(var u,a=n[o],c=a.length,s=0;s<c;++s)(u=a[s])&&(r.push(t.call(u,u.__data__,s,a)),i.push(u));return new zi(r,i)},F_=function(t){"function"!=typeof t&&(t=A_(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u=n[i],a=u.length,c=r[i]=[],s=0;s<a;++s)(o=u[s])&&t.call(o,o.__data__,s,u)&&c.push(o);return new zi(r,this._parents)},I_=function(t){return new Array(t.length)},Y_=function(){return new zi(this._enter||this._groups.map(I_),this._parents)};$r.prototype={constructor:$r,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,n){return this._parent.insertBefore(t,n)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}};var B_=function(t){return function(){return t}},j_="$",H_=function(t,n){if(!t)return p=new Array(this.size()),s=-1,this.each(function(t){p[++s]=t}),p;var e=n?Gr:Zr,r=this._parents,i=this._groups;"function"!=typeof t&&(t=B_(t));for(var o=i.length,u=new Array(o),a=new Array(o),c=new Array(o),s=0;s<o;++s){var f=r[s],l=i[s],h=l.length,p=t.call(f,f&&f.__data__,s,r),d=p.length,v=a[s]=new Array(d),_=u[s]=new Array(d),y=c[s]=new Array(h);e(f,l,v,_,y,p,n);for(var g,m,x=0,b=0;x<d;++x)if(g=v[x]){for(x>=b&&(b=x+1);!(m=_[b])&&++b<d;);g._next=m||null}}return u=new zi(u,r),u._enter=a,u._exit=c,u},X_=function(){return new zi(this._exit||this._groups.map(I_),this._parents)},V_=function(t){for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),u=new Array(r),a=0;a<o;++a)for(var c,s=n[a],f=e[a],l=s.length,h=u[a]=new Array(l),p=0;p<l;++p)(c=s[p]||f[p])&&(h[p]=c);for(;a<r;++a)u[a]=n[a];return new zi(u,this._parents)},W_=function(){for(var t=this._groups,n=-1,e=t.length;++n<e;)for(var r,i=t[n],o=i.length-1,u=i[o];--o>=0;)(r=i[o])&&(u&&u!==r.nextSibling&&u.parentNode.insertBefore(r,u),u=r);return this},$_=function(t){function n(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e}t||(t=Jr);for(var e=this._groups,r=e.length,i=new Array(r),o=0;o<r;++o){for(var u,a=e[o],c=a.length,s=i[o]=new Array(c),f=0;f<c;++f)(u=a[f])&&(s[f]=u);s.sort(n)}return new zi(i,this._parents).order()},Z_=function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},G_=function(){var t=new Array(this.size()),n=-1;return this.each(function(){t[++n]=this}),t},J_=function(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r=t[n],i=0,o=r.length;i<o;++i){var u=r[i];if(u)return u}return null},Q_=function(){var t=0;return this.each(function(){++t}),t},K_=function(){return!this.node()},ty=function(t){for(var n=this._groups,e=0,r=n.length;e<r;++e)for(var i,o=n[e],u=0,a=o.length;u<a;++u)(i=o[u])&&t.call(i,i.__data__,u,o);return this},ny=function(t,n){var e=w_(t);if(arguments.length<2){var r=this.node();return e.local?r.getAttributeNS(e.space,e.local):r.getAttribute(e)}return this.each((null==n?e.local?Kr:Qr:"function"==typeof n?e.local?ri:ei:e.local?ni:ti)(e,n))},ey=function(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView},ry=function(t,n,e){var r;return arguments.length>1?this.each((null==n?ii:"function"==typeof n?ui:oi)(t,n,null==e?"":e)):ey(r=this.node()).getComputedStyle(r,null).getPropertyValue(t)},iy=function(t,n){return arguments.length>1?this.each((null==n?ai:"function"==typeof n?si:ci)(t,n)):this.node()[t]};hi.prototype={add:function(t){var n=this._names.indexOf(t);n<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var n=this._names.indexOf(t);n>=0&&(this._names.splice(n,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var oy=function(t,n){var e=fi(t+"");if(arguments.length<2){for(var r=li(this.node()),i=-1,o=e.length;++i<o;)if(!r.contains(e[i]))return!1;return!0}return this.each(("function"==typeof n?yi:n?vi:_i)(e,n))},uy=function(t){return arguments.length?this.each(null==t?gi:("function"==typeof t?xi:mi)(t)):this.node().textContent},ay=function(t){return arguments.length?this.each(null==t?bi:("function"==typeof t?Mi:wi)(t)):this.node().innerHTML},cy=function(){return this.each(Ti)},sy=function(){return this.each(Ni)},fy=function(t){var n="function"==typeof t?t:M_(t);return this.select(function(){return this.appendChild(n.apply(this,arguments))})},ly=function(t,n){var e="function"==typeof t?t:M_(t),r=null==n?ki:"function"==typeof n?n:R_(n);return this.select(function(){return this.insertBefore(e.apply(this,arguments),r.apply(this,arguments)||null)})},hy=function(){return this.each(Si)},py=function(t){return arguments.length?this.property("__data__",t):this.node().__data__},dy=function(t,n){return this.each(("function"==typeof n?Ci:Ei)(t,n))},vy=[null];zi.prototype=Pi.prototype={constructor:zi,select:U_,selectAll:O_,filter:F_,data:H_,enter:Y_,exit:X_,merge:V_,order:W_,sort:$_,call:Z_,nodes:G_,node:J_,size:Q_,empty:K_,each:ty,attr:ny,style:ry,property:iy,classed:oy,text:uy,html:ay,raise:cy,lower:sy,append:fy,insert:ly,remove:hy,datum:py,on:z_,dispatch:dy};var _y=function(t){return"string"==typeof t?new zi([[document.querySelector(t)]],[document.documentElement]):new zi([[t]],vy)},yy=function(t){return"string"==typeof t?new zi([document.querySelectorAll(t)],[document.documentElement]):new zi([null==t?[]:t],vy)},gy=function(t,n,e){arguments.length<3&&(e=n,n=P_().changedTouches);for(var r,i=0,o=n?n.length:0;i<o;++i)if((r=n[i]).identifier===e)return q_(t,r);return null},my=function(t,n){null==n&&(n=P_().touches);for(var e=0,r=n?n.length:0,i=new Array(r);e<r;++e)i[e]=q_(t,n[e]);return i},xy=Pn("start","end","interrupt"),by=[],wy=0,My=1,Ty=2,Ny=3,ky=4,Sy=5,Ay=6,Ey=function(t,n,e,r,i,o){var u=t.__transition;if(u){if(e in u)return}else t.__transition={};Ui(t,e,{name:n,index:r,group:i,on:xy,tween:by,time:o.time,delay:o.delay,duration:o.duration,ease:o.ease,timer:null,state:wy})},Cy=function(t,n){var e,r,i,o=t.__transition,u=!0;if(o){n=null==n?null:n+"";for(i in o)(e=o[i]).name===n?(r=e.state>Ty&&e.state<Sy,e.state=Ay,e.timer.stop(),r&&e.on.call("interrupt",t,t.__data__,e.index,e.group),delete o[i]):u=!1;u&&delete t.__transition}},zy=function(t){return this.each(function(){Cy(this,t)})},Py=function(t,n){var e=this._id;if(t+="",arguments.length<2){for(var r,i=Ri(this.node(),e).tween,o=0,u=i.length;o<u;++o)if((r=i[o]).name===t)return r.value;return null}return this.each((null==n?Di:Oi)(e,t,n))},qy=function(t,n){var e;return("number"==typeof n?sp:n instanceof Bt?ip:(e=Bt(n))?(n=e,ip):pp)(t,n)},Ly=function(t,n){var e=w_(t),r="transform"===e?xp:qy;return this.attrTween(t,"function"==typeof n?(e.local?Xi:Hi)(e,r,Fi(this,"attr."+t,n)):null==n?(e.local?Yi:Ii)(e):(e.local?ji:Bi)(e,r,n))},Ry=function(t,n){var e="attr."+t;if(arguments.length<2)return(e=this.tween(e))&&e._value;if(null==n)return this.tween(e,null);if("function"!=typeof n)throw new Error;var r=w_(t);return this.tween(e,(r.local?Vi:Wi)(r,n))},Uy=function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?$i:Zi)(n,t)):Ri(this.node(),n).delay},Dy=function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?Gi:Ji)(n,t)):Ri(this.node(),n).duration},Oy=function(t){var n=this._id;return arguments.length?this.each(Qi(n,t)):Ri(this.node(),n).ease},Fy=function(t){"function"!=typeof t&&(t=A_(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u=n[i],a=u.length,c=r[i]=[],s=0;s<a;++s)(o=u[s])&&t.call(o,o.__data__,s,u)&&c.push(o);return new so(r,this._parents,this._name,this._id)},Iy=function(t){if(t._id!==this._id)throw new Error;for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),u=new Array(r),a=0;a<o;++a)for(var c,s=n[a],f=e[a],l=s.length,h=u[a]=new Array(l),p=0;p<l;++p)(c=s[p]||f[p])&&(h[p]=c);for(;a<r;++a)u[a]=n[a];return new so(u,this._parents,this._name,this._id)},Yy=function(t,n){var e=this._id;return arguments.length<2?Ri(this.node(),e).on.on(t):this.each(to(e,t,n))},By=function(){return this.on("end.remove",no(this._id))},jy=function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=R_(t));for(var r=this._groups,i=r.length,o=new Array(i),u=0;u<i;++u)for(var a,c,s=r[u],f=s.length,l=o[u]=new Array(f),h=0;h<f;++h)(a=s[h])&&(c=t.call(a,a.__data__,h,s))&&("__data__"in a&&(c.__data__=a.__data__),l[h]=c,Ey(l[h],n,e,h,l,Ri(a,e)));return new so(o,this._parents,n,e)},Hy=function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=D_(t));for(var r=this._groups,i=r.length,o=[],u=[],a=0;a<i;++a)for(var c,s=r[a],f=s.length,l=0;l<f;++l)if(c=s[l]){for(var h,p=t.call(c,c.__data__,l,s),d=Ri(c,e),v=0,_=p.length;v<_;++v)(h=p[v])&&Ey(h,n,e,v,p,d);o.push(p),u.push(c)}return new so(o,u,n,e)},Xy=Pi.prototype.constructor,Vy=function(){return new Xy(this._groups,this._parents)},Wy=function(t,n,e){var r="transform"==(t+="")?mp:qy;return null==n?this.styleTween(t,eo(t,r)).on("end.style."+t,ro(t)):this.styleTween(t,"function"==typeof n?oo(t,r,Fi(this,"style."+t,n)):io(t,r,n),e)},$y=function(t,n,e){var r="style."+(t+="");if(arguments.length<2)return(r=this.tween(r))&&r._value;if(null==n)return this.tween(r,null);if("function"!=typeof n)throw new Error;return this.tween(r,uo(t,n,null==e?"":e))},Zy=function(t){return this.tween("text","function"==typeof t?co(Fi(this,"text",t)):ao(null==t?"":t+""))},Gy=function(){for(var t=this._name,n=this._id,e=lo(),r=this._groups,i=r.length,o=0;o<i;++o)for(var u,a=r[o],c=a.length,s=0;s<c;++s)if(u=a[s]){var f=Ri(u,n);Ey(u,t,e,s,a,{time:f.time+f.delay+f.duration,delay:0,duration:f.duration,ease:f.ease})}return new so(r,this._parents,t,e)},Jy=0,Qy=Pi.prototype;so.prototype=fo.prototype={constructor:so,select:jy,selectAll:Hy,filter:Fy,merge:Iy,selection:Vy,transition:Gy,call:Qy.call,nodes:Qy.nodes,node:Qy.node,size:Qy.size,empty:Qy.empty,each:Qy.each,on:Yy,attr:Ly,attrTween:Ry,style:Wy,styleTween:$y,text:Zy,remove:By,tween:Py,delay:Uy,duration:Dy,ease:Oy};var Ky={time:null,delay:0,duration:250,ease:g
},tg=function(t){var n,e;t instanceof so?(n=t._id,t=t._name):(n=lo(),(e=Ky).time=jn(),t=null==t?null:t+"");for(var r=this._groups,i=r.length,o=0;o<i;++o)for(var u,a=r[o],c=a.length,s=0;s<c;++s)(u=a[s])&&Ey(u,t,n,s,a,e||ho(u,n));return new so(r,this._parents,t,n)};Pi.prototype.interrupt=zy,Pi.prototype.transition=tg;var ng=[null],eg=function(t,n){var e,r,i=t.__transition;if(i){n=null==n?null:n+"";for(r in i)if((e=i[r]).state>My&&e.name===n)return new so([[t]],ng,n,+r)}return null},rg=Array.prototype.slice,ig=function(t){return t},og=1,ug=2,ag=3,cg=4,sg=1e-6,fg=function(){function t(t){var o,u=0;t.eachAfter(function(t){var e=t.children;e?(t.x=To(e),t.y=ko(e)):(t.x=o?u+=n(t,o):0,t.y=0,o=t)});var a=Ao(t),c=Eo(t),s=a.x-n(a,c)/2,f=c.x+n(c,a)/2;return t.eachAfter(i?function(n){n.x=(n.x-t.x)*e,n.y=(t.y-n.y)*r}:function(n){n.x=(n.x-s)/(f-s)*e,n.y=(1-(t.y?n.y/t.y:1))*r})}var n=Mo,e=1,r=1,i=!1;return t.separation=function(e){return arguments.length?(n=e,t):n},t.size=function(n){return arguments.length?(i=!1,e=+n[0],r=+n[1],t):i?null:[e,r]},t.nodeSize=function(n){return arguments.length?(i=!0,e=+n[0],r=+n[1],t):i?[e,r]:null},t},lg=function(t){var n,e,r,i,o=this,u=[o];do for(n=u.reverse(),u=[];o=n.pop();)if(t(o),e=o.children)for(r=0,i=e.length;r<i;++r)u.push(e[r]);while(u.length);return this},hg=function(t){for(var n,e,r=this,i=[r];r=i.pop();)if(t(r),n=r.children)for(e=n.length-1;e>=0;--e)i.push(n[e]);return this},pg=function(t){for(var n,e,r,i=this,o=[i],u=[];i=o.pop();)if(u.push(i),n=i.children)for(e=0,r=n.length;e<r;++e)o.push(n[e]);for(;i=u.pop();)t(i);return this},dg=function(t){return this.eachAfter(function(n){for(var e=+t(n.data)||0,r=n.children,i=r&&r.length;--i>=0;)e+=r[i].value;n.value=e})},vg=function(t){return this.eachBefore(function(n){n.children&&n.children.sort(t)})},_g=function(t){for(var n=this,e=Co(n,t),r=[n];n!==e;)n=n.parent,r.push(n);for(var i=r.length;t!==e;)r.splice(i,0,t),t=t.parent;return r},yg=function(){for(var t=this,n=[t];t=t.parent;)n.push(t);return n},gg=function(){var t=[];return this.each(function(n){t.push(n)}),t},mg=function(){var t=[];return this.eachBefore(function(n){n.children||t.push(n)}),t},xg=function(){var t=this,n=[];return t.each(function(e){e!==t&&n.push({source:e.parent,target:e})}),n};Uo.prototype=zo.prototype={constructor:Uo,each:lg,eachAfter:pg,eachBefore:hg,sum:dg,sort:vg,path:_g,ancestors:yg,descendants:gg,leaves:mg,links:xg,copy:Po};var bg=function(t){for(var n,e=(t=t.slice()).length,r=null,i=r;e;){var o=new Do(t[e-1]);i=i?i.next=o:r=o,t[n]=t[--e]}return{head:r,tail:i}},wg=function(t){return Fo(bg(t),[])},Mg=function(t){return Wo(t),t},Tg=function(t){return function(){return t}},Ng=function(){function t(t){return t.x=e/2,t.y=r/2,n?t.eachBefore(Qo(n)).eachAfter(Ko(i,.5)).eachBefore(tu(1)):t.eachBefore(Qo(Jo)).eachAfter(Ko(Go,1)).eachAfter(Ko(i,t.r/Math.min(e,r))).eachBefore(tu(Math.min(e,r)/(2*t.r))),t}var n=null,e=1,r=1,i=Go;return t.radius=function(e){return arguments.length?(n=$o(e),t):n},t.size=function(n){return arguments.length?(e=+n[0],r=+n[1],t):[e,r]},t.padding=function(n){return arguments.length?(i="function"==typeof n?n:Tg(+n),t):i},t},kg=function(t){t.x0=Math.round(t.x0),t.y0=Math.round(t.y0),t.x1=Math.round(t.x1),t.y1=Math.round(t.y1)},Sg=function(t,n,e,r,i){for(var o,u=t.children,a=-1,c=u.length,s=t.value&&(r-n)/t.value;++a<c;)o=u[a],o.y0=e,o.y1=i,o.x0=n,o.x1=n+=o.value*s},Ag=function(){function t(t){var u=t.height+1;return t.x0=t.y0=i,t.x1=e,t.y1=r/u,t.eachBefore(n(r,u)),o&&t.eachBefore(kg),t}function n(t,n){return function(e){e.children&&Sg(e,e.x0,t*(e.depth+1)/n,e.x1,t*(e.depth+2)/n);var r=e.x0,o=e.y0,u=e.x1-i,a=e.y1-i;u<r&&(r=u=(r+u)/2),a<o&&(o=a=(o+a)/2),e.x0=r,e.y0=o,e.x1=u,e.y1=a}}var e=1,r=1,i=0,o=!1;return t.round=function(n){return arguments.length?(o=!!n,t):o},t.size=function(n){return arguments.length?(e=+n[0],r=+n[1],t):[e,r]},t.padding=function(n){return arguments.length?(i=+n,t):i},t},Eg="$",Cg={depth:-1},zg={},Pg=function(){function t(t){var r,i,o,u,a,c,s,f=t.length,l=new Array(f),h={};for(i=0;i<f;++i)r=t[i],a=l[i]=new Uo(r),null!=(c=n(r,i,t))&&(c+="")&&(s=Eg+(a.id=c),h[s]=s in h?zg:a);for(i=0;i<f;++i)if(a=l[i],c=e(t[i],i,t),null!=c&&(c+="")){if(u=h[Eg+c],!u)throw new Error("missing: "+c);if(u===zg)throw new Error("ambiguous: "+c);u.children?u.children.push(a):u.children=[a],a.parent=u}else{if(o)throw new Error("multiple roots");o=a}if(!o)throw new Error("no root");if(o.parent=Cg,o.eachBefore(function(t){t.depth=t.parent.depth+1,--f}).eachBefore(Ro),o.parent=null,f>0)throw new Error("cycle");return o}var n=nu,e=eu;return t.id=function(e){return arguments.length?(n=Zo(e),t):n},t.parentId=function(n){return arguments.length?(e=Zo(n),t):e},t};su.prototype=Object.create(Uo.prototype);var qg=function(){function t(t){var r=fu(t);if(r.eachAfter(n),r.parent.m=-r.z,r.eachBefore(e),c)t.eachBefore(i);else{var s=t,f=t,l=t;t.eachBefore(function(t){t.x<s.x&&(s=t),t.x>f.x&&(f=t),t.depth>l.depth&&(l=t)});var h=s===f?1:o(s,f)/2,p=h-s.x,d=u/(f.x+h+p),v=a/(l.depth||1);t.eachBefore(function(t){t.x=(t.x+p)*d,t.y=t.depth*v})}return t}function n(t){var n=t.children,e=t.parent.children,i=t.i?e[t.i-1]:null;if(n){au(t);var u=(n[0].z+n[n.length-1].z)/2;i?(t.z=i.z+o(t._,i._),t.m=t.z-u):t.z=u}else i&&(t.z=i.z+o(t._,i._));t.parent.A=r(t,i,t.parent.A||e[0])}function e(t){t._.x=t.z+t.parent.m,t.m+=t.parent.m}function r(t,n,e){if(n){for(var r,i=t,u=t,a=n,c=i.parent.children[0],s=i.m,f=u.m,l=a.m,h=c.m;a=ou(a),i=iu(i),a&&i;)c=iu(c),u=ou(u),u.a=t,r=a.z+l-i.z-s+o(a._,i._),r>0&&(uu(cu(a,t,e),t,r),s+=r,f+=r),l+=a.m,s+=i.m,h+=c.m,f+=u.m;a&&!ou(u)&&(u.t=a,u.m+=l-f),i&&!iu(c)&&(c.t=i,c.m+=s-h,e=t)}return e}function i(t){t.x*=u,t.y=t.depth*a}var o=ru,u=1,a=1,c=null;return t.separation=function(n){return arguments.length?(o=n,t):o},t.size=function(n){return arguments.length?(c=!1,u=+n[0],a=+n[1],t):c?null:[u,a]},t.nodeSize=function(n){return arguments.length?(c=!0,u=+n[0],a=+n[1],t):c?[u,a]:null},t},Lg=function(t,n,e,r,i){for(var o,u=t.children,a=-1,c=u.length,s=t.value&&(i-e)/t.value;++a<c;)o=u[a],o.x0=n,o.x1=r,o.y0=e,o.y1=e+=o.value*s},Rg=(1+Math.sqrt(5))/2,Ug=function t(n){function e(t,e,r,i,o){lu(n,t,e,r,i,o)}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(Rg),Dg=function(){function t(t){return t.x0=t.y0=0,t.x1=i,t.y1=o,t.eachBefore(n),u=[0],r&&t.eachBefore(kg),t}function n(t){var n=u[t.depth],r=t.x0+n,i=t.y0+n,o=t.x1-n,h=t.y1-n;o<r&&(r=o=(r+o)/2),h<i&&(i=h=(i+h)/2),t.x0=r,t.y0=i,t.x1=o,t.y1=h,t.children&&(n=u[t.depth+1]=a(t)/2,r+=l(t)-n,i+=c(t)-n,o-=s(t)-n,h-=f(t)-n,o<r&&(r=o=(r+o)/2),h<i&&(i=h=(i+h)/2),e(t,r,i,o,h))}var e=Ug,r=!1,i=1,o=1,u=[0],a=Go,c=Go,s=Go,f=Go,l=Go;return t.round=function(n){return arguments.length?(r=!!n,t):r},t.size=function(n){return arguments.length?(i=+n[0],o=+n[1],t):[i,o]},t.tile=function(n){return arguments.length?(e=Zo(n),t):e},t.padding=function(n){return arguments.length?t.paddingInner(n).paddingOuter(n):t.paddingInner()},t.paddingInner=function(n){return arguments.length?(a="function"==typeof n?n:Tg(+n),t):a},t.paddingOuter=function(n){return arguments.length?t.paddingTop(n).paddingRight(n).paddingBottom(n).paddingLeft(n):t.paddingTop()},t.paddingTop=function(n){return arguments.length?(c="function"==typeof n?n:Tg(+n),t):c},t.paddingRight=function(n){return arguments.length?(s="function"==typeof n?n:Tg(+n),t):s},t.paddingBottom=function(n){return arguments.length?(f="function"==typeof n?n:Tg(+n),t):f},t.paddingLeft=function(n){return arguments.length?(l="function"==typeof n?n:Tg(+n),t):l},t},Og=function(t,n,e,r,i){function o(t,n,e,r,i,u,a){if(t>=n-1){var s=c[t];return s.x0=r,s.y0=i,s.x1=u,s.y1=a,void 0}for(var l=f[t],h=e/2+l,p=t+1,d=n-1;p<d;){var v=p+d>>>1;f[v]<h?p=v+1:d=v}var _=f[p]-l,y=e-_;if(a-i>u-r){var g=(i*y+a*_)/e;o(t,p,_,r,i,u,g),o(p,n,y,r,g,u,a)}else{var m=(r*y+u*_)/e;o(t,p,_,r,i,m,a),o(p,n,y,m,i,u,a)}}var u,a,c=t.children,s=c.length,f=new Array(s+1);for(f[0]=a=u=0;u<s;++u)f[u+1]=a+=c[u].value;o(0,s,t.value,n,e,r,i)},Fg=function(t,n,e,r,i){(1&t.depth?Lg:Sg)(t,n,e,r,i)},Ig=function t(n){function e(t,e,r,i,o){if((u=t._squarify)&&u.ratio===n)for(var u,a,c,s,f,l=-1,h=u.length,p=t.value;++l<h;){for(a=u[l],c=a.children,s=a.value=0,f=c.length;s<f;++s)a.value+=c[s].value;a.dice?Sg(a,e,r,i,r+=(o-r)*a.value/p):Lg(a,e,r,e+=(i-e)*a.value/p,o),p-=a.value}else t._squarify=u=lu(n,t,e,r,i,o),u.ratio=n}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(Rg),Yg=function(t,n){function e(){var e,i,o=r.length,u=0,a=0;for(e=0;e<o;++e)i=r[e],u+=i.x,a+=i.y;for(u=u/o-t,a=a/o-n,e=0;e<o;++e)i=r[e],i.x-=u,i.y-=a}var r;return null==t&&(t=0),null==n&&(n=0),e.initialize=function(t){r=t},e.x=function(n){return arguments.length?(t=+n,e):t},e.y=function(t){return arguments.length?(n=+t,e):n},e},Bg=function(t){return function(){return t}},jg=function(){return 1e-6*(Math.random()-.5)},Hg=function(t){function n(){function t(t,e,r,i,o){var a=t.data,p=t.r,d=l+p;{if(!a)return e>s+d||i<s-d||r>f+d||o<f-d;if(a.index>n){var v=s-a.x-a.vx,_=f-a.y-a.vy,y=v*v+_*_;y<d*d&&(0===v&&(v=jg(),y+=v*v),0===_&&(_=jg(),y+=_*_),y=(d-(y=Math.sqrt(y)))/y*u,c.vx+=(v*=y)*(d=(p*=p)/(h+p)),c.vy+=(_*=y)*d,a.vx-=v*(d=1-d),a.vy-=_*d)}}}for(var n,r,c,s,f,l,h,p=i.length,d=0;d<a;++d)for(r=I(i,hu,pu).visitAfter(e),n=0;n<p;++n)c=i[n],l=o[n],h=l*l,s=c.x+c.vx,f=c.y+c.vy,r.visit(t)}function e(t){if(t.data)return t.r=o[t.data.index];for(var n=t.r=0;n<4;++n)t[n]&&t[n].r>t.r&&(t.r=t[n].r)}function r(){if(i){var n,e=i.length;for(o=new Array(e),n=0;n<e;++n)o[n]=+t(i[n],n,i)}}var i,o,u=1,a=1;return"function"!=typeof t&&(t=Bg(null==t?1:+t)),n.initialize=function(t){i=t,r()},n.iterations=function(t){return arguments.length?(a=+t,n):a},n.strength=function(t){return arguments.length?(u=+t,n):u},n.radius=function(e){return arguments.length?(t="function"==typeof e?e:Bg(+e),r(),n):t},n},Xg=function(t){function n(t){return 1/Math.min(f[t.source.index],f[t.target.index])}function e(n){for(var e=0,r=t.length;e<v;++e)for(var i,o,u,s,f,h,p,d=0;d<r;++d)i=t[d],o=i.source,u=i.target,s=u.x+u.vx-o.x-o.vx||jg(),f=u.y+u.vy-o.y-o.vy||jg(),h=Math.sqrt(s*s+f*f),h=(h-c[d])/h*n*a[d],s*=h,f*=h,u.vx-=s*(p=l[d]),u.vy-=f*p,o.vx+=s*(p=1-p),o.vy+=f*p}function r(){if(s){var n,e,r=s.length,p=t.length,d=o(s,h);for(n=0,f=new Array(r);n<r;++n)f[n]=0;for(n=0;n<p;++n)e=t[n],e.index=n,"object"!=typeof e.source&&(e.source=vu(d,e.source)),"object"!=typeof e.target&&(e.target=vu(d,e.target)),++f[e.source.index],++f[e.target.index];for(n=0,l=new Array(p);n<p;++n)e=t[n],l[n]=f[e.source.index]/(f[e.source.index]+f[e.target.index]);a=new Array(p),i(),c=new Array(p),u()}}function i(){if(s)for(var n=0,e=t.length;n<e;++n)a[n]=+p(t[n],n,t)}function u(){if(s)for(var n=0,e=t.length;n<e;++n)c[n]=+d(t[n],n,t)}var a,c,s,f,l,h=du,p=n,d=Bg(30),v=1;return null==t&&(t=[]),e.initialize=function(t){s=t,r()},e.links=function(n){return arguments.length?(t=n,r(),e):t},e.id=function(t){return arguments.length?(h=t,e):h},e.iterations=function(t){return arguments.length?(v=+t,e):v},e.strength=function(t){return arguments.length?(p="function"==typeof t?t:Bg(+t),i(),e):p},e.distance=function(t){return arguments.length?(d="function"==typeof t?t:Bg(+t),u(),e):d},e},Vg=10,Wg=Math.PI*(3-Math.sqrt(5)),$g=function(t){function n(){e(),d.call("tick",u),a<c&&(p.stop(),d.call("end",u))}function e(){var n,e,r=t.length;for(a+=(f-a)*s,h.each(function(t){t(a)}),n=0;n<r;++n)e=t[n],null==e.fx?e.x+=e.vx*=l:(e.x=e.fx,e.vx=0),null==e.fy?e.y+=e.vy*=l:(e.y=e.fy,e.vy=0)}function r(){for(var n,e=0,r=t.length;e<r;++e){if(n=t[e],n.index=e,isNaN(n.x)||isNaN(n.y)){var i=Vg*Math.sqrt(e),o=e*Wg;n.x=i*Math.cos(o),n.y=i*Math.sin(o)}(isNaN(n.vx)||isNaN(n.vy))&&(n.vx=n.vy=0)}}function i(n){return n.initialize&&n.initialize(t),n}var u,a=1,c=.001,s=1-Math.pow(c,1/300),f=0,l=.6,h=o(),p=Vn(n),d=Pn("tick","end");return null==t&&(t=[]),r(),u={tick:e,restart:function(){return p.restart(n),u},stop:function(){return p.stop(),u},nodes:function(n){return arguments.length?(t=n,r(),h.each(i),u):t},alpha:function(t){return arguments.length?(a=+t,u):a},alphaMin:function(t){return arguments.length?(c=+t,u):c},alphaDecay:function(t){return arguments.length?(s=+t,u):+s},alphaTarget:function(t){return arguments.length?(f=+t,u):f},velocityDecay:function(t){return arguments.length?(l=1-t,u):1-l},force:function(t,n){return arguments.length>1?(null==n?h.remove(t):h.set(t,i(n)),u):h.get(t)},find:function(n,e,r){var i,o,u,a,c,s=0,f=t.length;for(null==r?r=1/0:r*=r,s=0;s<f;++s)a=t[s],i=n-a.x,o=e-a.y,u=i*i+o*o,u<r&&(c=a,r=u);return c},on:function(t,n){return arguments.length>1?(d.on(t,n),u):d.on(t)}}},Zg=function(){function t(t){var n,a=i.length,c=I(i,_u,yu).visitAfter(e);for(u=t,n=0;n<a;++n)o=i[n],c.visit(r)}function n(){if(i){var t,n=i.length;for(a=new Array(n),t=0;t<n;++t)a[t]=+c(i[t],t,i)}}function e(t){var n,e,r,i,o,u=0;if(t.length){for(r=i=o=0;o<4;++o)(n=t[o])&&(e=n.value)&&(u+=e,r+=e*n.x,i+=e*n.y);t.x=r/u,t.y=i/u}else{n=t,n.x=n.data.x,n.y=n.data.y;do u+=a[n.data.index];while(n=n.next)}t.value=u}function r(t,n,e,r){if(!t.value)return!0;var i=t.x-o.x,c=t.y-o.y,h=r-n,p=i*i+c*c;if(h*h/l<p)return p<f&&(0===i&&(i=jg(),p+=i*i),0===c&&(c=jg(),p+=c*c),p<s&&(p=Math.sqrt(s*p)),o.vx+=i*t.value*u/p,o.vy+=c*t.value*u/p),!0;if(!(t.length||p>=f)){(t.data!==o||t.next)&&(0===i&&(i=jg(),p+=i*i),0===c&&(c=jg(),p+=c*c),p<s&&(p=Math.sqrt(s*p)));do t.data!==o&&(h=a[t.data.index]*u/p,o.vx+=i*h,o.vy+=c*h);while(t=t.next)}}var i,o,u,a,c=Bg(-30),s=1,f=1/0,l=.81;return t.initialize=function(t){i=t,n()},t.strength=function(e){return arguments.length?(c="function"==typeof e?e:Bg(+e),n(),t):c},t.distanceMin=function(n){return arguments.length?(s=n*n,t):Math.sqrt(s)},t.distanceMax=function(n){return arguments.length?(f=n*n,t):Math.sqrt(f)},t.theta=function(n){return arguments.length?(l=n*n,t):Math.sqrt(l)},t},Gg=function(t){function n(t){for(var n,e=0,u=r.length;e<u;++e)n=r[e],n.vx+=(o[e]-n.x)*i[e]*t}function e(){if(r){var n,e=r.length;for(i=new Array(e),o=new Array(e),n=0;n<e;++n)i[n]=isNaN(o[n]=+t(r[n],n,r))?0:+u(r[n],n,r)}}var r,i,o,u=Bg(.1);return"function"!=typeof t&&(t=Bg(null==t?0:+t)),n.initialize=function(t){r=t,e()},n.strength=function(t){return arguments.length?(u="function"==typeof t?t:Bg(+t),e(),n):u},n.x=function(r){return arguments.length?(t="function"==typeof r?r:Bg(+r),e(),n):t},n},Jg=function(t){function n(t){for(var n,e=0,u=r.length;e<u;++e)n=r[e],n.vy+=(o[e]-n.y)*i[e]*t}function e(){if(r){var n,e=r.length;for(i=new Array(e),o=new Array(e),n=0;n<e;++n)i[n]=isNaN(o[n]=+t(r[n],n,r))?0:+u(r[n],n,r)}}var r,i,o,u=Bg(.1);return"function"!=typeof t&&(t=Bg(null==t?0:+t)),n.initialize=function(t){r=t,e()},n.strength=function(t){return arguments.length?(u="function"==typeof t?t:Bg(+t),e(),n):u},n.y=function(r){return arguments.length?(t="function"==typeof r?r:Bg(+r),e(),n):t},n},Qg=function(){t.event.preventDefault(),t.event.stopImmediatePropagation()},Kg=function(t){var n=t.document.documentElement,e=_y(t).on("dragstart.drag",Qg,!0);"onselectstart"in n?e.on("selectstart.drag",Qg,!0):(n.__noselect=n.style.MozUserSelect,n.style.MozUserSelect="none")},tm=function(t){return function(){return t}};xu.prototype.on=function(){var t=this._.on.apply(this._,arguments);return t===this._?this:t};var nm=function(){function n(t){t.on("mousedown.drag",e).on("touchstart.drag",o).on("touchmove.drag",u).on("touchend.drag touchcancel.drag",a).style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function e(){if(!f&&l.apply(this,arguments)){var n=c("mouse",h.apply(this,arguments),L_,this,arguments);n&&(_y(t.event.view).on("mousemove.drag",r,!0).on("mouseup.drag",i,!0),Kg(t.event.view),gu(),s=!1,n("start"))}}function r(){Qg(),s=!0,d.mouse("drag")}function i(){_y(t.event.view).on("mousemove.drag mouseup.drag",null),mu(t.event.view,s),Qg(),d.mouse("end")}function o(){if(l.apply(this,arguments)){var n,e,r=t.event.changedTouches,i=h.apply(this,arguments),o=r.length;for(n=0;n<o;++n)(e=c(r[n].identifier,i,gy,this,arguments))&&(gu(),e("start"))}}function u(){var n,e,r=t.event.changedTouches,i=r.length;for(n=0;n<i;++n)(e=d[r[n].identifier])&&(Qg(),e("drag"))}function a(){var n,e,r=t.event.changedTouches,i=r.length;for(f&&clearTimeout(f),f=setTimeout(function(){f=null},500),n=0;n<i;++n)(e=d[r[n].identifier])&&(gu(),e("end"))}function c(e,r,i,o,u){var a,c,s,f=i(r,e),l=v.copy();if(Xr(new xu(n,"beforestart",a,e,_,f[0],f[1],0,0,l),function(){return null!=(t.event.subject=a=p.apply(o,u))&&(c=a.x-f[0]||0,s=a.y-f[1]||0,!0)}))return function t(h){var p,v=f;switch(h){case"start":d[e]=t,p=_++;break;case"end":delete d[e],--_;case"drag":f=i(r,e),p=_}Xr(new xu(n,h,a,e,p,f[0]+c,f[1]+s,f[0]-v[0],f[1]-v[1],l),l.apply,l,[h,o,u])}}var s,f,l=bu,h=wu,p=Mu,d={},v=Pn("start","drag","end"),_=0;return n.filter=function(t){return arguments.length?(l="function"==typeof t?t:tm(!!t),n):l},n.container=function(t){return arguments.length?(h="function"==typeof t?t:tm(t),n):h},n.subject=function(t){return arguments.length?(p="function"==typeof t?t:tm(t),n):p},n.on=function(){var t=v.on.apply(v,arguments);return t===v?n:t},n},em=function(t){return function(){return t}};ku.prototype={constructor:ku,insert:function(t,n){var e,r,i;if(t){if(n.P=t,n.N=t.N,t.N&&(t.N.P=n),t.N=n,t.R){for(t=t.R;t.L;)t=t.L;t.L=n}else t.R=n;e=t}else this._?(t=Cu(this._),n.P=null,n.N=t,t.P=t.L=n,e=t):(n.P=n.N=null,this._=n,e=null);for(n.L=n.R=null,n.U=e,n.C=!0,t=n;e&&e.C;)r=e.U,e===r.L?(i=r.R,i&&i.C?(e.C=i.C=!1,r.C=!0,t=r):(t===e.R&&(Au(this,e),t=e,e=t.U),e.C=!1,r.C=!0,Eu(this,r))):(i=r.L,i&&i.C?(e.C=i.C=!1,r.C=!0,t=r):(t===e.L&&(Eu(this,e),t=e,e=t.U),e.C=!1,r.C=!0,Au(this,r))),e=t.U;this._.C=!1},remove:function(t){t.N&&(t.N.P=t.P),t.P&&(t.P.N=t.N),t.N=t.P=null;var n,e,r,i=t.U,o=t.L,u=t.R;if(e=o?u?Cu(u):o:u,i?i.L===t?i.L=e:i.R=e:this._=e,o&&u?(r=e.C,e.C=t.C,e.L=o,o.U=e,e!==u?(i=e.U,e.U=t.U,t=e.R,i.L=t,e.R=u,u.U=e):(e.U=i,i=e,t=e.R)):(r=t.C,t=e),t&&(t.U=i),!r){if(t&&t.C)return void(t.C=!1);do{if(t===this._)break;if(t===i.L){if(n=i.R,n.C&&(n.C=!1,i.C=!0,Au(this,i),n=i.R),n.L&&n.L.C||n.R&&n.R.C){n.R&&n.R.C||(n.L.C=!1,n.C=!0,Eu(this,n),n=i.R),n.C=i.C,i.C=n.R.C=!1,Au(this,i),t=this._;break}}else if(n=i.L,n.C&&(n.C=!1,i.C=!0,Eu(this,i),n=i.L),n.L&&n.L.C||n.R&&n.R.C){n.L&&n.L.C||(n.R.C=!1,n.C=!0,Au(this,n),n=i.L),n.C=i.C,i.C=n.L.C=!1,Eu(this,i),t=this._;break}n.C=!0,t=i,i=i.U}while(!t.C);t&&(t.C=!1)}}};var rm,im,om,um,am,cm=[],sm=[],fm=1e-6,lm=1e-12;na.prototype={constructor:na,polygons:function(){var t=this.edges;return this.cells.map(function(n){var e=n.halfedges.map(function(e){return Fu(n,t[e])});return e.data=n.site.data,e})},triangles:function(){var t=[],n=this.edges;return this.cells.forEach(function(e,r){for(var i,o=e.site,u=e.halfedges,a=-1,c=u.length,s=n[u[c-1]],f=s.left===o?s.right:s.left;++a<c;)i=f,s=n[u[a]],f=s.left===o?s.right:s.left,r<i.index&&r<f.index&&Ku(o,i,f)<0&&t.push([o.data,i.data,f.data])}),t},links:function(){return this.edges.filter(function(t){return t.right}).map(function(t){return{source:t.left.data,target:t.right.data}})}};var hm=function(){function t(t){return new na(t.map(function(r,i){var o=[Math.round(n(r,i,t)/fm)*fm,Math.round(e(r,i,t)/fm)*fm];return o.index=i,o.data=r,o}),r)}var n=Tu,e=Nu,r=null;return t.polygons=function(n){return t(n).polygons()},t.links=function(n){return t(n).links()},t.triangles=function(n){return t(n).triangles()},t.x=function(e){return arguments.length?(n="function"==typeof e?e:em(+e),t):n},t.y=function(n){return arguments.length?(e="function"==typeof n?n:em(+n),t):e},t.extent=function(n){return arguments.length?(r=null==n?null:[[+n[0][0],+n[0][1]],[+n[1][0],+n[1][1]]],t):r&&[[r[0][0],r[0][1]],[r[1][0],r[1][1]]]},t.size=function(n){return arguments.length?(r=null==n?null:[[0,0],[+n[0],+n[1]]],t):r&&[r[1][0]-r[0][0],r[1][1]-r[0][1]]},t},pm=function(t){return function(){return t}};ra.prototype={constructor:ra,scale:function(t){return 1===t?this:new ra(this.k*t,this.x,this.y)},translate:function(t,n){return 0===t&0===n?this:new ra(this.k,this.x+this.k*t,this.y+this.k*n)},apply:function(t){return[t[0]*this.k+this.x,t[1]*this.k+this.y]},applyX:function(t){return t*this.k+this.x},applyY:function(t){return t*this.k+this.y},invert:function(t){return[(t[0]-this.x)/this.k,(t[1]-this.y)/this.k]},invertX:function(t){return(t-this.x)/this.k},invertY:function(t){return(t-this.y)/this.k},rescaleX:function(t){return t.copy().domain(t.range().map(this.invertX,this).map(t.invert,t))},rescaleY:function(t){return t.copy().domain(t.range().map(this.invertY,this).map(t.invert,t))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var dm=new ra(1,0,0);ia.prototype=ra.prototype;var vm=function(){t.event.preventDefault(),t.event.stopImmediatePropagation()},_m=function(){function n(t){t.on("wheel.zoom",s).on("mousedown.zoom",f).on("dblclick.zoom",l).on("touchstart.zoom",h).on("touchmove.zoom",p).on("touchend.zoom touchcancel.zoom",d).style("-webkit-tap-highlight-color","rgba(0,0,0,0)").property("__zoom",ca)}function e(t,n){return n=Math.max(m,Math.min(x,n)),n===t.k?t:new ra(n,t.x,t.y)}function r(t,n,e){var r=n[0]-e[0]*t.k,i=n[1]-e[1]*t.k;return r===t.x&&i===t.y?t:new ra(t.k,r,i)}function i(t,n){var e=Math.min(0,t.invertX(n[0][0])-b)||Math.max(0,t.invertX(n[1][0])-w),r=Math.min(0,t.invertY(n[0][1])-M)||Math.max(0,t.invertY(n[1][1])-T);return e||r?t.translate(e,r):t}function o(t){return[(+t[0][0]+ +t[1][0])/2,(+t[0][1]+ +t[1][1])/2]}function u(t,n,e){t.on("start.zoom",function(){a(this,arguments).start()}).on("interrupt.zoom end.zoom",function(){a(this,arguments).end()}).tween("zoom",function(){var t=this,r=arguments,i=a(t,r),u=g.apply(t,r),c=e||o(u),s=Math.max(u[1][0]-u[0][0],u[1][1]-u[0][1]),f=t.__zoom,l="function"==typeof n?n.apply(t,r):n,h=Np(f.invert(c).concat(s/f.k),l.invert(c).concat(s/l.k));return function(t){if(1===t)t=l;else{var n=h(t),e=s/n[2];t=new ra(e,c[0]-n[0]*e,c[1]-n[1]*e)}i.zoom(null,t)}})}function a(t,n){for(var e,r=0,i=k.length;r<i;++r)if((e=k[r]).that===t)return e;return new c(t,n)}function c(t,n){this.that=t,this.args=n,this.index=-1,this.active=0,this.extent=g.apply(t,n)}function s(){function n(){o.wheel=null,o.end()}if(y.apply(this,arguments)){var o=a(this,arguments),u=this.__zoom,c=Math.max(m,Math.min(x,u.k*Math.pow(2,-t.event.deltaY*(t.event.deltaMode?120:1)/500))),s=L_(this);if(o.wheel)o.mouse[0][0]===s[0]&&o.mouse[0][1]===s[1]||(o.mouse[1]=u.invert(o.mouse[0]=s)),clearTimeout(o.wheel);else{if(u.k===c)return;o.mouse=[s,u.invert(s)],Cy(this),o.start()}vm(),o.wheel=setTimeout(n,E),o.zoom("mouse",i(r(e(u,c),o.mouse[0],o.mouse[1]),o.extent))}}function f(){function n(){vm(),o.moved=!0,o.zoom("mouse",i(r(o.that.__zoom,o.mouse[0]=L_(o.that),o.mouse[1]),o.extent))}function e(){u.on("mousemove.zoom mouseup.zoom",null),mu(t.event.view,o.moved),vm(),o.end()}if(!_&&y.apply(this,arguments)){var o=a(this,arguments),u=_y(t.event.view).on("mousemove.zoom",n,!0).on("mouseup.zoom",e,!0),c=L_(this);Kg(t.event.view),oa(),o.mouse=[c,this.__zoom.invert(c)],Cy(this),o.start()}}function l(){if(y.apply(this,arguments)){var o=this.__zoom,a=L_(this),c=o.invert(a),s=o.k*(t.event.shiftKey?.5:2),f=i(r(e(o,s),a,c),g.apply(this,arguments));vm(),N>0?_y(this).transition().duration(N).call(u,f,a):_y(this).call(n.transform,f)}}function h(){if(y.apply(this,arguments)){var n,e,r,i=a(this,arguments),o=t.event.changedTouches,u=o.length;for(oa(),n=0;n<u;++n)e=o[n],r=gy(this,o,e.identifier),r=[r,this.__zoom.invert(r),e.identifier],i.touch0?i.touch1||(i.touch1=r):i.touch0=r;return v&&(v=clearTimeout(v),!i.touch1)?(i.end(),l.apply(this,arguments)):void(t.event.touches.length===u&&(v=setTimeout(function(){v=null},A),Cy(this),i.start()))}}function p(){var n,o,u,c,s=a(this,arguments),f=t.event.changedTouches,l=f.length;for(vm(),v&&(v=clearTimeout(v)),n=0;n<l;++n)o=f[n],u=gy(this,f,o.identifier),s.touch0&&s.touch0[2]===o.identifier?s.touch0[0]=u:s.touch1&&s.touch1[2]===o.identifier&&(s.touch1[0]=u);if(o=s.that.__zoom,s.touch1){var h=s.touch0[0],p=s.touch0[1],d=s.touch1[0],_=s.touch1[1],y=(y=d[0]-h[0])*y+(y=d[1]-h[1])*y,g=(g=_[0]-p[0])*g+(g=_[1]-p[1])*g;o=e(o,Math.sqrt(y/g)),u=[(h[0]+d[0])/2,(h[1]+d[1])/2],c=[(p[0]+_[0])/2,(p[1]+_[1])/2]}else{if(!s.touch0)return;u=s.touch0[0],c=s.touch0[1]}s.zoom("touch",i(r(o,u,c),s.extent))}function d(){var n,e,r=a(this,arguments),i=t.event.changedTouches,o=i.length;for(oa(),_&&clearTimeout(_),_=setTimeout(function(){_=null},A),n=0;n<o;++n)e=i[n],r.touch0&&r.touch0[2]===e.identifier?delete r.touch0:r.touch1&&r.touch1[2]===e.identifier&&delete r.touch1;r.touch1&&!r.touch0&&(r.touch0=r.touch1,delete r.touch1),r.touch0||r.end()}var v,_,y=ua,g=aa,m=0,x=1/0,b=-x,w=x,M=b,T=w,N=250,k=[],S=Pn("start","zoom","end"),A=500,E=150;return n.transform=function(t,n){var e=t.selection?t.selection():t;e.property("__zoom",ca),t!==e?u(t,n):e.interrupt().each(function(){a(this,arguments).start().zoom(null,"function"==typeof n?n.apply(this,arguments):n).end()})},n.scaleBy=function(t,e){n.scaleTo(t,function(){var t=this.__zoom.k,n="function"==typeof e?e.apply(this,arguments):e;return t*n})},n.scaleTo=function(t,u){n.transform(t,function(){var t=g.apply(this,arguments),n=this.__zoom,a=o(t),c=n.invert(a),s="function"==typeof u?u.apply(this,arguments):u;return i(r(e(n,s),a,c),t)})},n.translateBy=function(t,e,r){n.transform(t,function(){return i(this.__zoom.translate("function"==typeof e?e.apply(this,arguments):e,"function"==typeof r?r.apply(this,arguments):r),g.apply(this,arguments))})},c.prototype={start:function(){return 1===++this.active&&(this.index=k.push(this)-1,this.emit("start")),this},zoom:function(t,n){return this.mouse&&"mouse"!==t&&(this.mouse[1]=n.invert(this.mouse[0])),this.touch0&&"touch"!==t&&(this.touch0[1]=n.invert(this.touch0[0])),this.touch1&&"touch"!==t&&(this.touch1[1]=n.invert(this.touch1[0])),this.that.__zoom=n,this.emit("zoom"),this},end:function(){return 0===--this.active&&(k.splice(this.index,1),this.index=-1,this.emit("end")),this},emit:function(t){Xr(new ea(n,t,this.that.__zoom),S.apply,S,[t,this.that,this.args])}},n.filter=function(t){return arguments.length?(y="function"==typeof t?t:pm(!!t),n):y},n.extent=function(t){return arguments.length?(g="function"==typeof t?t:pm([[+t[0][0],+t[0][1]],[+t[1][0],+t[1][1]]]),n):g},n.scaleExtent=function(t){return arguments.length?(m=+t[0],x=+t[1],n):[m,x]},n.translateExtent=function(t){return arguments.length?(b=+t[0][0],w=+t[1][0],M=+t[0][1],T=+t[1][1],n):[[b,M],[w,T]]},n.duration=function(t){return arguments.length?(N=+t,n):N},n.on=function(){var t=S.on.apply(S,arguments);return t===S?n:t},n},ym=function(t){return function(){return t}},gm=function(t,n,e){this.target=t,this.type=n,this.selection=e},mm=function(){t.event.preventDefault(),t.event.stopImmediatePropagation()},xm={name:"drag"},bm={name:"space"},wm={name:"handle"},Mm={name:"center"},Tm={name:"x",handles:["e","w"].map(fa),input:function(t,n){return t&&[[t[0],n[0][1]],[t[1],n[1][1]]]},output:function(t){return t&&[t[0][0],t[1][0]]}},Nm={name:"y",handles:["n","s"].map(fa),input:function(t,n){return t&&[[n[0][0],t[0]],[n[1][0],t[1]]]},output:function(t){return t&&[t[0][1],t[1][1]]}},km={name:"xy",handles:["n","e","s","w","nw","ne","se","sw"].map(fa),input:function(t){return t},output:function(t){return t}},Sm={overlay:"crosshair",selection:"move",n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},Am={e:"w",w:"e",nw:"ne",ne:"nw",se:"sw",sw:"se"},Em={n:"s",s:"n",nw:"sw",ne:"se",se:"ne",sw:"nw"},Cm={overlay:1,selection:1,n:null,e:1,s:null,w:-1,nw:-1,ne:1,se:1,sw:-1},zm={overlay:1,selection:1,n:-1,e:null,s:1,w:null,nw:-1,ne:-1,se:1,sw:1},Pm=function(){return ga(km)},qm=Math.cos,Lm=Math.sin,Rm=Math.PI,Um=Rm/2,Dm=2*Rm,Om=Math.max,Fm=function(){function t(t){var o,u,a,c,s,f,l=t.length,h=[],p=Us(l),d=[],v=[],_=v.groups=new Array(l),y=new Array(l*l);for(o=0,s=-1;++s<l;){for(u=0,f=-1;++f<l;)u+=t[s][f];h.push(u),d.push(Us(l)),o+=u}for(e&&p.sort(function(t,n){return e(h[t],h[n])}),r&&d.forEach(function(n,e){n.sort(function(n,i){return r(t[e][n],t[e][i])})}),o=Om(0,Dm-n*l)/o,c=o?n:Dm/l,u=0,s=-1;++s<l;){for(a=u,f=-1;++f<l;){var g=p[s],m=d[g][f],x=t[g][m],b=u,w=u+=x*o;y[m*l+g]={index:g,subindex:m,startAngle:b,endAngle:w,value:x}}_[g]={index:g,startAngle:a,endAngle:u,value:h[g]},u+=c}for(s=-1;++s<l;)for(f=s-1;++f<l;){var M=y[f*l+s],T=y[s*l+f];(M.value||T.value)&&v.push(M.value<T.value?{source:T,target:M}:{source:M,target:T})}return i?v.sort(i):v}var n=0,e=null,r=null,i=null;return t.padAngle=function(e){return arguments.length?(n=Om(0,e),t):n},t.sortGroups=function(n){return arguments.length?(e=n,t):e},t.sortSubgroups=function(n){return arguments.length?(r=n,t):r},t.sortChords=function(n){return arguments.length?(null==n?i=null:(i=ma(n))._=n,t):i&&i._},t},Im=Array.prototype.slice,Ym=function(t){return function(){return t}},Bm=function(){function t(){var t,a=Im.call(arguments),c=n.apply(this,a),s=e.apply(this,a),f=+r.apply(this,(a[0]=c,a)),l=i.apply(this,a)-Um,h=o.apply(this,a)-Um,p=f*qm(l),d=f*Lm(l),v=+r.apply(this,(a[0]=s,a)),_=i.apply(this,a)-Um,y=o.apply(this,a)-Um;if(u||(u=t=L()),u.moveTo(p,d),u.arc(0,0,f,l,h),l===_&&h===y||(u.quadraticCurveTo(0,0,v*qm(_),v*Lm(_)),u.arc(0,0,v,_,y)),u.quadraticCurveTo(0,0,p,d),u.closePath(),t)return u=null,t+""||null}var n=xa,e=ba,r=wa,i=Ma,o=Ta,u=null;return t.radius=function(n){return arguments.length?(r="function"==typeof n?n:Ym(+n),t):r},t.startAngle=function(n){return arguments.length?(i="function"==typeof n?n:Ym(+n),t):i},t.endAngle=function(n){return arguments.length?(o="function"==typeof n?n:Ym(+n),t):o},t.source=function(e){return arguments.length?(n=e,t):n},t.target=function(n){return arguments.length?(e=n,t):e},t.context=function(n){return arguments.length?(u=null==n?null:n,t):u},t},jm=function(){return new Na};Na.prototype={constructor:Na,reset:function(){this.s=this.t=0},add:function(t){ka(bx,t,this.t),ka(this,bx.s,this.s),this.s?this.t+=bx.t:this.s=bx.t},valueOf:function(){return this.s}};var Hm,Xm,Vm,Wm,$m,Zm,Gm,Jm,Qm,Km,tx,nx,ex,rx,ix,ox,ux,ax,cx,sx,fx,lx,hx,px,dx,vx,_x,yx,gx,mx,xx,bx=new Na,wx=1e-6,Mx=1e-12,Tx=Math.PI,Nx=Tx/2,kx=Tx/4,Sx=2*Tx,Ax=180/Tx,Ex=Tx/180,Cx=Math.abs,zx=Math.atan,Px=Math.atan2,qx=Math.cos,Lx=Math.ceil,Rx=Math.exp,Ux=Math.log,Dx=Math.pow,Ox=Math.sin,Fx=Math.sign||function(t){return t>0?1:t<0?-1:0},Ix=Math.sqrt,Yx=Math.tan,Bx={Feature:function(t,n){za(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,i=e.length;++r<i;)za(e[r].geometry,n)}},jx={Sphere:function(t,n){n.sphere()},Point:function(t,n){t=t.coordinates,n.point(t[0],t[1],t[2])},MultiPoint:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)t=e[r],n.point(t[0],t[1],t[2])},LineString:function(t,n){Pa(t.coordinates,n,0)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)Pa(e[r],n,0)},Polygon:function(t,n){qa(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)qa(e[r],n)},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,i=e.length;++r<i;)za(e[r],n)}},Hx=function(t,n){t&&Bx.hasOwnProperty(t.type)?Bx[t.type](t,n):za(t,n)},Xx=jm(),Vx=jm(),Wx={point:Ca,lineStart:Ca,lineEnd:Ca,polygonStart:function(){Xx.reset(),Wx.lineStart=La,Wx.lineEnd=Ra},polygonEnd:function(){var t=+Xx;Vx.add(t<0?Sx+t:t),this.lineStart=this.lineEnd=this.point=Ca},sphere:function(){Vx.add(Sx)}},$x=function(t){return Vx.reset(),Hx(t,Wx),2*Vx},Zx=jm(),Gx={point:Xa,lineStart:Wa,lineEnd:$a,polygonStart:function(){Gx.point=Za,Gx.lineStart=Ga,Gx.lineEnd=Ja,Zx.reset(),Wx.polygonStart()},polygonEnd:function(){Wx.polygonEnd(),Gx.point=Xa,Gx.lineStart=Wa,Gx.lineEnd=$a,Xx<0?(Zm=-(Jm=180),Gm=-(Qm=90)):Zx>wx?Qm=90:Zx<-wx&&(Gm=-90),ix[0]=Zm,ix[1]=Jm}},Jx=function(t){var n,e,r,i,o,u,a;if(Qm=Jm=-(Zm=Gm=1/0),rx=[],Hx(t,Gx),e=rx.length){for(rx.sort(Ka),n=1,r=rx[0],o=[r];n<e;++n)i=rx[n],tc(r,i[0])||tc(r,i[1])?(Qa(r[0],i[1])>Qa(r[0],r[1])&&(r[1]=i[1]),Qa(i[0],r[1])>Qa(r[0],r[1])&&(r[0]=i[0])):o.push(r=i);for(u=-(1/0),e=o.length-1,n=0,r=o[e];n<=e;r=i,++n)i=o[n],(a=Qa(r[1],i[0]))>u&&(u=a,Zm=i[0],Jm=r[1])}return rx=ix=null,Zm===1/0||Gm===1/0?[[NaN,NaN],[NaN,NaN]]:[[Zm,Gm],[Jm,Qm]]},Qx={sphere:Ca,point:nc,lineStart:rc,
lineEnd:uc,polygonStart:function(){Qx.lineStart=ac,Qx.lineEnd=cc},polygonEnd:function(){Qx.lineStart=rc,Qx.lineEnd=uc}},Kx=function(t){ox=ux=ax=cx=sx=fx=lx=hx=px=dx=vx=0,Hx(t,Qx);var n=px,e=dx,r=vx,i=n*n+e*e+r*r;return i<Mx&&(n=fx,e=lx,r=hx,ux<wx&&(n=ax,e=cx,r=sx),i=n*n+e*e+r*r,i<Mx)?[NaN,NaN]:[Px(e,n)*Ax,Aa(r/Ix(i))*Ax]},tb=function(t){return function(){return t}},nb=function(t,n){function e(e,r){return e=t(e,r),n(e[0],e[1])}return t.invert&&n.invert&&(e.invert=function(e,r){return e=n.invert(e,r),e&&t.invert(e[0],e[1])}),e};lc.invert=lc;var eb,rb,ib,ob,ub,ab,cb,sb,fb,lb,hb,pb=function(t){function n(n){return n=t(n[0]*Ex,n[1]*Ex),n[0]*=Ax,n[1]*=Ax,n}return t=hc(t[0]*Ex,t[1]*Ex,t.length>2?t[2]*Ex:0),n.invert=function(n){return n=t.invert(n[0]*Ex,n[1]*Ex),n[0]*=Ax,n[1]*=Ax,n},n},db=function(){function t(t,n){e.push(t=r(t,n)),t[0]*=Ax,t[1]*=Ax}function n(){var t=i.apply(this,arguments),n=o.apply(this,arguments)*Ex,c=u.apply(this,arguments)*Ex;return e=[],r=hc(-t[0]*Ex,-t[1]*Ex,0).invert,_c(a,n,c,1),t={type:"Polygon",coordinates:[e]},e=r=null,t}var e,r,i=tb([0,0]),o=tb(90),u=tb(6),a={point:t};return n.center=function(t){return arguments.length?(i="function"==typeof t?t:tb([+t[0],+t[1]]),n):i},n.radius=function(t){return arguments.length?(o="function"==typeof t?t:tb(+t),n):o},n.precision=function(t){return arguments.length?(u="function"==typeof t?t:tb(+t),n):u},n},vb=function(){var t,n=[];return{point:function(n,e){t.push([n,e])},lineStart:function(){n.push(t=[])},lineEnd:Ca,rejoin:function(){n.length>1&&n.push(n.pop().concat(n.shift()))},result:function(){var e=n;return n=[],t=null,e}}},_b=function(t,n,e,r,i,o){var u,a=t[0],c=t[1],s=n[0],f=n[1],l=0,h=1,p=s-a,d=f-c;if(u=e-a,p||!(u>0)){if(u/=p,p<0){if(u<l)return;u<h&&(h=u)}else if(p>0){if(u>h)return;u>l&&(l=u)}if(u=i-a,p||!(u<0)){if(u/=p,p<0){if(u>h)return;u>l&&(l=u)}else if(p>0){if(u<l)return;u<h&&(h=u)}if(u=r-c,d||!(u>0)){if(u/=d,d<0){if(u<l)return;u<h&&(h=u)}else if(d>0){if(u>h)return;u>l&&(l=u)}if(u=o-c,d||!(u<0)){if(u/=d,d<0){if(u>h)return;u>l&&(l=u)}else if(d>0){if(u<l)return;u<h&&(h=u)}return l>0&&(t[0]=a+l*p,t[1]=c+l*d),h<1&&(n[0]=a+h*p,n[1]=c+h*d),!0}}}}},yb=function(t,n){return Cx(t[0]-n[0])<wx&&Cx(t[1]-n[1])<wx},gb=function(t,n,e,r,i){var o,u,a=[],c=[];if(t.forEach(function(t){if(!((n=t.length-1)<=0)){var n,e,r=t[0],u=t[n];if(yb(r,u)){for(i.lineStart(),o=0;o<n;++o)i.point((r=t[o])[0],r[1]);return void i.lineEnd()}a.push(e=new gc(r,t,null,!0)),c.push(e.o=new gc(r,null,e,!1)),a.push(e=new gc(u,t,null,!1)),c.push(e.o=new gc(u,null,e,!0))}}),a.length){for(c.sort(n),mc(a),mc(c),o=0,u=c.length;o<u;++o)c[o].e=e=!e;for(var s,f,l=a[0];;){for(var h=l,p=!0;h.v;)if((h=h.n)===l)return;s=h.z,i.lineStart();do{if(h.v=h.o.v=!0,h.e){if(p)for(o=0,u=s.length;o<u;++o)i.point((f=s[o])[0],f[1]);else r(h.x,h.n.x,1,i);h=h.n}else{if(p)for(s=h.p.z,o=s.length-1;o>=0;--o)i.point((f=s[o])[0],f[1]);else r(h.x,h.p.x,-1,i);h=h.p}h=h.o,s=h.z,p=!p}while(!h.v);i.lineEnd()}}},mb=1e9,xb=-mb,bb=function(){var t,n,e,r=0,i=0,o=960,u=500;return e={stream:function(e){return t&&n===e?t:t=xc(r,i,o,u)(n=e)},extent:function(a){return arguments.length?(r=+a[0][0],i=+a[0][1],o=+a[1][0],u=+a[1][1],t=n=null,e):[[r,i],[o,u]]}}},wb=jm(),Mb={sphere:Ca,point:Ca,lineStart:bc,lineEnd:Ca,polygonStart:Ca,polygonEnd:Ca},Tb=function(t){return wb.reset(),Hx(t,Mb),+wb},Nb=[null,null],kb={type:"LineString",coordinates:Nb},Sb=function(t,n){return Nb[0]=t,Nb[1]=n,Tb(kb)},Ab=function(){function t(){return{type:"MultiLineString",coordinates:n()}}function n(){return Us(Lx(o/_)*_,i,_).map(h).concat(Us(Lx(s/y)*y,c,y).map(p)).concat(Us(Lx(r/d)*d,e,d).filter(function(t){return Cx(t%_)>wx}).map(f)).concat(Us(Lx(a/v)*v,u,v).filter(function(t){return Cx(t%y)>wx}).map(l))}var e,r,i,o,u,a,c,s,f,l,h,p,d=10,v=d,_=90,y=360,g=2.5;return t.lines=function(){return n().map(function(t){return{type:"LineString",coordinates:t}})},t.outline=function(){return{type:"Polygon",coordinates:[h(o).concat(p(c).slice(1),h(i).reverse().slice(1),p(s).reverse().slice(1))]}},t.extent=function(n){return arguments.length?t.extentMajor(n).extentMinor(n):t.extentMinor()},t.extentMajor=function(n){return arguments.length?(o=+n[0][0],i=+n[1][0],s=+n[0][1],c=+n[1][1],o>i&&(n=o,o=i,i=n),s>c&&(n=s,s=c,c=n),t.precision(g)):[[o,s],[i,c]]},t.extentMinor=function(n){return arguments.length?(r=+n[0][0],e=+n[1][0],a=+n[0][1],u=+n[1][1],r>e&&(n=r,r=e,e=n),a>u&&(n=a,a=u,u=n),t.precision(g)):[[r,a],[e,u]]},t.step=function(n){return arguments.length?t.stepMajor(n).stepMinor(n):t.stepMinor()},t.stepMajor=function(n){return arguments.length?(_=+n[0],y=+n[1],t):[_,y]},t.stepMinor=function(n){return arguments.length?(d=+n[0],v=+n[1],t):[d,v]},t.precision=function(n){return arguments.length?(g=+n,f=Nc(a,u,90),l=kc(r,e,g),h=Nc(s,c,90),p=kc(o,i,g),t):g},t.extentMajor([[-180,-90+wx],[180,90-wx]]).extentMinor([[-180,-80-wx],[180,80+wx]])},Eb=function(t,n){var e=t[0]*Ex,r=t[1]*Ex,i=n[0]*Ex,o=n[1]*Ex,u=qx(r),a=Ox(r),c=qx(o),s=Ox(o),f=u*qx(e),l=u*Ox(e),h=c*qx(i),p=c*Ox(i),d=2*Aa(Ix(Ea(o-r)+u*c*Ea(i-e))),v=Ox(d),_=d?function(t){var n=Ox(t*=d)/v,e=Ox(d-t)/v,r=e*f+n*h,i=e*l+n*p,o=e*a+n*s;return[Px(i,r)*Ax,Px(o,Ix(r*r+i*i))*Ax]}:function(){return[e*Ax,r*Ax]};return _.distance=d,_},Cb=function(t){return t},zb=jm(),Pb=jm(),qb={point:Ca,lineStart:Ca,lineEnd:Ca,polygonStart:function(){qb.lineStart=Sc,qb.lineEnd=Cc},polygonEnd:function(){qb.lineStart=qb.lineEnd=qb.point=Ca,zb.add(Cx(Pb)),Pb.reset()},result:function(){var t=zb/2;return zb.reset(),t}},Lb=1/0,Rb=Lb,Ub=-Lb,Db=Ub,Ob={point:zc,lineStart:Ca,lineEnd:Ca,polygonStart:Ca,polygonEnd:Ca,result:function(){var t=[[Lb,Rb],[Ub,Db]];return Ub=Db=-(Rb=Lb=1/0),t}},Fb=0,Ib=0,Yb=0,Bb=0,jb=0,Hb=0,Xb=0,Vb=0,Wb=0,$b={point:Pc,lineStart:qc,lineEnd:Uc,polygonStart:function(){$b.lineStart=Dc,$b.lineEnd=Oc},polygonEnd:function(){$b.point=Pc,$b.lineStart=qc,$b.lineEnd=Uc},result:function(){var t=Wb?[Xb/Wb,Vb/Wb]:Hb?[Bb/Hb,jb/Hb]:Yb?[Fb/Yb,Ib/Yb]:[NaN,NaN];return Fb=Ib=Yb=Bb=jb=Hb=Xb=Vb=Wb=0,t}};Yc.prototype={_radius:4.5,pointRadius:function(t){return this._radius=t,this},polygonStart:function(){this._line=0},polygonEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){0===this._line&&this._context.closePath(),this._point=NaN},point:function(t,n){switch(this._point){case 0:this._context.moveTo(t,n),this._point=1;break;case 1:this._context.lineTo(t,n);break;default:this._context.moveTo(t+this._radius,n),this._context.arc(t,n,this._radius,0,Sx)}},result:Ca},Bc.prototype={_circle:jc(4.5),pointRadius:function(t){return this._circle=jc(t),this},polygonStart:function(){this._line=0},polygonEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){0===this._line&&this._string.push("Z"),this._point=NaN},point:function(t,n){switch(this._point){case 0:this._string.push("M",t,",",n),this._point=1;break;case 1:this._string.push("L",t,",",n);break;default:this._string.push("M",t,",",n,this._circle)}},result:function(){if(this._string.length){var t=this._string.join("");return this._string=[],t}}};var Zb=function(){function t(t){return t&&("function"==typeof o&&i.pointRadius(+o.apply(this,arguments)),Hx(t,e(i))),i.result()}var n,e,r,i,o=4.5;return t.area=function(t){return Hx(t,e(qb)),qb.result()},t.bounds=function(t){return Hx(t,e(Ob)),Ob.result()},t.centroid=function(t){return Hx(t,e($b)),$b.result()},t.projection=function(r){return arguments.length?(e=null==(n=r)?Cb:r.stream,t):n},t.context=function(n){return arguments.length?(i=null==(r=n)?new Bc:new Yc(n),"function"!=typeof o&&i.pointRadius(o),t):r},t.pointRadius=function(n){return arguments.length?(o="function"==typeof n?n:(i.pointRadius(+n),+n),t):o},t.projection(null).context(null)},Gb=jm(),Jb=function(t,n){var e=n[0],r=n[1],i=[Ox(e),-qx(e),0],o=0,u=0;Gb.reset();for(var a=0,c=t.length;a<c;++a)if(f=(s=t[a]).length)for(var s,f,l=s[f-1],h=l[0],p=l[1]/2+kx,d=Ox(p),v=qx(p),_=0;_<f;++_,h=g,d=x,v=b,l=y){var y=s[_],g=y[0],m=y[1]/2+kx,x=Ox(m),b=qx(m),w=g-h,M=w>=0?1:-1,T=M*w,N=T>Tx,k=d*x;if(Gb.add(Px(k*M*Ox(T),v*b+k*qx(T))),o+=N?w+M*Sx:w,N^h>=e^g>=e){var S=Ya(Fa(l),Fa(y));Ha(S);var A=Ya(i,S);Ha(A);var E=(N^w>=0?-1:1)*Aa(A[2]);(r>E||r===E&&(S[0]||S[1]))&&(u+=N^w>=0?1:-1)}}return(o<-wx||o<wx&&Gb<-wx)^1&u},Qb=function(t,n,e,r){return function(i,o){function u(n,e){var r=i(n,e);t(n=r[0],e=r[1])&&o.point(n,e)}function a(t,n){var e=i(t,n);_.point(e[0],e[1])}function c(){b.point=a,_.lineStart()}function s(){b.point=u,_.lineEnd()}function f(t,n){v.push([t,n]);var e=i(t,n);m.point(e[0],e[1])}function l(){m.lineStart(),v=[]}function h(){f(v[0][0],v[0][1]),m.lineEnd();var t,n,e,r,i=m.clean(),u=g.result(),a=u.length;if(v.pop(),p.push(v),v=null,a)if(1&i){if(e=u[0],(n=e.length-1)>0){for(x||(o.polygonStart(),x=!0),o.lineStart(),t=0;t<n;++t)o.point((r=e[t])[0],r[1]);o.lineEnd()}}else a>1&&2&i&&u.push(u.pop().concat(u.shift())),d.push(u.filter(Hc))}var p,d,v,_=n(o),y=i.invert(r[0],r[1]),g=vb(),m=n(g),x=!1,b={point:u,lineStart:c,lineEnd:s,polygonStart:function(){b.point=f,b.lineStart=l,b.lineEnd=h,d=[],p=[]},polygonEnd:function(){b.point=u,b.lineStart=c,b.lineEnd=s,d=Zs(d);var t=Jb(p,y);d.length?(x||(o.polygonStart(),x=!0),gb(d,Xc,t,e,o)):t&&(x||(o.polygonStart(),x=!0),o.lineStart(),e(null,null,1,o),o.lineEnd()),x&&(o.polygonEnd(),x=!1),d=p=null},sphere:function(){o.polygonStart(),o.lineStart(),e(null,null,1,o),o.lineEnd(),o.polygonEnd()}};return b}},Kb=Qb(function(){return!0},Vc,$c,[-Tx,-Nx]),tw=function(t,n){function e(e,r,i,o){_c(o,t,n,i,e,r)}function r(t,n){return qx(t)*qx(n)>a}function i(t){var n,e,i,a,f;return{lineStart:function(){a=i=!1,f=1},point:function(l,h){var p,d=[l,h],v=r(l,h),_=c?v?0:u(l,h):v?u(l+(l<0?Tx:-Tx),h):0;if(!n&&(a=i=v)&&t.lineStart(),v!==i&&(p=o(n,d),(yb(n,p)||yb(d,p))&&(d[0]+=wx,d[1]+=wx,v=r(d[0],d[1]))),v!==i)f=0,v?(t.lineStart(),p=o(d,n),t.point(p[0],p[1])):(p=o(n,d),t.point(p[0],p[1]),t.lineEnd()),n=p;else if(s&&n&&c^v){var y;_&e||!(y=o(d,n,!0))||(f=0,c?(t.lineStart(),t.point(y[0][0],y[0][1]),t.point(y[1][0],y[1][1]),t.lineEnd()):(t.point(y[1][0],y[1][1]),t.lineEnd(),t.lineStart(),t.point(y[0][0],y[0][1])))}!v||n&&yb(n,d)||t.point(d[0],d[1]),n=d,i=v,e=_},lineEnd:function(){i&&t.lineEnd(),n=null},clean:function(){return f|(a&&i)<<1}}}function o(t,n,e){var r=Fa(t),i=Fa(n),o=[1,0,0],u=Ya(r,i),c=Ia(u,u),s=u[0],f=c-s*s;if(!f)return!e&&t;var l=a*c/f,h=-a*s/f,p=Ya(o,u),d=ja(o,l),v=ja(u,h);Ba(d,v);var _=p,y=Ia(d,_),g=Ia(_,_),m=y*y-g*(Ia(d,d)-1);if(!(m<0)){var x=Ix(m),b=ja(_,(-y-x)/g);if(Ba(b,d),b=Oa(b),!e)return b;var w,M=t[0],T=n[0],N=t[1],k=n[1];T<M&&(w=M,M=T,T=w);var S=T-M,A=Cx(S-Tx)<wx,E=A||S<wx;if(!A&&k<N&&(w=N,N=k,k=w),E?A?N+k>0^b[1]<(Cx(b[0]-M)<wx?N:k):N<=b[1]&&b[1]<=k:S>Tx^(M<=b[0]&&b[0]<=T)){var C=ja(_,(-y+x)/g);return Ba(C,d),[b,Oa(C)]}}}function u(n,e){var r=c?t:Tx-t,i=0;return n<-r?i|=1:n>r&&(i|=2),e<-r?i|=4:e>r&&(i|=8),i}var a=qx(t),c=a>0,s=Cx(a)>wx;return Qb(r,i,e,c?[0,-t]:[-Tx,t-Tx])},nw=function(t){return{stream:Zc(t)}};Gc.prototype={point:function(t,n){this.stream.point(t,n)},sphere:function(){this.stream.sphere()},lineStart:function(){this.stream.lineStart()},lineEnd:function(){this.stream.lineEnd()},polygonStart:function(){this.stream.polygonStart()},polygonEnd:function(){this.stream.polygonEnd()}};var ew=16,rw=qx(30*Ex),iw=function(t,n){return+n?ns(t,n):ts(t)},ow=Zc({point:function(t,n){this.stream.point(t*Ex,n*Ex)}}),uw=function(){return is(us).scale(155.424).center([0,33.6442])},aw=function(){return uw().parallels([29.5,45.5]).scale(1070).translate([480,250]).rotate([96,0]).center([-.6,38.7])},cw=function(){function t(t){var n=t[0],e=t[1];return a=null,i.point(n,e),a||(o.point(n,e),a)||(u.point(n,e),a)}function n(){return e=r=null,t}var e,r,i,o,u,a,c=aw(),s=uw().rotate([154,0]).center([-2,58.5]).parallels([55,65]),f=uw().rotate([157,0]).center([-3,19.9]).parallels([8,18]),l={point:function(t,n){a=[t,n]}};return t.invert=function(t){var n=c.scale(),e=c.translate(),r=(t[0]-e[0])/n,i=(t[1]-e[1])/n;return(i>=.12&&i<.234&&r>=-.425&&r<-.214?s:i>=.166&&i<.234&&r>=-.214&&r<-.115?f:c).invert(t)},t.stream=function(t){return e&&r===t?e:e=as([c.stream(r=t),s.stream(t),f.stream(t)])},t.precision=function(t){return arguments.length?(c.precision(t),s.precision(t),f.precision(t),n()):c.precision()},t.scale=function(n){return arguments.length?(c.scale(n),s.scale(.35*n),f.scale(n),t.translate(c.translate())):c.scale()},t.translate=function(t){if(!arguments.length)return c.translate();var e=c.scale(),r=+t[0],a=+t[1];return i=c.translate(t).clipExtent([[r-.455*e,a-.238*e],[r+.455*e,a+.238*e]]).stream(l),o=s.translate([r-.307*e,a+.201*e]).clipExtent([[r-.425*e+wx,a+.12*e+wx],[r-.214*e-wx,a+.234*e-wx]]).stream(l),u=f.translate([r-.205*e,a+.212*e]).clipExtent([[r-.214*e+wx,a+.166*e+wx],[r-.115*e-wx,a+.234*e-wx]]).stream(l),n()},t.fitExtent=Kc(t),t.fitSize=Qc(t),t.scale(1070)},sw=cs(function(t){return Ix(2/(1+t))});sw.invert=ss(function(t){return 2*Aa(t/2)});var fw=function(){return es(sw).scale(124.75).clipAngle(179.999)},lw=cs(function(t){return(t=Sa(t))&&t/Ox(t)});lw.invert=ss(function(t){return t});var hw=function(){return es(lw).scale(79.4188).clipAngle(179.999)};fs.invert=function(t,n){return[t,2*zx(Rx(n))-Nx]};var pw=function(){return ls(fs).scale(961/Sx)},dw=function(){return is(ps).scale(109.5).parallels([30,30])};ds.invert=ds;var vw=function(){return es(ds).scale(152.63)},_w=function(){return is(vs).scale(131.154).center([0,13.9389])};_s.invert=ss(zx);var yw=function(){return es(_s).scale(144.049).clipAngle(60)};ys.invert=ss(Aa);var gw=function(){return es(ys).scale(249.5).clipAngle(90+wx)};gs.invert=ss(function(t){return 2*zx(t)});var mw=function(){return es(gs).scale(250).clipAngle(142)};ms.invert=function(t,n){return[-n,2*zx(Rx(t))-Nx]};var xw=function(){var t=ls(ms),n=t.center,e=t.rotate;return t.center=function(t){return arguments.length?n([-t[1],t[0]]):(t=n(),[t[1],-t[0]])},t.rotate=function(t){return arguments.length?e([t[0],t[1],t.length>2?t[2]+90:90]):(t=e(),[t[0],t[1],t[2]-90])},e([0,0,90]).scale(159.155)};t.version=xs,t.bisect=Ts,t.bisectRight=Ts,t.bisectLeft=Ns,t.ascending=bs,t.bisector=ws,t.descending=ks,t.deviation=Es,t.extent=Cs,t.histogram=Bs,t.thresholdFreedmanDiaconis=Hs,t.thresholdScott=Xs,t.thresholdSturges=Ys,t.max=Vs,t.mean=Ws,t.median=$s,t.merge=Zs,t.min=Gs,t.pairs=Js,t.permute=Qs,t.quantile=js,t.range=Us,t.scan=Ks,t.shuffle=tf,t.sum=nf,t.ticks=Is,t.tickStep=e,t.transpose=ef,t.variance=As,t.zip=rf,t.entries=ff,t.keys=cf,t.values=sf,t.map=o,t.set=l,t.nest=uf,t.randomUniform=lf,t.randomNormal=hf,t.randomLogNormal=pf,t.randomBates=vf,t.randomIrwinHall=df,t.randomExponential=_f,t.easeLinear=h,t.easeQuad=v,t.easeQuadIn=p,t.easeQuadOut=d,t.easeQuadInOut=v,t.easeCubic=g,t.easeCubicIn=_,t.easeCubicOut=y,t.easeCubicInOut=g,t.easePoly=xf,t.easePolyIn=gf,t.easePolyOut=mf,t.easePolyInOut=xf,t.easeSin=b,t.easeSinIn=m,t.easeSinOut=x,t.easeSinInOut=b,t.easeExp=T,t.easeExpIn=w,t.easeExpOut=M,t.easeExpInOut=T,t.easeCircle=S,t.easeCircleIn=N,t.easeCircleOut=k,t.easeCircleInOut=S,t.easeBounce=E,t.easeBounceIn=A,t.easeBounceOut=E,t.easeBounceInOut=C,t.easeBack=Uf,t.easeBackIn=Lf,t.easeBackOut=Rf,t.easeBackInOut=Uf,t.easeElastic=Yf,t.easeElasticIn=If,t.easeElasticOut=Yf,t.easeElasticInOut=Bf,t.polygonArea=jf,t.polygonCentroid=Hf,t.polygonHull=Vf,t.polygonContains=Wf,t.polygonLength=$f,t.path=L,t.quadtree=I,t.queue=Z,t.arc=xl,t.area=Ml,t.line=wl,t.pie=kl,t.radialArea=El,t.radialLine=Al,t.symbol=Zl,t.symbols=$l,t.symbolCircle=Cl,t.symbolCross=zl,t.symbolDiamond=Ll,t.symbolSquare=Il,t.symbolStar=Fl,t.symbolTriangle=Bl,t.symbolWye=Wl,t.curveBasisClosed=Ql,t.curveBasisOpen=Kl,t.curveBasis=Jl,t.curveBundle=th,t.curveCardinalClosed=eh,t.curveCardinalOpen=rh,t.curveCardinal=nh,t.curveCatmullRomClosed=oh,t.curveCatmullRomOpen=uh,t.curveCatmullRom=ih,t.curveLinearClosed=ah,t.curveLinear=bl,t.curveMonotoneX=zt,t.curveMonotoneY=Pt,t.curveNatural=ch,t.curveStep=sh,t.curveStepAfter=Dt,t.curveStepBefore=Ut,t.stack=ph,t.stackOffsetExpand=dh,t.stackOffsetNone=lh,t.stackOffsetSilhouette=vh,t.stackOffsetWiggle=_h,t.stackOrderAscending=yh,t.stackOrderDescending=gh,t.stackOrderInsideOut=mh,t.stackOrderNone=hh,t.stackOrderReverse=xh,t.color=Bt,t.rgb=Vt,t.hsl=Gt,t.lab=tn,t.hcl=cn,t.cubehelix=ln,t.interpolate=dp,t.interpolateArray=ap,t.interpolateDate=cp,t.interpolateNumber=sp,t.interpolateObject=fp,t.interpolateRound=vp,t.interpolateString=pp,t.interpolateTransformCss=mp,t.interpolateTransformSvg=xp,t.interpolateZoom=Np,t.interpolateRgb=ip,t.interpolateRgbBasis=op,t.interpolateRgbBasisClosed=up,t.interpolateHsl=kp,t.interpolateHslLong=Sp,t.interpolateLab=En,t.interpolateHcl=Ap,t.interpolateHclLong=Ep,t.interpolateCubehelix=Cp,t.interpolateCubehelixLong=zp,t.interpolateBasis=np,t.interpolateBasisClosed=ep,t.quantize=Pp,t.dispatch=Pn,t.dsvFormat=Up,t.csvParse=Op,t.csvParseRows=Fp,t.csvFormat=Ip,t.csvFormatRows=Yp,t.tsvParse=jp,t.tsvParseRows=Hp,t.tsvFormat=Xp,t.tsvFormatRows=Vp,t.request=Wp,t.html=Zp,t.json=Gp,t.text=Jp,t.xml=Qp,t.csv=td,t.tsv=nd,t.now=jn,t.timer=Vn,t.timerFlush=Wn,t.timeout=ld,t.interval=hd,t.timeInterval=Qn,t.timeMillisecond=vd,t.timeMilliseconds=_d,t.timeSecond=wd,t.timeSeconds=Md,t.timeMinute=Td,t.timeMinutes=Nd,t.timeHour=kd,t.timeHours=Sd,t.timeDay=Ad,t.timeDays=Ed,t.timeWeek=Cd,t.timeWeeks=Dd,t.timeSunday=Cd,t.timeSundays=Dd,t.timeMonday=zd,t.timeMondays=Od,t.timeTuesday=Pd,t.timeTuesdays=Fd;t.timeWednesday=qd;t.timeWednesdays=Id,t.timeThursday=Ld,t.timeThursdays=Yd,t.timeFriday=Rd,t.timeFridays=Bd,t.timeSaturday=Ud,t.timeSaturdays=jd,t.timeMonth=Hd,t.timeMonths=Xd,t.timeYear=Vd,t.timeYears=Wd,t.utcMillisecond=vd,t.utcMilliseconds=_d,t.utcSecond=wd,t.utcSeconds=Md,t.utcMinute=$d,t.utcMinutes=Zd,t.utcHour=Gd,t.utcHours=Jd,t.utcDay=Qd,t.utcDays=Kd,t.utcWeek=tv,t.utcWeeks=av,t.utcSunday=tv,t.utcSundays=av,t.utcMonday=nv,t.utcMondays=cv,t.utcTuesday=ev,t.utcTuesdays=sv,t.utcWednesday=rv,t.utcWednesdays=fv,t.utcThursday=iv,t.utcThursdays=lv,t.utcFriday=ov,t.utcFridays=hv,t.utcSaturday=uv,t.utcSaturdays=pv,t.utcMonth=dv,t.utcMonths=vv,t.utcYear=_v,t.utcYears=gv,t.formatLocale=Cv,t.formatDefaultLocale=re,t.formatSpecifier=Sv,t.precisionFixed=Pv,t.precisionPrefix=qv,t.precisionRound=Lv,t.isoFormat=Iv,t.isoParse=Yv,t.timeFormatLocale=ae,t.timeFormatDefaultLocale=nr,t.scaleBand=or,t.scalePoint=ar,t.scaleIdentity=yr,t.scaleLinear=_r,t.scaleLog=Tr,t.scaleOrdinal=ir,t.scaleImplicit=Xv,t.scalePow=kr,t.scaleSqrt=Sr,t.scaleQuantile=Ar,t.scaleQuantize=Er,t.scaleThreshold=Cr,t.scaleTime=i_,t.scaleUtc=o_,t.schemeCategory10=a_,t.schemeCategory20b=c_,t.schemeCategory20c=s_,t.schemeCategory20=f_,t.scaleSequential=Rr,t.interpolateCubehelixDefault=l_,t.interpolateRainbow=v_,t.interpolateWarm=h_,t.interpolateCool=p_,t.interpolateViridis=__,t.interpolateMagma=y_,t.interpolateInferno=g_,t.interpolatePlasma=m_,t.creator=M_,t.customEvent=Xr,t.local=Or,t.matcher=A_,t.mouse=L_,t.namespace=w_,t.namespaces=b_,t.select=_y,t.selectAll=yy,t.selection=Pi,t.selector=R_,t.selectorAll=D_,t.touch=gy,t.touches=my,t.window=ey,t.active=eg,t.interrupt=Cy,t.transition=fo,t.axisTop=mo,t.axisRight=xo,t.axisBottom=bo,t.axisLeft=wo,t.cluster=fg,t.hierarchy=zo,t.pack=Ng,t.packSiblings=Mg,t.packEnclose=wg,t.partition=Ag,t.stratify=Pg,t.tree=qg,t.treemap=Dg,t.treemapBinary=Og,t.treemapDice=Sg,t.treemapSlice=Lg,t.treemapSliceDice=Fg,t.treemapSquarify=Ug,t.treemapResquarify=Ig,t.forceCenter=Yg,t.forceCollide=Hg,t.forceLink=Xg,t.forceManyBody=Zg,t.forceSimulation=$g,t.forceX=Gg,t.forceY=Jg,t.drag=nm,t.dragDisable=Kg,t.dragEnable=mu,t.voronoi=hm,t.zoom=_m,t.zoomIdentity=dm,t.zoomTransform=ia,t.brush=Pm,t.brushX=_a,t.brushY=ya,t.brushSelection=va,t.chord=Fm,t.ribbon=Bm,t.geoAlbers=aw,t.geoAlbersUsa=cw,t.geoArea=$x,t.geoAzimuthalEqualArea=fw,t.geoAzimuthalEqualAreaRaw=sw,t.geoAzimuthalEquidistant=hw,t.geoAzimuthalEquidistantRaw=lw,t.geoBounds=Jx,t.geoCentroid=Kx,t.geoCircle=db,t.geoClipExtent=bb,t.geoConicConformal=dw,t.geoConicConformalRaw=ps,t.geoConicEqualArea=uw,t.geoConicEqualAreaRaw=us,t.geoConicEquidistant=_w,t.geoConicEquidistantRaw=vs,t.geoDistance=Sb,t.geoEquirectangular=vw,t.geoEquirectangularRaw=ds,t.geoGnomonic=yw,t.geoGnomonicRaw=_s,t.geoGraticule=Ab,t.geoInterpolate=Eb,t.geoLength=Tb,t.geoMercator=pw,t.geoMercatorRaw=fs,t.geoOrthographic=gw,t.geoOrthographicRaw=ys,t.geoPath=Zb,t.geoProjection=es,t.geoProjectionMutator=rs,t.geoRotation=pb,t.geoStereographic=mw,t.geoStereographicRaw=gs,t.geoStream=Hx,t.geoTransform=nw,t.geoTransverseMercator=xw,t.geoTransverseMercatorRaw=ms,Object.defineProperty(t,"__esModule",{value:!0})});
/*
 TechanJS v0.8.0
 (c) 2014 - 2016 Andre Dumas | https://github.com/andredumas/techan.js
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.techan=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";b.exports="0.8.0"},{}],2:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.r(b)}function b(){return a.d=c,a.adx=d,a.plusDi=e,a.minusDi=f,a}var c=function(a){return a.date},d=function(a){return a.adx},e=function(a){return a.plusDi},f=function(a){return a.minusDi};return a.date=function(a){return arguments.length?(c=a,b()):c},a.adx=function(a){return arguments.length?(d=a,b()):d},a.plusDi=function(a){return arguments.length?(e=a,b()):e},a.minusDi=function(a){return arguments.length?(f=a,b()):f},b()}},{}],3:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.r(b)}function b(){return a.d=c,a.up=d,a.down=e,a.oscillator=f,a.ob=g,a.os=h,a.m=i,a}var c=function(a){return a.date},d=function(a){return a.up},e=function(a){return a.down},f=function(a){return a.oscillator},g=function(a){return a.overbought},h=function(a){return a.oversold},i=function(a){return a.middle};return a.date=function(a){return arguments.length?(c=a,b()):c},a.up=function(a){return arguments.length?(d=a,b()):d},a.down=function(a){return arguments.length?(e=a,b()):e},a.oscillator=function(a){return arguments.length?(f=a,b()):f},a.overbought=function(a){return arguments.length?(g=a,b()):g},a.oversold=function(a){return arguments.length?(h=a,b()):h},a.middle=function(a){return arguments.length?(i=a,b()):i},b()}},{}],4:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.up(b)}function b(){return a.d=c,a.up=d,a.dn=e,a}var c=function(a){return a.date},d=function(a){return a.up},e=function(a){return a.down};return a.date=function(a){return arguments.length?(c=a,b()):c},a.up=function(a){return arguments.length?(d=a,b()):d},a.down=function(a){return arguments.length?(e=a,b()):e},b()}},{}],5:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.r(b)}function b(){return a.d=c,a.middle=d,a.upper=e,a.lower=f,a}var c=function(a){return a.date},d=function(a){return a.middleBand},e=function(a){return a.upperBand},f=function(a){return a.lowerBand};return a.date=function(a){return arguments.length?(c=a,b()):c},a.middle=function(a){return arguments.length?(d=a,b()):d},a.upper=function(a){return arguments.length?(e=a,b()):e},a.lower=function(a){return arguments.length?(f=a,b()):f},b()}},{}],6:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.xv(b)}function b(){return a.xv=c,a.yv=d,a}var c=function(b,c){return arguments.length<2?b.x:(b.x=c,a)},d=function(b,c){return arguments.length<2?b.y:(b.y=c,a)};return a.x=function(a){return arguments.length?(c=a,b()):c},a.y=function(a){return arguments.length?(d=a,b()):d},b()}},{}],7:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.ts(b)}function b(){return a.d=c,a.ts=d,a.ks=e,a.sa=f,a.sb=g,a.c=h,a.pts=i,a.pks=j,a.pssb=k,a}var c=function(a){return a.date},d=function(a){return a.tenkanSen},e=function(a){return a.kijunSen},f=function(a){return a.senkouSpanA},g=function(a){return a.senkouSpanB},h=function(a){return a.chikouSpan},i=function(a){return a.parameters.tenkanSen},j=function(a){return a.parameters.kijunSen},k=function(a){return a.parameters.senkouSpanB};return a.date=function(a){return arguments.length?(c=a,b()):c},a.tenkanSen=function(a){return arguments.length?(d=a,b()):d},a.kijunSen=function(a){return arguments.length?(e=a,b()):e},a.senkouSpanA=function(a){return arguments.length?(f=a,b()):f},a.senkouSpanB=function(a){return arguments.length?(g=a,b()):g},a.chikouSpan=function(a){return arguments.length?(h=a,b()):h},a.ptenanSen=function(a){return arguments.length?(i=a,b()):i},a.pkijunSen=function(a){return arguments.length?(j=a,b()):j},a.psenkouSpanB=function(a){return arguments.length?(k=a,b()):k},b()}},{}],8:[function(a,b,c){"use strict";b.exports=function(){return{atrtrailingstop:a("./atrtrailingstop"),crosshair:a("./crosshair"),ichimoku:a("./ichimoku"),macd:a("./macd"),ohlc:a("./ohlc"),rsi:a("./rsi"),trendline:a("./trendline"),value:a("./value"),volume:a("./volume"),tick:a("./tick"),trade:a("./trade"),adx:a("./adx"),aroon:a("./aroon"),stochastic:a("./stochastic"),supstance:a("./supstance"),williams:a("./williams"),bollinger:a("./bollinger")}}},{"./adx":2,"./aroon":3,"./atrtrailingstop":4,"./bollinger":5,"./crosshair":6,"./ichimoku":7,"./macd":9,"./ohlc":10,"./rsi":11,"./stochastic":12,"./supstance":13,"./tick":14,"./trade":15,"./trendline":16,"./value":17,"./volume":18,"./williams":19}],9:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.m(b)}function b(){return a.d=c,a.m=d,a.s=f,a.dif=g,a.z=e,a}var c=function(a){return a.date},d=function(a){return a.macd},e=function(a){return a.zero},f=function(a){return a.signal},g=function(a){return a.difference};return a.date=function(a){return arguments.length?(c=a,b()):c},a.macd=function(a){return arguments.length?(d=a,b()):d},a.signal=function(a){return arguments.length?(f=a,b()):f},a.difference=function(a){return arguments.length?(g=a,b()):g},b()}},{}],10:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.c(b)}function b(){return a.d=c,a.o=d,a.h=e,a.l=f,a.c=g,a.v=h,a}var c=function(a){return a.date},d=function(a){return a.open},e=function(a){return a.high},f=function(a){return a.low},g=function(a){return a.close},h=function(a){return a.volume};return a.date=function(a){return arguments.length?(c=a,b()):c},a.open=function(a){return arguments.length?(d=a,b()):d},a.high=function(a){return arguments.length?(e=a,b()):e},a.low=function(a){return arguments.length?(f=a,b()):f},a.close=function(a){return arguments.length?(g=a,b()):g},a.volume=function(a){return arguments.length?(h=a,b()):h},b()}},{}],11:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.r(b)}function b(){return a.d=c,a.r=d,a.ob=e,a.os=f,a.m=g,a}var c=function(a){return a.date},d=function(a){return a.rsi},e=function(a){return a.overbought},f=function(a){return a.oversold},g=function(a){return a.middle};return a.date=function(a){return arguments.length?(c=a,b()):c},a.rsi=function(a){return arguments.length?(d=a,b()):d},a.overbought=function(a){return arguments.length?(e=a,b()):e},a.oversold=function(a){return arguments.length?(f=a,b()):f},a.middle=function(a){return arguments.length?(g=a,b()):g},b()}},{}],12:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.r(b)}function b(){return a.d=c,a.k=d,a.sd=e,a.ob=f,a.os=g,a.m=h,a}var c=function(a){return a.date},d=function(a){return a.stochasticK},e=function(a){return a.stochasticD},f=function(a){return a.overbought},g=function(a){return a.oversold},h=function(a){return a.middle};return a.date=function(a){return arguments.length?(c=a,b()):c},a.stochasticK=function(a){return arguments.length?(d=a,b()):d},a.stochasticD=function(a){return arguments.length?(e=a,b()):e},a.overbought=function(a){return arguments.length?(f=a,b()):f},a.oversold=function(a){return arguments.length?(g=a,b()):g},a.middle=function(a){return arguments.length?(h=a,b()):h},b()}},{}],13:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.v(b)}function b(){return a.s=c,a.e=d,a.v=e,a}var c=function(a){return a.start},d=function(a){return a.end},e=function(b,c){return arguments.length<2?b.value:(b.value=c,a)};return a.start=function(a){return arguments.length?(c=a,b()):c},a.end=function(a){return arguments.length?(d=a,b()):d},a.value=function(a){return arguments.length?(e=a,b()):e},b()}},{}],14:[function(a,b,c){"use strict";b.exports=function(){function a(a){b()}function b(){return a.d=c,a.h=d,a.l=e,a.s=f,a}var c=function(a){return a.date},d=function(a){return a.high},e=function(a){return a.low},f=function(a){return a.spread};return a.date=function(a){return arguments.length?(c=a,b()):c},a.high=function(a){return arguments.length?(d=a,b()):d},a.low=function(a){return arguments.length?(e=a,b()):e},a.spread=function(a){return arguments.length?(f=a,b()):f},b()}},{}],15:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.p(b)}function b(){return a.d=c,a.t=d,a.p=e,a}var c=function(a){return a.date},d=function(a){return a.type},e=function(a){return a.price};return a.date=function(a){return arguments.length?(c=a,b()):c},a.type=function(a){return arguments.length?(d=a,b()):d},a.price=function(a){return arguments.length?(e=a,b()):e},b()}},{}],16:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.sv(b)}function b(){return a.sd=c,a.sv=d,a.ed=e,a.ev=f,a}var c=function(a,b){return arguments.length<2?a.start.date:void(a.start.date=b)},d=function(a,b){return arguments.length<2?a.start.value:void(a.start.value=b)},e=function(a,b){return arguments.length<2?a.end.date:void(a.end.date=b)},f=function(a,b){return arguments.length<2?a.end.value:void(a.end.value=b)};return a.startDate=function(a){return arguments.length?(c=a,b()):c},a.startValue=function(a){return arguments.length?(d=a,b()):d},a.endDate=function(a){return arguments.length?(e=a,b()):e},a.endValue=function(a){return arguments.length?(f=a,b()):f},b()}},{}],17:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.v(b)}function b(){return a.d=c,a.v=d,a.z=e,a}var c=function(a){return a.date},d=function(b,c){return arguments.length<2?b.value:(b.value=c,a)},e=function(a){return a.zero};return a.date=function(a){return arguments.length?(c=a,b()):c},a.value=function(a){return arguments.length?(d=a,b()):d},a.zero=function(a){return arguments.length?(e=a,b()):e},b()}},{}],18:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.v(b)}function b(){return a.d=c,a.v=d,a}var c=function(a){return a.date},d=function(a){return a.volume};return a.date=function(a){return arguments.length?(c=a,b()):c},a.volume=function(a){return arguments.length?(d=a,b()):d},b()}},{}],19:[function(a,b,c){"use strict";b.exports=function(){function a(b){return a.r(b)}function b(){return a.d=c,a.w=d,a}var c=function(a){return a.date},d=function(a){return a.williams};return a.date=function(a){return arguments.length?(c=a,b()):c},a.williams=function(a){return arguments.length?(d=a,b()):d},b()}},{}],20:[function(a,b,c){"use strict";function d(a,b,c,d){return c?{date:a,adx:b,plusDi:c,minusDi:d}:{date:a,adx:null,plusDi:null,minusDi:null}}b.exports=function(a,b,c,e){return function(){function f(b){var c=e().accessor(f.accessor()).period(h).init(),i=e().accessor(f.accessor()).period(h).init(),j=e().accessor(f.accessor()).period(h).init(),k=e().accessor(f.accessor()).period(h).init();return h=parseInt(h),b.map(function(e,f){if(f<1)return d(g.accessor.d(e));var l=g.accessor.h(b[f])-g.accessor.h(b[f-1]),m=g.accessor.l(b[f-1])-g.accessor.l(b[f]),n=0;l>m&&l>0&&(n=l);var o=0;m>l&&m>0&&(o=m);var p=a([g.accessor.h(e)-g.accessor.l(e),Math.abs(g.accessor.h(e)-g.accessor.c(b[f-1])),Math.abs(g.accessor.l(e)-g.accessor.c(b[f-1]))]),q=c.average(n),r=i.average(o),s=j.average(p);if(f>h){var t=100*q/s,u=100*r/s,v=0;t-u!==0&&(v=Math.abs((t-u)/(t+u)));var w=100*k.average(v);return f>=2*h?d(g.accessor.d(e),w,t,u):d(g.accessor.d(e))}return d(g.accessor.d(e))}).filter(function(a){return a.adx})}var g={},h=14;return f.period=function(a){return arguments.length?(h=a,f):h},b(f,g).accessor(c()),f}}},{}],21:[function(a,b,c){"use strict";function d(a,b,c,d,e,f,g){return b?{date:a,up:b,down:c,oscillator:d,middle:e,overbought:f,oversold:g}:{date:a,up:null,down:null,oscillator:null,middle:null,overbought:null,oversold:null}}b.exports=function(a,b){return function(){function c(a){return a.map(function(b,c){if(c>=f-1){for(var j=0,k=0,l=1e4,m=0,n=0;n<f;n++)e.accessor.h(a[c-n])>j&&(j=e.accessor.h(a[c-n]),k=n),e.accessor.l(a[c-n])<l&&(l=e.accessor.l(a[c-n]),m=n);var o=(f-k)/f*100,p=(f-m)/f*100,q=o-p;return d(e.accessor.d(b),o,p,q,h,g,i)}return d(e.accessor.d(b))}).filter(function(a){return a.up})}var e={},f=20,g=70,h=0,i=30;return c.period=function(a){return arguments.length?(f=a,c):f},c.overbought=function(a){return arguments.length?(g=a,c):g},c.middle=function(a){return arguments.length?(h=a,c):h},c.oversold=function(a){return arguments.length?(i=a,c):i},a(c,e).accessor(b()),c}}},{}],22:[function(a,b,c){"use strict";function d(a,b){return b?{date:a,value:b}:{date:a,value:null}}b.exports=function(a,b,c){return function(){function e(a){return e.init(),a.map(function(a,b){var c=e.atr(a);return b>=f.period?d(f.accessor.d(a),c):d(f.accessor.d(a))}).filter(function(a){return null!==a.value})}var f={},g=c(),h=null,i=0,j=0;return e.init=function(){return g.accessor(e.accessor()).period(f.period).init(),h=null,i=0,j=0,e},e.atr=function(a){var b=null===h?f.accessor.h(a)-f.accessor.l(a):Math.max(f.accessor.h(a)-f.accessor.l(a),Math.abs(f.accessor.h(a)-f.accessor.c(h)),Math.abs(f.accessor.l(a)-f.accessor.c(h)));return h=a,i=j++<=f.period?g.average(b):(i*(f.period-1)+b)/f.period},a(e,f).accessor(b()).period(14),e}}},{}],23:[function(a,b,c){"use strict";b.exports=function(a,b,c){return function(){function d(a){return g.accessor(e.accessor).period(e.period).init(),a.map(function(a,b){var c=e.accessor.c(a),d=g.atr(a)*f;return b>=e.period?{date:e.accessor.d(a),close:c,up:c-d,down:c+d}:{date:e.accessor.d(a),up:null,down:null}}).filter(function(a){return null!==a.up&&null!==a.down}).reduce(function(a,b,c){var d=a[c-1],e=0===c?b.up:null,f=null;return d&&null!==d.up&&(b.close>d.up?e=Math.max(b.up,d.up):f=b.down),d&&null!==d.down&&(b.close<d.down?f=Math.min(b.down,d.down):e=b.up),a.push({date:b.date,up:e,down:f}),a},[])}var e={},f=3,g=c();return d.multiplier=function(a){return arguments.length?(f=a,d):f},a(d,e).accessor(b()).period(14),d}}},{}],24:[function(a,b,c){"use strict";function d(a,b,c,d){return b?{date:a,middleBand:b,upperBand:c,lowerBand:d}:{date:a,middleBand:null,upperBand:null,lowerBand:null}}b.exports=function(a,b,c){return function(){function e(a){var b,j=c().accessor(e.accessor()).period(h).init();return a.map(function(c,e){var k=j.average(g.accessor(c));if(e>=h){var l=0;for(b=0;b<h;b++)l+=Math.pow(g.accessor.c(a[e-b])-k,2);f=Math.sqrt(l/h);var m=k+i*f,n=k-i*f;return d(g.accessor.d(c),k,m,n)}return d(g.accessor.d(c))}).filter(function(a){return a.middleBand})}var f,g={},h=20,i=2;return e.period=function(a){return arguments.length?(h=a,e):h},e.sdMultiplication=function(a){return arguments.length?(i=a,e):i},a(e,g).accessor(b()),e}}},{}],25:[function(a,b,c){"use strict";b.exports=function(a,b,c){return function(){function d(a){return d.init(),a.map(e).filter(function(a){return null!==a.value})}function e(a,b){var c=d.average(j.accessor(a));return b+1<j.period&&(c=null),{date:j.accessor.d(a),value:c}}var f,g,h,i,j={};return d.init=function(){return f=null,g=c(j.period),h=0,i=0,d},d.average=function(a){return i<j.period?f=(h+=a)/++i:f+=g*(a-f)},a(d,j).accessor(b()).period(10),d}}},{}],26:[function(a,b,c){"use strict";b.exports=function(a,b,c,d){return function(){function e(a){var b;return a.map(function(a){var e={date:f.accessor.d(a),open:(void 0===b?f.accessor.o(a)+f.accessor.c(a):b.open+b.close)/2,close:(f.accessor.o(a)+f.accessor.h(a)+f.accessor.l(a)+f.accessor.c(a))/4};return e.high=d([e.open,e.close,f.accessor.h(a)]),e.low=c([e.open,e.close,f.accessor.l(a)]),void 0!==f.accessor.v&&void 0!==f.accessor.v(a)&&(e.volume=f.accessor.v(a)),b=e})}var f={};return a(e,f).accessor(b()),e}}},{}],27:[function(a,b,c){"use strict";function d(a,b,c){return{parameters:a,date:b,chikouSpan:c,tenkanSen:null,kijunSen:null,senkouSpanA:null,senkouSpanB:null}}function e(a,b){return null!==a&&null!==b?f(a,b):null}function f(a,b){return(a+b)/2}b.exports=function(a,b){return function(){function c(a){for(var b={tenkanSen:i,kijunSen:j,senkouSpanB:k},c=new Array(a.length),d=c.length-1;d>=0;d--)c[d]=g(b,a,d);return c}function g(a,b,c){for(var g=b[c],i=h.accessor.l(g),j=h.accessor.h(g),k=d(a,h.accessor.d(g),h.accessor.c(g)),l=0,m=l+1;l<a.senkouSpanB&&c-l>=0;l++,m=l+1)g=b[c-l],i=Math.min(i,h.accessor.l(g)),j=Math.max(j,h.accessor.h(g)),k.tenkanSen=m===a.tenkanSen?f(i,j):k.tenkanSen,k.kijunSen=m===a.kijunSen?f(i,j):k.kijunSen,k.senkouSpanB=m===a.senkouSpanB?f(i,j):k.senkouSpanB;return k.senkouSpanA=e(k.tenkanSen,k.kijunSen),k}var h={},i=9,j=26,k=52;return c.tenkanSen=function(a){return arguments.length?(i=a,c):i},c.kijunSen=function(a){return arguments.length?(j=a,c):j},c.senkouSpanB=function(a){return arguments.length?(k=a,c):k},a(c,h).accessor(b()),c}}},{}],28:[function(a,b,c){"use strict";function d(a){return 2/(a+1)}function e(a){return 1/a}b.exports=function(b){var c=a("./indicatormixin")(),f=a("../accessor")(),g=a("./ema"),h=g(c,f.ohlc,d),i=a("./sma")(c,f.ohlc),j=a("./atr")(c,f.ohlc,i),k=a("./vwap")(c,f.ohlc);return{atr:j,atrtrailingstop:a("./atrtrailingstop")(c,f.ohlc,j),ema:h,heikinashi:a("./heikinashi")(c,f.ohlc,b.min,b.max),ichimoku:a("./ichimoku")(c,f.ohlc),macd:a("./macd")(c,f.ohlc,h),rsi:a("./rsi")(c,f.ohlc,h),sma:i,wilderma:g(c,f.ohlc,e),aroon:a("./aroon")(c,f.ohlc),stochastic:a("./stochastic")(c,f.ohlc,h),williams:a("./williams")(c,f.ohlc,h),adx:a("./adx")(b.max,c,f.ohlc,h),bollinger:a("./bollinger")(c,f.ohlc,i),vwap:k}}},{"../accessor":8,"./adx":20,"./aroon":21,"./atr":22,"./atrtrailingstop":23,"./bollinger":24,"./ema":25,"./heikinashi":26,"./ichimoku":27,"./indicatormixin":29,"./macd":30,"./rsi":31,"./sma":32,"./stochastic":33,"./vwap":34,"./williams":35}],29:[function(a,b,c){"use strict";b.exports=function(){return function(a,b){var c={};return c.period=function(d){return b.period=d,a.period=function(c){return arguments.length?(b.period=+c,a):b.period},c},c.accessor=function(d){return b.accessor=d,a.accessor=function(c){return arguments.length?(b.accessor=c,a):b.accessor},c},c}}},{}],30:[function(a,b,c){"use strict";function d(a,b,c,d,e){return b?{date:a,macd:b,signal:c,difference:d,zero:e}:{date:a,macd:null,signal:null,difference:null,zero:null}}b.exports=function(a,b,c){return function(){function e(a){var b=Math.max(g,h)-1,c=b+i-1;return j.accessor(e.accessor()).period(i).init(),k.accessor(e.accessor()).period(g).init(),l.accessor(e.accessor()).period(h).init(),a.map(function(a,e){var g=k.average(f.accessor(a))-l.average(f.accessor(a)),h=e>=b?j.average(g):null;return e>=c?d(f.accessor.d(a),g,h,g-h,0):d(f.accessor.d(a))}).filter(function(a){return null!==a.macd})}var f={},g=12,h=26,i=9,j=c(),k=c(),l=c();return e.fast=function(a){return arguments.length?(g=a,e):g},e.slow=function(a){return arguments.length?(h=a,e):h},e.signal=function(a){return arguments.length?(i=a,e):i},a(e,f).accessor(b()),e}}},{}],31:[function(a,b,c){"use strict";function d(a,b,c,d,e){return b?{date:a,rsi:b,middle:c,overbought:d,oversold:e}:{date:a,rsi:null,middle:null,overbought:null,oversold:null}}b.exports=function(a,b,c){return function(){function e(a){return j.accessor(e.accessor()).period(f.period).init(),k.accessor(e.accessor()).period(f.period).init(),a.map(function(b,c){if(c<1)return d(f.accessor.d(b));var e=f.accessor(b)-f.accessor(a[c-1]),l=k.average(Math.max(e,0)),m=Math.abs(j.average(Math.min(e,0)));if(c>=f.period){var n=100-100/(1+l/m);return d(f.accessor.d(b),n,h,g,i)}return d(f.accessor.d(b))}).filter(function(a){return null!==a.rsi})}var f={},g=70,h=50,i=30,j=c(),k=c();return e.overbought=function(a){return arguments.length?(g=a,e):g},e.middle=function(a){return arguments.length?(h=a,e):h},e.oversold=function(a){return arguments.length?(i=a,e):i},a(e,f).accessor(b()).period(14),e}}},{}],32:[function(a,b,c){"use strict";b.exports=function(a,b){return function(){function c(a){return c.init(),a.map(d).filter(function(a){return null!==a.value})}function d(a,b){var d=c.average(h.accessor(a));return b+1<h.period&&(d=null),{date:h.accessor.d(a),value:d}}var e,f,g,h={};return c.init=function(){return g=0,e=[],f=0,c},c.average=function(a){return g+=a,e.length+1<h.period?(e.push(a),g/++f):(e.length<h.period&&(e.push(a),g+=a),g-=e[f],e[f]=a,++f===h.period&&(f=0),g/h.period)},a(c,h).accessor(b()).period(10),c}}},{}],33:[function(a,b,c){"use strict";function d(a,b,c,d,e,f){return b?{date:a,stochasticK:b,stochasticD:c,middle:d,overbought:e,oversold:f}:{date:a,stochasticK:null,stochasticD:null,middle:d,overbought:e,oversold:f}}b.exports=function(a,b){return function(){function c(a){var b=parseInt(f)+parseInt(g);return a.map(function(c,k){if(k>=b){for(var l=[],m=[],n=[],o=0;o<g;o++)l.push(0),m.push(1e4),n.push(0);for(var p=0,q=0;q<g;q++){for(var r=0;r<f;r++)e.accessor.h(a[k-r-q])>l[q]&&(l[q]=e.accessor.h(a[k-r-q])),e.accessor.l(a[k-r-q])<m[q]&&(m[q]=e.accessor.l(a[k-r-q]));var s=l[q]-m[q];s>0?n[q]=(e.accessor.c(a[k-q])-m[q])/(l[q]-m[q])*100:n[q]=50,p+=n[q]}var t=n[0];return p/=g,d(e.accessor.d(c),t,p,i,h,j)}return d(e.accessor.d(c),null,null,i,h,j)}).filter(function(a){return a.stochasticK})}var e={},f=20,g=3,h=80,i=50,j=20;return c.period=function(a){return arguments.length?(f=a,c):f},c.periodD=function(a){return arguments.length?(g=a,c):g},c.overbought=function(a){return arguments.length?(h=a,c):h},c.middle=function(a){return arguments.length?(i=a,c):i},c.oversold=function(a){return arguments.length?(j=a,c):j},a(c,e).accessor(b()),c}}},{}],34:[function(a,b,c){"use strict";b.exports=function(a,b){return function(){function c(a){return c.init(),a.map(d).filter(function(a){return null!==a.value})}function d(a,b){b>0&&g.getDate()!=h.accessor.d(a).getDate()&&(e=0,f=0);var c=(h.accessor.h(a)+h.accessor.l(a)+h.accessor.c(a))/3;return e+=c*h.accessor.v(a),f+=h.accessor.v(a),g=h.accessor.d(a),{date:h.accessor.d(a),value:e/f}}var e,f,g,h={};return c.init=function(){return e=0,f=0,c},a(c,h).accessor(b()).period(1),c}}},{}],35:[function(a,b,c){"use strict";function d(a,b,c,d,e){return b?{date:a,williams:b,middle:c,overbought:d,oversold:e}:{date:a,williams:null,middle:null,overbought:null,oversold:null}}b.exports=function(a,b){return function(){function c(a){return a.map(function(b,c){if(c>=f){for(var j=0,k=0,l=1e4,m=0,n=0;n<f;n++)e.accessor.h(a[c-n])>j&&(j=e.accessor.h(a[c-n]),k=n),e.accessor.l(a[c-n])<l&&(l=e.accessor.l(a[c-n]),m=n);var o=(e.accessor.c(a[c])-l)/(j-l)*100;return d(e.accessor.d(b),o,h,g,i)}return d(e.accessor.d(b))}).filter(function(a){return a.williams})}var e={},f=20,g=80,h=50,i=20;return c.period=function(a){return arguments.length?(f=a,c):f},c.overbought=function(a){return arguments.length?(g=a,c):g},c.middle=function(a){return arguments.length?(h=a,c):h},c.oversold=function(a){return arguments.length?(i=a,c):i},a(c,e).accessor(b()),c}}},{}],36:[function(a,b,c){"use strict";function d(a,b,c,d){a.select("path.adx").attr("d",b),a.select("path.plusDi").attr("d",c),a.select("path.minusDi").attr("d",d)}b.exports=function(a,b,c){return function(){function e(a){var b=g.dataSelector(a);b.entry.append("path").attr("class","adx"),b.entry.append("path").attr("class","plusDi"),b.entry.append("path").attr("class","minusDi"),e.refresh(a)}function f(){h.init(g.accessor.d,g.xScale,g.accessor.adx,g.yScale),i.init(g.accessor.d,g.xScale,g.accessor.plusDi,g.yScale),j.init(g.accessor.d,g.xScale,g.accessor.minusDi,g.yScale)}var g={},h=b.pathLine(),i=b.pathLine(),j=b.pathLine();return e.refresh=function(a){d(g.dataSelector.select(a),h,i,j)},c(e,g).plot(a(),f).dataSelector(c.dataMapper.array),f(),e}}},{}],37:[function(a,b,c){"use strict";function d(a,b,c,d,e,f,g,h,i,j){a.select("path.overbought").attr("d",e.horizontalPathLine(b.d,c,b.ob,d)),a.select("path.oversold").attr("d",e.horizontalPathLine(b.d,c,b.os,d)),a.select("path.aroon.oscillator").attr("d",f),a.select("path.aroon.oscillatorArea").attr("d",g),a.select("path.aroon.middle").attr("d",h),a.select("path.aroon.up").attr("d",i),a.select("path.aroon.down").attr("d",j)}b.exports=function(a,b,c){return function(){function e(a){var b=g.dataSelector(a);b.entry.append("path").attr("class","overbought"),b.entry.append("path").attr("class","oversold"),b.entry.append("path").attr("class","aroon oscillator"),b.entry.append("path").attr("class","aroon oscillatorArea"),b.entry.append("path").attr("class","aroon middle"),b.entry.append("path").attr("class","aroon up"),b.entry.append("path").attr("class","aroon down"),e.refresh(a)}function f(){h.init(g.accessor.d,g.xScale,g.accessor.oscillator,g.yScale),i.init(g.accessor.d,g.xScale,g.accessor.oscillator,g.yScale,0),j.init(g.accessor.d,g.xScale,g.accessor.m,g.yScale),k.init(g.accessor.d,g.xScale,g.accessor.up,g.yScale),l.init(g.accessor.d,g.xScale,g.accessor.down,g.yScale)}var g={},h=b.pathLine(),i=b.pathArea(),j=b.pathLine(),k=b.pathLine(),l=b.pathLine();return e.refresh=function(a){d(g.dataSelector.select(a),g.accessor,g.xScale,g.yScale,b,h,i,j,k,l)},c(e,g).plot(a(),f).dataSelector(c.dataMapper.array),f(),e}}},{}],38:[function(a,b,c){"use strict";function d(a,b,c){a.select("path.up").attr("d",b),a.select("path.down").attr("d",c)}b.exports=function(a,b,c){return function(){function e(a){var b=g.dataSelector(a);b.entry.append("path").attr("class","up"),b.entry.append("path").attr("class","down"),e.refresh(a)}function f(){h.init(g.accessor.d,g.xScale,g.accessor.up,g.yScale),i.init(g.accessor.d,g.xScale,g.accessor.dn,g.yScale)}var g={},h=b.pathLine(),i=b.pathLine();return e.refresh=function(a){d(g.dataSelector.select(a),h,i)},c(e,g).plot(a(),f).dataSelector(c.dataMapper.array),f(),e}}},{}],39:[function(a,b,c){"use strict";function d(a,b,c,d,e,g,j,k,l){var m="left"===d||"top"===d?-1:1;a.attr("transform","translate("+l[0]+","+l[1]+")"),a.select("path").attr("d",i(b,c,d,g,j,k,m)),a.select("text").text(h(b,e)).call(f,b,c,d,m)}function e(a,b){return function(c){var d=b.range(),e=d[0],f=d[d.length-1];return d=e<f?[e,f]:[f,e],c.filter(function(c){if(null===a(c)||void 0===a(c))return!1;var e=b(a(c));return null!==e&&!isNaN(e)&&d[0]<=e&&e<=d[1]})}}function f(a,b,c,d,e){var f=c.scale();switch(d){case"left":case"right":a.attr("x",e*(Math.max(c.tickSizeInner(),0)+c.tickPadding())).attr("y",g(b,f)).attr("dy",".32em").style("text-anchor",e<0?"end":"start");break;case"top":case"bottom":a.attr("x",g(b,f)).attr("y",e*(Math.max(c.tickSizeInner(),0)+c.tickPadding())).attr("dy",e<0?"0em":".72em").style("text-anchor","middle")}}function g(a,b){return function(c){return b(a(c))}}function h(a,b){return function(c){return b(a(c))}}function i(a,b,c,d,e,f,g){return function(h){var i=b.scale(),j=i(a(h)),k=f;switch(c){case"left":case"right":var l=0;return d/2<f?k=d/2:l=d/2-f,"M 0 "+j+" l "+g*Math.max(b.tickSizeInner(),1)+" "+-k+" l 0 "+-l+" l "+g*e+" 0 l 0 "+d+" l "+g*-e+" 0 l 0 "+-l;case"top":case"bottom":var m=0;return e/2<f?k=e/2:m=e/2-f,"M "+j+" 0 l "+-k+" "+g*Math.max(b.tickSizeInner(),1)+" l "+-m+" 0 l 0 "+g*d+" l "+e+" 0 l 0 "+g*-d+" l "+-m+" 0";default:throw"Unsupported orient value: axisannotation.orient("+c+"). Set to one of: 'top', 'bottom', 'left', 'right'"}}}b.exports=function(a,b,c,f,g){return function(){function f(a){var b=i.dataSelector.mapper(e(i.accessor,j.scale()))(a);b.entry.append("path"),b.entry.append("text"),f.refresh(a)}var h,i={},j=a(b()),k=4,l=14,m=50,n=[0,0],o="bottom";return f.refresh=function(a){var b=h?h:j.tickFormat()?j.tickFormat():j.scale().tickFormat();d(i.dataSelector.select(a),i.accessor,j,o,b,l,m,k,n)},f.axis=function(a){return arguments.length?(j=a,f):j},f.orient=function(a){return arguments.length?(o=a,f):o},f.format=function(a){return arguments.length?(h=a,f):h},f.height=function(a){return arguments.length?(l=a,f):l},f.width=function(a){return arguments.length?(m=a,f):m},f.translate=function(a){return arguments.length?(n=a,f):n},g(f,i).accessor(c()).dataSelector(),f}}},{}],40:[function(a,b,c){"use strict";function d(a,b,c,d){a.select("path.upper").attr("d",b),a.select("path.middle").attr("d",c),a.select("path.lower").attr("d",d)}b.exports=function(a,b,c){return function(){function e(a){var b=g.dataSelector(a);b.entry.append("path").attr("class","upper"),b.entry.append("path").attr("class","middle"),b.entry.append("path").attr("class","lower"),e.refresh(a)}function f(){h.init(g.accessor.d,g.xScale,g.accessor.upper,g.yScale),i.init(g.accessor.d,g.xScale,g.accessor.middle,g.yScale),j.init(g.accessor.d,g.xScale,g.accessor.lower,g.yScale)}var g={},h=b.pathLine(),i=b.pathLine(),j=b.pathLine();return e.refresh=function(a){d(g.dataSelector.select(a),h,i,j)},c(e,g).plot(a(),f).dataSelector(c.dataMapper.array),f(),e}}},{}],41:[function(a,b,c){"use strict";b.exports=function(a,b,c,d,e){return function(){function a(b){var c=k.dataSelector(b);d.appendPathsUpDownEqual(c.selection,k.accessor,["candle","body"]),d.appendPathsUpDownEqual(c.selection,k.accessor,["candle","wick"]),a.refresh(b)}function b(){h=d.joinPath(f),i=d.joinPath(g),j=d.scaledStrokeWidth(k.xScale,1,4)}function f(){var a=k.accessor,b=k.xScale,c=k.yScale,d=k.width(b);return function(e){var f=c(a.o(e)),g=c(a.c(e)),h=b(a.d(e))-d/2,i="M "+h+" "+f+" l "+d+" 0";return f!=g&&(i+=" L "+(h+d)+" "+g+" l "+-d+" 0 L "+h+" "+f),i}}function g(){var a=k.accessor,b=k.xScale,c=k.yScale,d=k.width(b);return function(e){var f=c(a.o(e)),g=c(a.c(e)),h=b(a.d(e)),i=h-d/2,j="M "+h+" "+c(a.h(e))+" L "+h+" "+Math.min(f,g);return f==g&&(j+=" M "+i+" "+f+" l "+d+" 0"),j+" M "+h+" "+Math.max(f,g)+" L "+h+" "+c(a.l(e))}}var h,i,j,k={};return a.refresh=function(a){a.selectAll("path.candle.body").attr("d",h),a.selectAll("path.candle.wick").attr("d",i).style("stroke-width",j)},e(a,k).plot(c(),b).width(b).dataSelector(e.dataMapper.array),b(),a}}},{}],42:[function(a,b,c){"use strict";b.exports=function(a,b,c,d,e,f,g){return function(){function a(b){var c=s.dataSelector(b);c.entry.append("path").attr("class","horizontal wire"),c.entry.append("path").attr("class","vertical wire"),c.entry.append("g").attr("class","axisannotation x").call(u),c.entry.append("g").attr("class","axisannotation y").call(v),b.selectAll("rect").data([void 0]).enter().append("rect").style("fill","none").style("pointer-events","all"),a.refresh(b)}function b(a,b,d,e,f){return function(){a.node().__coord__=c(this),h(a,b,d,e,f)}}function h(a,b,c,d,e){var f=a.node().__coord__;if(void 0!==f){var g=a.datum(),h=s.xScale.invert(f[0]),i=s.yScale.invert(f[1]),j=null!==h&&null!==i&&(s.accessor.xv(g)!==h||s.accessor.yv(g)!==i);s.accessor.xv(g,h),s.accessor.yv(g,i),j&&t.call("move",a.node(),g)}b.attr("d",o),c.attr("d",p),d.call(u.refresh),e.call(v.refresh),a.attr("display",n)}function i(){return o=k(),p=j(),u.accessor(s.accessor.xv).scale(s.xScale),v.accessor(s.accessor.yv).scale(s.yScale),a}function j(){var a=r||s.xScale.range();return function(b){if(null===s.accessor.yv(b))return null;var c=s.yScale(s.accessor.yv(b));return isNaN(c)?null:"M "+a[0]+" "+c+" L "+a[a.length-1]+" "+c}}function k(){var a=q||s.yScale.range();return function(b){if(null===s.accessor.xv(b))return null;var c=s.xScale(s.accessor.xv(b)),d=s.xScale.range();return c<Math.min(d[0],d[d.length-1])||c>Math.max(d[0],d[d.length-1])?null:"M "+c+" "+a[0]+" L "+c+" "+a[a.length-1]}}function l(a){return a=a||{},s.accessor.xv(a,null),s.accessor.yv(a,null),a}function m(a){return void 0===a||null===s.accessor.xv(a)||null===s.accessor.yv(a)}function n(a){return m(a)?"none":null}var o,p,q,r,s={},t=d("enter","out","move"),u=f.plotComposer().scope("composed-annotation").plotScale(function(a){return a.axis().scale()}),v=f.plotComposer().scope("composed-annotation").plotScale(function(a){return a.axis().scale()});return a.refresh=function(a){var c=s.xScale.range(),d=s.yScale.range(),e=s.dataSelector.select(a),f=e.select("path.vertical"),g=e.select("path.horizontal"),i=e.select("g.axisannotation.x"),j=e.select("g.axisannotation.y");a.selectAll("rect").attr("x",Math.min.apply(null,c)).attr("y",Math.min.apply(null,d)).attr("height",Math.abs(d[d.length-1]-d[0])).attr("width",Math.abs(c[c.length-1]-c[0])).on("mouseenter",function(){
t.call("enter",this)}).on("mouseout",function(){t.call("out",this),delete e.node().__coord__,l(e.datum()),h(e,f,g,i,j)}).on("mousemove",b(e,f,g,i,j)),h(e,f,g,i,j)},a.xAnnotation=function(a){return arguments.length?(u.plots(a instanceof Array?a:[a]),i()):u.plots()},a.yAnnotation=function(a){return arguments.length?(v.plots(a instanceof Array?a:[a]),i()):v.plots()},a.verticalWireRange=function(a){return arguments.length?(q=a,i()):q},a.horizontalWireRange=function(a){return arguments.length?(r=a,i()):r},g(a,s).plot(e(),i).dataSelector(function(a){return m(a)?[l()]:[a]}).on(t),s.dataSelector.scope("crosshair"),i()}}},{}],43:[function(a,b,c){"use strict";function d(a){return function(b){return-a(b)}}function e(){return Math.random().toString(36).substr(2,9)}b.exports=function(a,b,c,f,g){return function(){function h(a){var b=m.dataSelector(a),c="kumoclipup-"+e(),d="kumoclipdown-"+e();b.entry.append("clipPath").attr("id",d).attr("class","kumoclipdown").append("path"),b.entry.append("clipPath").attr("id",c).attr("class","kumoclipup").append("path"),b.entry.append("path").attr("class","kumo down").attr("clip-path","url(#"+d+")"),b.entry.append("path").attr("class","kumo up").attr("clip-path","url(#"+c+")"),b.entry.append("path").attr("class","senkouspanb"),b.entry.append("path").attr("class","senkouspana"),b.entry.append("path").attr("class","chikouspan"),b.entry.append("path").attr("class","kijunsen"),b.entry.append("path").attr("class","tenkansen"),h.refresh(a)}function i(a,b){a.select(".kumoclipdown path").attr("d",n.y1(b.range()[0])),a.select(".kumoclipup path").attr("d",n.y1(b.range()[1])),a.select("path.kumo.down").attr("d",o),a.select("path.kumo.up").attr("d",o),a.select("path.senkouspanb").attr("d",q),a.select("path.senkouspana").attr("d",p),a.select("path.chikouspan").attr("d",r),a.select("path.kijunsen").attr("d",t),a.select("path.tenkansen").attr("d",s)}function j(){p.init(m.accessor.d,m.xScale,m.accessor.sa,m.yScale,m.accessor.pks),q.init(m.accessor.d,m.xScale,m.accessor.sb,m.yScale,m.accessor.pks),r.init(m.accessor.d,m.xScale,m.accessor.c,m.yScale,d(m.accessor.pks)),s.init(m.accessor.d,m.xScale,m.accessor.ts,m.yScale),t.init(m.accessor.d,m.xScale,m.accessor.ks,m.yScale)}function k(){return a().curve(b).defined(function(a){return null!==m.accessor.sb(a)}).x(function(a){return m.xScale(m.accessor.d(a),m.accessor.pks(a))}).y0(function(a){return m.yScale(m.accessor.sb(a))})}function l(){return a().curve(b).defined(function(a){return null!==m.accessor.sa(a)&&null!==m.accessor.sb(a)}).x(function(a){return m.xScale(m.accessor.d(a),m.accessor.pks(a))}).y0(function(a){return m.yScale(m.accessor.sa(a))}).y1(function(a){return m.yScale(m.accessor.sb(a))})}var m={},n=k(),o=l(),p=f.pathLine(),q=f.pathLine(),r=f.pathLine(),s=f.pathLine(),t=f.pathLine();return h.refresh=function(a){i(m.dataSelector.select(a),m.yScale)},g(h,m).plot(c(),j).dataSelector(g.dataMapper.array),j(),h}}},{}],44:[function(a,b,c){"use strict";function d(){return d3.event}b.exports=function(b){var c=a("../scale")(b),e=a("../accessor")(),f=a("./plot")(b.line,b.area,b.curveMonotoneX,b.select),g=a("../util")().functor,h=a("./plotmixin")(b.scaleLinear,g,c.financetime,f.dataSelector,f.barWidth),i=a("./candlestick")(b.scaleLinear,b.extent,e.ohlc,f,h),j=a("./line"),k=a("./axisannotation")(b.axisTop,b.scaleLinear,e.value,f,h),l=a("../svg")(b);return{tradearrow:a("./tradearrow")(b.select,g,b.mouse,b.dispatch,e.trade,f,h,l.arrow),atr:j(e.value,f,h),atrtrailingstop:a("./atrtrailingstop")(e.atrtrailingstop,f,h),axisannotation:k,candlestick:i,crosshair:a("./crosshair")(b.select,d,b.mouse,b.dispatch,e.crosshair,f,h),ema:j(e.value,f,h),heikinashi:i,ichimoku:a("./ichimoku")(b.area,b.curveMonotoneX,e.ichimoku,f,h),ohlc:a("./ohlc")(b.scaleLinear,b.extent,e.ohlc,f,h),tick:a("./tick")(b.scaleLinear,b.extent,e.tick,f,h),close:j(e.ohlc,f,h),volume:a("./volume")(e.volume,f,h),rsi:a("./rsi")(e.rsi,f,h),macd:a("./macd")(e.macd,f,h),momentum:j(e.value,f,h,!0),moneyflow:j(e.value,f,h,!0),sma:j(e.value,f,h),supstance:a("./supstance")(b.drag,d,b.select,b.dispatch,e.supstance,f,h),trendline:a("./trendline")(b.drag,d,b.select,b.dispatch,e.trendline,f,h),wilderma:j(e.value,f,h),adx:a("./adx")(e.adx,f,h),aroon:a("./aroon")(e.aroon,f,h),stochastic:a("./stochastic")(e.stochastic,f,h),williams:a("./williams")(e.williams,f,h),bollinger:a("./bollinger")(e.bollinger,f,h),vwap:j(e.value,f,h)}}},{"../accessor":8,"../scale":59,"../svg":62,"../util":64,"./adx":36,"./aroon":37,"./atrtrailingstop":38,"./axisannotation":39,"./bollinger":40,"./candlestick":41,"./crosshair":42,"./ichimoku":43,"./line":45,"./macd":46,"./ohlc":47,"./plot":48,"./plotmixin":49,"./rsi":50,"./stochastic":51,"./supstance":52,"./tick":53,"./tradearrow":54,"./trendline":55,"./volume":56,"./williams":57}],45:[function(a,b,c){"use strict";function d(a,b,c,d,e,f,g){a.select("path.line").attr("d",f),g&&a.select("path.zero").attr("d",e.horizontalPathLine(c,b.z,d))}b.exports=function(a,b,c,e){return e=e||!1,function(){function f(a){var b=h.dataSelector(a);b.entry.append("path").attr("class","line"),e&&b.selection.append("path").attr("class","zero"),f.refresh(a)}function g(){i.init(h.accessor.d,h.xScale,h.accessor,h.yScale)}var h={},i=b.pathLine();return f.refresh=function(a){d(h.dataSelector.select(a),h.accessor,h.xScale,h.yScale,b,i,e)},c(f,h).plot(a(),g).dataSelector(c.dataMapper.array),g(),f}}},{}],46:[function(a,b,c){"use strict";function d(a,b,c,d,e,f,g,h){a.select("path.difference").attr("d",f),a.select("path.zero").attr("d",e.horizontalPathLine(b.d,c,b.z,d)),a.select("path.macd").attr("d",g),a.select("path.signal").attr("d",h)}b.exports=function(a,b,c){return function(){function e(a){var b=i.dataSelector(a);b.selection.append("path").attr("class","difference"),b.selection.append("path").attr("class","zero"),b.selection.append("path").attr("class","macd"),b.selection.append("path").attr("class","signal"),e.refresh(a)}function f(){h=b.joinPath(g),j.init(i.accessor.d,i.xScale,i.accessor.m,i.yScale),k.init(i.accessor.d,i.xScale,i.accessor.s,i.yScale)}function g(){var a=i.accessor,b=i.xScale,c=i.yScale,d=i.width(b);return function(e){var f=c(0),g=c(a.dif(e))-f,h=b(a.d(e))-d/2;return"M "+h+" "+f+" l 0 "+g+" l "+d+" 0 l 0 "+-g}}var h,i={},j=b.pathLine(),k=b.pathLine();return e.refresh=function(a){d(i.dataSelector.select(a),i.accessor,i.xScale,i.yScale,b,h,j,k)},c(e,i).plot(a(),f).width(f).dataSelector(c.dataMapper.array),f(),e}}},{}],47:[function(a,b,c){"use strict";b.exports=function(a,b,c,d,e){return function(){function a(b){d.appendPathsUpDownEqual(i.dataSelector(b).selection,i.accessor,"ohlc"),a.refresh(b)}function b(){g=d.joinPath(f),h=d.scaledStrokeWidth(i.xScale,1,2)}function f(){var a=i.accessor,b=i.xScale,c=i.yScale,d=i.width(b);return function(e){var f=c(a.o(e)),g=c(a.c(e)),h=b(a.d(e)),i=h-d/2;return"M "+i+" "+f+" l "+d/2+" 0 M "+h+" "+c(a.h(e))+" L "+h+" "+c(a.l(e))+" M "+h+" "+g+" l "+d/2+" 0"}}var g,h,i={};return a.refresh=function(a){a.selectAll("path.ohlc").attr("d",g).style("stroke-width",h)},e(a,i).plot(c(),b).width(b).dataSelector(e.dataMapper.array),b(),a}}},{}],48:[function(a,b,c){"use strict";b.exports=function(a,b,c,d){function e(){function b(a){return d(a)}var d=a().curve(c);return b.init=function(a,b,c,e,f){return d.defined(function(a){return null!==c(a)}).x(function(c){return b(a(c),void 0===f?f:f(c))}).y(function(a){return e(c(a))})},b.d3=function(){return d},b}function f(){function a(a){return d(a)}var d=b().curve(c);return a.init=function(a,b,c,e,f){return d.defined(function(a){return null!==c(a)}).x(function(c){return b(a(c))}).y0(function(a){return e(f)}).y1(function(a){return e(c(a))})},a.d3=function(){return d},a}function g(a){return{up:function(b){return a.o(b)<a.c(b)},down:function(b){return a.o(b)>a.c(b)},equal:function(b){return a.o(b)===a.c(b)}}}function h(a,b,c,d){var e=c instanceof Array?c:[c];d=d||g(b),Object.keys(d).forEach(function(b){j(a,d[b],e,b)})}function i(a,b,c){h(a,b,c,g(b))}function j(a,b,c,d){a.selectAll("path."+l(c,".")+"."+d).data(function(a){return[a.filter(b)]}).enter().append("path").attr("class",l(c," ")+" "+d)}function k(a){return void 0!==a.band?Math.max(a.band(),1):3}function l(a,b){if(a.length){for(var c=a[0],d=1;d<a.length;d++)c+=b+a[d];return c}}function m(){function a(b){var c=e.mapper(function(){return f.map(function(){return[]})})(b);c.selection.each(function(a,b){f[b](d(this))}),a.refresh(b)}var b,c,e=n(),f=[],g=function(a){return a.scale()};return a.refresh=function(a){e.select(a).data(function(a){var d=c(a);if(null===d||void 0===d)return f.map(function(){return[]});var e=b(d);return f.map(function(a){var c=g(a)===b?d:g(a).invert(e);return[{value:c}]})}).each(function(a,b){f[b](d(this))})},a.plots=function(b){return arguments.length?(f=b,a):f},a.scale=function(c){return arguments.length?(b=c,a):b},a.accessor=function(b){return arguments.length?(c=b,a):c},a.scope=function(b){return arguments.length?(e.scope(b),a):e.scope()},a.plotScale=function(b){return arguments.length?(g=b,a):g},a}var n=function(a){function b(d){var f=b.select(d).data(a,c),g=f.enter().append("g").attr("class",l(e," "));return f.exit().remove(),{entry:g,selection:g.merge(f)}}var c,d,e=["data"];return b.select=function(a){return a.selectAll("g."+l(e,"."))},b.mapper=function(c){return arguments.length?(a=c,b):a},b.scope=function(a){return arguments.length?(d=a,e=["data","scope-"+d],b):d},b.key=function(a){return arguments.length?(c=a,b):c},b};return n.mapper={unity:function(a){return a},array:function(a){return[a]}},{dataSelector:n,appendPathsGroupBy:h,appendPathsUpDownEqual:i,horizontalPathLine:function(a,b,c,d){return function(e){if(!e.length)return null;var f=e[0],g=e[e.length-1];return"M "+b(a(f))+" "+d(c(f))+" L "+b(a(g))+" "+d(c(g))}},pathLine:e,pathArea:f,barWidth:k,scaledStrokeWidth:function(a,b,c){return b=b||1,c=c||1,function(){return Math.min(b,k(a)/c)+"px"}},joinPath:function(a){return function(b){return l(b.map(a())," ")}},interaction:{mousedispatch:function(a){return function(b){return b.on("mouseenter",function(b){d(this.parentNode).classed("mouseover",!0),a.call("mouseenter",this,b)}).on("mouseleave",function(b){var c=d(this.parentNode);c.classed("dragging")||(c.classed("mouseover",!1),a.call("mouseout",this,b))}).on("mousemove",function(b){a.call("mousemove",this,b)})}},dragStartEndDispatch:function(a,b){return a.on("start",function(a){d(this.parentNode.parentNode).classed("dragging",!0),b.call("dragstart",this,a)}).on("end",function(a){d(this.parentNode.parentNode).classed("dragging",!1),b.call("dragend",this,a)})}},plotComposer:m}}},{}],49:[function(a,b,c){"use strict";b.exports=function(a,b,c,d,e){var f=function(f,g){var h={};return h.dataSelector=function(a,b){return g.dataSelector=d(a).key(b),h},h.xScale=function(a){return g.xScale=c(),f.xScale=function(b){return arguments.length?(g.xScale=b,a&&a(),f):g.xScale},h},h.yScale=function(b){return g.yScale=a(),f.yScale=function(a){return arguments.length?(g.yScale=a,b&&b(),f):g.yScale},h},h.accessor=function(a,b){return g.accessor=a,f.accessor=function(a){return arguments.length?(g.accessor=a,b&&b(),f):g.accessor},h},h.width=function(a){return g.width=e,f.width=function(c){return arguments.length?(g.width=b(c),a&&a(),f):g.width},h},h.on=function(a,b){return f.on=function(c,d){return a.on(c,d),b&&b(),f},h},h.plot=function(a,b){return h.xScale(b).yScale(b).accessor(a,b)},h};return f.dataMapper=d.mapper,f}},{}],50:[function(a,b,c){"use strict";function d(a,b,c,d,e,f){a.select("path.overbought").attr("d",e.horizontalPathLine(b.d,c,b.ob,d)),a.select("path.middle").attr("d",e.horizontalPathLine(b.d,c,b.m,d)),a.select("path.oversold").attr("d",e.horizontalPathLine(b.d,c,b.os,d)),a.select("path.rsi").attr("d",f)}b.exports=function(a,b,c){return function(){function e(a){var b=g.dataSelector(a);b.entry.append("path").attr("class","overbought"),b.entry.append("path").attr("class","middle"),b.entry.append("path").attr("class","oversold"),b.entry.append("path").attr("class","rsi"),e.refresh(a)}function f(){h.init(g.accessor.d,g.xScale,g.accessor.r,g.yScale)}var g={},h=b.pathLine();return e.refresh=function(a){d(g.dataSelector.select(a),g.accessor,g.xScale,g.yScale,b,h)},c(e,g).plot(a(),f).dataSelector(c.dataMapper.array),f(),e}}},{}],51:[function(a,b,c){"use strict";function d(a,b,c,d,e,f,g){a.select("path.overbought").attr("d",e.horizontalPathLine(b.d,c,b.ob,d)),a.select("path.oversold").attr("d",e.horizontalPathLine(b.d,c,b.os,d)),a.select("path.stochastic.up").attr("d",f),a.select("path.stochastic.down").attr("d",g)}b.exports=function(a,b,c){return function(){function e(a){var b=g.dataSelector(a);b.entry.append("path").attr("class","overbought"),b.entry.append("path").attr("class","oversold"),b.entry.append("path").attr("class","stochastic up"),b.entry.append("path").attr("class","stochastic down"),e.refresh(a)}function f(){h.init(g.accessor.d,g.xScale,g.accessor.k,g.yScale),i.init(g.accessor.d,g.xScale,g.accessor.sd,g.yScale)}var g={},h=b.pathLine(),i=b.pathLine();return e.refresh=function(a){d(g.dataSelector.select(a),g.accessor,g.xScale,g.yScale,b,h,i)},c(e,g).plot(a(),f).dataSelector(c.dataMapper.array),f(),e}}},{}],52:[function(a,b,c){"use strict";function d(a,b,c,d,f){a.select(".supstance path").attr("d",e(b,c,d)),a.select(".interaction path").attr("d",e(b,c,d)),a.select(".axisannotation.y").call(f.refresh)}function e(a,b,c){return function(d){var e;return f(a)?(e=[a.s(d),a.e(d)],e[0]=void 0!==e[0]?b(e[0]):b.range()[0],e[1]=void 0!==e[1]?b(e[1]):b.range()[1]):e=b.range(),"M "+e[0]+" "+c(a(d))+" L "+e[e.length-1]+" "+c(a(d))}}function f(a){return void 0!==a.s&&void 0!==a.e}b.exports=function(a,b,c,e,f,g,h){function i(){function a(b){var d=c.dataSelector(b);d.entry.append("g").attr("class","supstance").append("path"),d.entry.append("g").attr("class","axisannotation y").call(k);var e=d.entry.append("g").attr("class","interaction").style("opacity",0).style("fill","none").call(g.interaction.mousedispatch(i));e.append("path").style("stroke-width","16px"),a.refresh(b)}function b(){return k.accessor(c.accessor.v).scale(c.yScale),a}var c={},i=e("mouseenter","mouseout","mousemove","drag","dragstart","dragend"),k=g.plotComposer().scope("composed-annotation").plotScale(function(a){return a.axis().scale()});return a.refresh=function(a){d(c.dataSelector.select(a),c.accessor,c.xScale,c.yScale,k)},a.drag=function(a){a.selectAll(".interaction path").call(j(i,c.accessor,c.xScale,c.yScale,k))},a.annotation=function(b){return arguments.length?(k.plots(b instanceof Array?b:[b]),a):k.plots()},h(a,c).dataSelector(h.dataMapper.unity).plot(f(),b).on(i),c.dataSelector.scope("supstance"),b()}function j(e,f,h,i,j){var k=a().subject(function(a){return{x:0,y:i(f(a))}}).on("drag",function(a){var g=i.invert(b().y),k=c(this.parentNode.parentNode);f.v(a,g),d(k,f,h,i,j),e.call("drag",this,a)});return g.interaction.dragStartEndDispatch(k,e)}return i}},{}],53:[function(a,b,c){"use strict";b.exports=function(a,b,c,d,e){return function(){function a(b){i.dataSelector(b).entry.append("path").attr("class","tick"),a.refresh(b)}function b(){g=d.joinPath(f),h=d.scaledStrokeWidth(i.xScale,1,2)}function f(){var a=i.accessor,b=i.xScale,c=i.yScale,d=i.width(b);return function(e){var f=c(a.h(e)),g=c(a.l(e)),h=b(a.d(e)),i=h-d/2;return"M "+i+" "+f+" l "+d+" 0 M "+h+" "+f+" L "+h+" "+g+" M "+i+" "+g+" l "+d+" 0"}}var g,h,i={};return a.refresh=function(a){i.dataSelector.select(a).select("path.tick").attr("d",g).style("stroke-width",h)},e(a,i).plot(c(),b).width(b).dataSelector(e.dataMapper.array),b(),a}}},{}],54:[function(a,b,c){"use strict";function d(a,b){Object.keys(b).forEach(function(c){a.classed(c,b[c])})}b.exports=function(a,b,c,e,f,g,h,i){return function(){function j(b){var e=o.dataSelector(b),f=m(b.datum());g.appendPathsGroupBy(e.selection,o.accessor,"tradearrow",f),e.entry.append("path").attr("class","highlight").style("pointer-events","none"),e.selection.selectAll("path.tradearrow").on("mouseenter",function(b){var e=l(b,c(this)[0]);a(this.parentNode).select("path.highlight").datum(e.d).attr("d",r).call(d,f),p.call("mouseenter",this,e.d,e.i)}).on("mouseout",function(b){a(this.parentNode).selectAll("path.highlight").datum([]).attr("d",null).attr("class","highlight");var d=l(b,c(this)[0]);p.call("mouseout",this,d.d,d.i)}),j.refresh(b)}function k(){return r.x(function(a){return o.xScale(o.accessor.d(a))}).y(q),n=g.joinPath(function(){return r}),j}function l(a,b){return a.map(function(a,b){return{d:a,i:b,x:o.xScale(o.accessor.d(a))}}).reduce(function(a,c){return Math.abs(a.x-b)<Math.abs(c.x-b)?a:c})}function m(a){return a.map(function(a){return o.accessor.t(a)}).reduce(function(a,b){return void 0===a[b]&&(a[b]=function(a){return b===o.accessor.t(a)}),a},{})}var n,o={},p=e("mouseenter","mouseout"),q=function(a){return o.yScale(o.accessor.p(a))},r=i().orient(function(a){return"buy"===o.accessor.t(a)?"up":"down"});return j.refresh=function(a){a.selectAll("path.tradearrow").attr("d",n)},j.orient=function(a){return arguments.length?(r.orient(a),k()):r.orient()},j.y=function(a){return arguments.length?(q=b(a),k()):q},j.arrow=function(){return r},h(j,o).plot(f(),k).on(p).dataSelector(h.dataMapper.array),k(),j}}},{}],55:[function(a,b,c){"use strict";function d(a,b,c,d){a.selectAll("path.body").attr("d",e(b,c,d)),a.selectAll("circle.start").attr("cx",f(b.sd,c)).attr("cy",g(b.sv,d)),a.selectAll("circle.end").attr("cx",f(b.ed,c)).attr("cy",g(b.ev,d))}function e(a,b,c){return function(d){return"M "+b(a.sd(d))+" "+c(a.sv(d))+" L "+b(a.ed(d))+" "+c(a.ev(d))}}function f(a,b){return function(c){return b(a(c))}}function g(a,b){return function(c){return b(a(c))}}b.exports=function(a,b,c,e,f,g,h){function i(){function a(d){var e=b.dataSelector(d),f=e.entry.append("g").attr("class","trendline");f.append("path").attr("class","body"),f.append("circle").attr("class","start").attr("r",1),f.append("circle").attr("class","end").attr("r",1);var h=e.entry.append("g").attr("class","interaction").style("opacity",0).style("fill","none").call(g.interaction.mousedispatch(c));h.append("path").attr("class","body").style("stroke-width","16px"),h.append("circle").attr("class","start").attr("r",8),h.append("circle").attr("class","end").attr("r",8),a.refresh(d)}var b={},c=e("mouseenter","mouseout","mousemove","drag","dragstart","dragend");return a.refresh=function(a){d(b.dataSelector.select(a),b.accessor,b.xScale,b.yScale)},a.drag=function(a){a.selectAll(".interaction circle.start").call(j(c,b.accessor,b.accessor.sd,b.xScale,b.accessor.sv,b.yScale)),a.selectAll(".interaction circle.end").call(j(c,b.accessor,b.accessor.ed,b.xScale,b.accessor.ev,b.yScale)),a.selectAll(".interaction path.body").call(k(c,b.accessor,b.xScale,b.yScale))},h(a,b).dataSelector(h.dataMapper.unity).plot(f()).on(c),a}function j(e,f,h,i,j,k){var m=a();return m.subject(function(a){return{x:i(h(a)),y:k(j(a))}}).on("drag",function(a){l(h,i,b().x,j,k,b().y,a),d(c(this.parentNode.parentNode.parentNode),f,i,k),e.call("drag",this,a)}),g.interaction.dragStartEndDispatch(m,e)}function k(e,f,h,i){var j={},k=a();return k.subject(function(a){return j.start={date:h(f.sd(a)),value:i(f.sv(a))},j.end={date:h(f.ed(a)),value:i(f.ev(a))},{x:0,y:0}}).on("drag",function(a){l(f.sd,h,b().x+j.start.date,f.sv,i,b().y+j.start.value,a),l(f.ed,h,b().x+j.end.date,f.ev,i,b().y+j.end.value,a),d(c(this.parentNode.parentNode.parentNode),f,h,i),e.call("drag",this,a)}),g.interaction.dragStartEndDispatch(k,e)}function l(a,b,c,d,e,f,g){var h=b.invert(c);null!==h&&void 0!==h&&a(g,h),d(g,e.invert(f))}return i}},{}],56:[function(a,b,c){"use strict";b.exports=function(a,b,c){return function(){function d(a){var c=i.dataSelector(a);f()?b.appendPathsUpDownEqual(c.selection,i.accessor,"volume"):c.entry.append("path").attr("class","volume"),d.refresh(a)}function e(){h=b.joinPath(g)}function f(){return i.accessor.o&&i.accessor.c}function g(){var a=i.accessor,b=i.xScale,c=i.yScale,d=i.width(b);return function(e){var f=a.v(e);if(isNaN(f))return null;var g=c(0),h=c(f)-g,i=b(a.d(e))-d/2;return"M "+i+" "+g+" l 0 "+h+" l "+d+" 0 l 0 "+-h}}var h,i={};return d.refresh=function(a){f()?a.selectAll("path.volume").attr("d",h):i.dataSelector.select(a).select("path.volume").attr("d",h)},c(d,i).plot(a(),e).width(e).dataSelector(c.dataMapper.array),e(),d}}},{}],57:[function(a,b,c){"use strict";b.exports=function(a,b,c){return function(){function d(a){f.dataSelector(a).entry.append("path").attr("class","williams up"),d.refresh(a)}function e(){g.init(f.accessor.d,f.xScale,f.accessor.w,f.yScale)}var f={},g=b.pathLine();return d.refresh=function(a){f.dataSelector.select(a).select("path.williams.up").attr("d",g)},c(d,f).plot(a(),e).dataSelector(c.dataMapper.array),e(),d}}},{}],58:[function(a,b,c){"use strict";function d(a){return function(b){for(var c=0;c<a.length;c++)if(a[c][1](b))return a[c][0](b)}}b.exports=function(a,b,c,e,f,g){function h(b,d,n,r,s,t,u,v,w){function x(a,b){var d=C[a instanceof Date?a.getTime():+a];return b=b||0,void 0===d&&(d=r[0]>a?-1:c(r,a)),n(d+b)}function y(){return E=i(n,r,s),x}function z(){C=k(r)}function A(){return z(),n.domain([0,r.length-1]),y(),n.domain(n.range().map(f(t,E)).map(n.invert)),u.domain=n.domain(),y()}function B(a,e,f){if(1==a.length)return d;var g=a[a.length-1]-a[0],h=g/o<1,i=h?b.intraday:b.daily,k=h?q:p,l=Math.min(Math.round(j(a,e)*f),f),m=g/l,n=c(k,m);return n==i.length?i[n-1]:n?i[m/k[n-1]<k[n]/m?n-1:n]:i[n]}var C,D={tickFormat:b.daily[b.daily.length-1][2]},E=3;return n=n||a(),r=r||[new Date(0),new Date(1)],s=void 0===s?.2:s,t=void 0===t?.65:t,u=u||{domain:n.domain()},v=v||!1,w=w||g(n,y,u),x.invert=function(a){var b=r[x.invertToIndex(a)];return b?b:null},x.invertToIndex=function(a){return Math.round(n.invert(a))},x.domain=function(a){if(!arguments.length){var b=n.domain();return b[0]<0&&b[b.length-1]<0?[]:(b=[Math.max(Math.ceil(b[0]),0),Math.min(Math.floor(b[b.length-1]),r.length-1)],r.slice(b[0],b[b.length-1]+1))}return r=a,A()},x.copy=function(){return h(b,d,n.copy(),r,s,t,u,v,w)},x.band=function(){return E},x.outerPadding=function(a){return arguments.length?(t=a,A()):t},x.padding=function(a){return arguments.length?(s=a,A()):s},x.zoomable=function(){return w},x.ticks=function(a,b){var c=x.domain(),d=n.domain();if(!c.length)return[];var e=void 0===a?B(c,d,10):"number"==typeof a?B(c,d,a):null;D.tickFormat=e?e[2]:B(c,d,10)[2],e&&(a=e[0],b=e[1]);var f=a.every(b).range(c[0],+c[c.length-1]+1);return f.map(l(c,v)).reduce(m,[])},x.closestTicks=function(a){return arguments.length?(v=a,x):v},x.tickFormat=function(){return function(a){return D.tickFormat(a)}},e(x,n,y,"range"),z(),y()}function i(a,b,c){return Math.abs(a(b.length-1)-a(0))/Math.max(1,b.length-1)*(1-c)}function j(a,b){return a.length/(b[b.length-1]-b[0])}function k(a){var b={};return a.forEach(function(a,c){b[+a]=c}),b}function l(a,b){var d=k(a);return function(e){var f=d[+e];if(void 0!==f)return a[f];var g=c(a,e);return b&&g>0&&+e-+a[g-1]<+a[g]-+e&&g--,a[g]}}function m(a,b){return 0!==a.length&&a[a.length-1]===b||a.push(b),a}function n(){return h({daily:z,intraday:A},u)}var o=864e5,p=[o,6048e5,2592e6,7776e6,31536e6],q=[1e3,5e3,15e3,3e4,6e4,3e5,9e5,18e5,36e5,108e5,216e5,432e5,864e5],r=b.timeFormat("%b %e"),s=d([[b.timeFormat("%b %Y"),function(a){return a.getMonth()}],[b.timeFormat("%Y"),function(){return!0}]]),t=d([[b.timeFormat(":%S"),function(a){return a.getSeconds()}],[b.timeFormat("%I:%M"),function(a){return a.getMinutes()}],[b.timeFormat("%I %p"),function(){return!0}]]),u=[b.timeSecond,1,d([[b.timeFormat(":%S"),function(a){return a.getSeconds()}],[b.timeFormat("%I:%M"),function(a){return a.getMinutes()}],[b.timeFormat("%I %p"),function(a){return a.getHours()}],[b.timeFormat("%b %e"),function(){return!0}]])],v=b.utcFormat("%b %e"),w=d([[b.utcFormat("%b %Y"),function(a){return a.getUTCMonth()}],[b.utcFormat("%Y"),function(){return!0}]]),x=d([[b.utcFormat(":%S"),function(a){return a.getUTCSeconds()}],[b.utcFormat("%I:%M"),function(a){return a.getUTCMinutes()}],[b.utcFormat("%I %p"),function(){return!0}]]),y=[b.timeSecond,1,d([[b.utcFormat(":%S"),function(a){return a.getUTCSeconds()}],[b.utcFormat("%I:%M"),function(a){return a.getUTCMinutes()}],[b.utcFormat("%I %p"),function(a){return a.getUTCHours()}],[b.utcFormat("%b %e"),function(){return!0}]])],z=[[b.timeDay,1,r],[b.timeMonday,1,r],[b.timeMonth,1,s],[b.timeMonth,3,s],[b.timeYear,1,s]],A=[[b.timeSecond,1,t],[b.timeSecond,5,t],[b.timeSecond,15,t],[b.timeSecond,30,t],[b.timeMinute,1,t],[b.timeMinute,5,t],[b.timeMinute,15,t],[b.timeMinute,30,t],[b.timeHour,1,t],[b.timeHour,3,t],[b.timeHour,6,t],[b.timeHour,12,t],[b.timeDay,1,r]],B=[[b.utcDay,1,v],[b.utcMonday,1,v],[b.utcMonth,1,w],[b.utcMonth,3,w],[b.utcYear,1,w]],C=[[b.utcSecond,1,x],[b.utcSecond,5,x],[b.utcSecond,15,x],[b.utcSecond,30,x],[b.utcMinute,1,x],[b.utcMinute,5,x],[b.utcMinute,15,x],[b.utcMinute,30,x],[b.utcHour,1,x],[b.utcHour,3,x],[b.utcHour,6,x],[b.utcHour,12,x],[b.utcDay,1,v]];return n.utc=function(){return h({daily:B,intraday:C},y)},n}},{}],59:[function(a,b,c){"use strict";function d(a,b,c,d){return b.length>0?a.extent(b,c).map(f(d)):[]}function e(a,b,c,e){return a.scaleLinear().domain(d(a,b,c,e)).range([1,0])}function f(a,b){return a=a||0,function(c,d,e){if(e.length>2)throw"array.length > 2 unsupported. array.length = "+e.length;return b=b||e[e.length-1]-e[0],c+(2*d-1)*b*a}}function g(a,b){return a.map(b).reduce(function(a,b){return a.concat(b)}).filter(function(a){return null!==a})}b.exports=function(b){var c=a("./zoomable")(),d=a("../util")(),h=a("../accessor")(),i=a("./financetime")(b.scaleLinear,b,b.bisect,d.rebindCallback,f,c);return{financetime:i,analysis:{supstance:function(a,c){return b.scaleLinear()},trendline:function(a,c){return b.scaleLinear()}},plot:{time:function(a,b){return b=b||h.value(),i().domain(a.map(b.d))},atr:function(a,c){return c=c||h.value(),e(b,a,c,.04)},ichimoku:function(a,c){c=c||h.ichimoku();var d=g(a,function(b,d){var e=a[d+c.pks(b)],f=a[d-c.pks(b)];return[c.ts(b),c.ks(b),f?c.sa(f):null,f?c.sb(f):null,e?c.c(e):null]});return b.scaleLinear().domain(b.extent(d).map(f(.02))).range([1,0])},percent:function(a,b){var c=a.domain();return b=b||c[0],a.copy().domain([c[0],c[c.length-1]].map(function(a){return(a-b)/b}))},ohlc:function(a,c){return c=c||h.ohlc(),b.scaleLinear().domain([b.min(a.map(c.low())),b.max(a.map(c.high()))].map(f(.02))).range([1,0])},volume:function(a,c){return c=c||h.ohlc().v,b.scaleLinear().domain([0,1.15*b.max(a.map(c))]).range([1,0])},atrtrailingstop:function(a,c){c=c||h.atrtrailingstop();var d=g(a,function(a){return[c.up(a),c.dn(a)]});return b.scaleLinear().domain(b.extent(d).map(f(.04))).range([1,0])},rsi:function(){return b.scaleLinear().domain([0,100]).range([1,0])},momentum:function(a,c){return c=c||h.value(),e(b,a,c,.04)},moneyflow:function(a,c){return c=c||h.value(),e(b,a,c,.04)},macd:function(a,c){return c=c||h.macd(),e(b,a,c,.04)},movingaverage:function(a,c){return c=c||h.value(),e(b,a,c)},adx:function(){return b.scaleLinear().domain([0,100]).range([1,0])},aroon:function(){return b.scaleLinear().domain([-100,100]).range([1,0])},stochastic:function(){return b.scaleLinear().domain([0,100]).range([1,0])},williams:function(){return b.scaleLinear().domain([0,100]).range([1,0])},bollinger:function(a,c){return c=c||h.bollinger(),b.scaleLinear().domain([b.min(a.map(function(a){return c.lower(a)})),b.max(a.map(function(a){return c.upper(a)}))].map(f(.02))).range([1,0])}},position:{}}}},{"../accessor":8,"../util":64,"./financetime":58,"./zoomable":60}],60:[function(a,b,c){"use strict";b.exports=function(){function a(b,c,d,e){function f(a){return b.apply(b,arguments)}return e=void 0===e||e,f.invert=b.invert,f.domain=function(a){return arguments.length?(e?b.domain([Math.max(d.domain[0],a[0]),Math.min(d.domain[1],a[1])]):b.domain(a),c&&c(),f):b.domain()},f.range=function(a){if(!arguments.length)return b.range();throw"zoomable is a read only range. Use this scale for zooming only"},f.copy=function(){return a(b.copy(),c,d,e)},f.clamp=function(a){return arguments.length?(e=a,f):e},f}return a}},{}],61:[function(a,b,c){"use strict";b.exports=function(a){return function(){function b(a,b){var i,j=c(a,b),k=d(a,b),l=e(a,b),m=f(a,b),n=g(a,b),o=h(a,b),p="left"===n||"up"===n?1:-1,q=l/3,r=l/2,s=o?m/2:m;switch(i="M "+j+" "+k,n){case"up":case"down":i+=" l "+-r+" "+p*s+" l "+q+" 0",o&&(i+=" l 0 "+p*s),i+=" l "+q+" 0",o&&(i+=" l 0 "+-p*s),i+=" l "+q+" 0";break;case"left":case"right":i+=" l "+p*s+" "+-r+" l 0 "+q,o&&(i+=" l "+p*s+" 0"),i+=" l 0 "+q,o&&(i+=" l "+-p*s+" 0"),i+=" l 0 "+q;break;default:throw"Unsupported arrow.orient() = "+g}return i+" z"}var c=a(0),d=a(0),e=a(12),f=a(15),g=a("up"),h=a(!0);return b.x=function(d){return arguments.length?(c=a(d),b):c},b.y=function(c){return arguments.length?(d=a(c),b):d},b.height=function(c){return arguments.length?(f=a(c),b):f},b.width=function(c){return arguments.length?(e=a(c),b):e},b.orient=function(c){return arguments.length?(g=a(c),b):g},b.tail=function(c){return arguments.length?(h=a(c),b):h},b}}},{}],62:[function(a,b,c){"use strict";b.exports=function(b){return{arrow:a("./arrow")(a("../util")().functor)}}},{"../util":64,"./arrow":61}],63:[function(a,b,c){"use strict";var d;if("undefined"!=typeof window)d=window.d3;else{if("object"!=typeof b)throw"Unsupported runtime environment: Could not find d3. Ensure defined globally on window, or available as dependency.";d=a("d3")}b.exports=function(b){return{version:a("../build/version"),accessor:a("./accessor")(),indicator:a("./indicator")(b),plot:a("./plot")(b),scale:a("./scale")(b),svg:a("./svg")(b)}}(d)},{"../build/version":1,"./accessor":8,"./indicator":28,"./plot":44,"./scale":59,"./svg":62,d3:"d3"}],64:[function(a,b,c){"use strict";function d(a,b,c){for(var d,f=2,g=arguments.length;++f<g;)a[d=arguments[f]]=e(a,b,b[d],c);return a}function e(a,b,c,d){return function(){var e=c.apply(b,arguments);return d&&e===b&&d(),e===b?a:e}}b.exports=function(){return{rebindCallback:d,rebind:function(a,b){var c=Array.prototype.slice.call(arguments,0);return c.splice(2,0,void 0),d.apply(this,c)},functor:function(a){return"function"==typeof a?a:function(){return a}}}}},{}]},{},[63])(63)});
//# sourceMappingURL=techan.min.js.map

























































/*
    A simple jQuery modal (http://github.com/kylefox/jquery-modal)
    Version 0.7.0
*/
(function($) {

  var modals = [],
      getCurrent = function() {
        return modals.length ? modals[modals.length - 1] : null;
      },
      selectCurrent = function() {
        var i,
            selected = false;
        for (i=modals.length-1; i>=0; i--) {
          if (modals[i].$blocker) {
            modals[i].$blocker.toggleClass('current',!selected).toggleClass('behind',selected);
            selected = true;
          }
        }
      };

  $.modal = function(el, options) {
    var remove, target;
    this.$body = $('body');
    this.options = $.extend({}, $.modal.defaults, options);
    this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10));
    this.$blocker = null;
    if (this.options.closeExisting)
      while ($.modal.isActive())
        $.modal.close(); // Close any open modals.
    modals.push(this);
    if (el.is('a')) {
      target = el.attr('href');
      //Select element by id from href
      if (/^#/.test(target)) {
        this.$elm = $(target);
        if (this.$elm.length !== 1) return null;
        this.$body.append(this.$elm);
        this.open();
      //AJAX
      } else {
        this.$elm = $('<div>');
        this.$body.append(this.$elm);
        remove = function(event, modal) { modal.elm.remove(); };
        this.showSpinner();
        el.trigger($.modal.AJAX_SEND);
        $.get(target).done(function(html) {
          if (!$.modal.isActive()) return;
          el.trigger($.modal.AJAX_SUCCESS);
          var current = getCurrent();
          current.$elm.empty().append(html).on($.modal.CLOSE, remove);
          current.hideSpinner();
          current.open();
          el.trigger($.modal.AJAX_COMPLETE);
        }).fail(function() {
          el.trigger($.modal.AJAX_FAIL);
          var current = getCurrent();
          current.hideSpinner();
          modals.pop(); // remove expected modal from the list
          el.trigger($.modal.AJAX_COMPLETE);
        });
      }
    } else {
      this.$elm = el;
      this.$body.append(this.$elm);
      this.open();
    }
  };

  $.modal.prototype = {
    constructor: $.modal,

    open: function() {
      var m = this;
      this.block();
      if(this.options.doFade) {
        setTimeout(function() {
          if ($.modal.isActive()) {
            m.show();
          };
        }, this.options.fadeDuration * this.options.fadeDelay);
      } else {
        this.show();
      }
      $(document).off('keydown.modal').on('keydown.modal', function(event) {
        var current = getCurrent();
        if (event.which == 27 && current.options.escapeClose) current.close();
      });
      if (this.options.clickClose)
        this.$blocker.click(function(e) {
          if (e.target==this)
            $.modal.close();
        });
    },

    close: function() {
      modals.pop();
      this.unblock();
      this.hide();
      if (!$.modal.isActive())
        $(document).off('keydown.modal');
    },

    block: function() {
      this.$elm.trigger($.modal.BEFORE_BLOCK, [this._ctx()]);
      this.$body.css('overflow','hidden');
      this.$blocker = $('<div class="jquery-modal blocker current"></div>').appendTo(this.$body);
      selectCurrent();
      if(this.options.doFade) {
        this.$blocker.css('opacity',0).animate({opacity: 1}, this.options.fadeDuration);
      }
      this.$elm.trigger($.modal.BLOCK, [this._ctx()]);
    },

    unblock: function(now) {
      if (!now && this.options.doFade)
        this.$blocker.fadeOut(this.options.fadeDuration, this.unblock.bind(this,true));
      else {
        this.$blocker.children().appendTo(this.$body);
        this.$blocker.remove();
        this.$blocker = null;
        selectCurrent();
        if (!$.modal.isActive())
          this.$body.css('overflow','');
      }
    },

    show: function() {
      this.$elm.trigger($.modal.BEFORE_OPEN, [this._ctx()]);
      if (this.options.showClose) {
        this.closeButton = $('<a href="#close-modal" rel="modal:close" class="close-modal ' + this.options.closeClass + '">' + this.options.closeText + '</a>');
        this.$elm.append(this.closeButton);
      }
      this.$elm.addClass(this.options.modalClass).appendTo(this.$blocker);
      if(this.options.doFade) {
        this.$elm.css('opacity',0).show().animate({opacity: 1}, this.options.fadeDuration);
      } else {
        this.$elm.show();
      }
      this.$elm.trigger($.modal.OPEN, [this._ctx()]);
    },

    hide: function() {
      this.$elm.trigger($.modal.BEFORE_CLOSE, [this._ctx()]);
      if (this.closeButton) this.closeButton.remove();
      var _this = this;
      if(this.options.doFade) {
        this.$elm.fadeOut(this.options.fadeDuration, function () {
          _this.$elm.trigger($.modal.AFTER_CLOSE, [_this._ctx()]);
        });
      } else {
        this.$elm.hide(0, function () {
          _this.$elm.trigger($.modal.AFTER_CLOSE, [_this._ctx()]);
        });
      }
      this.$elm.trigger($.modal.CLOSE, [this._ctx()]);
    },

    showSpinner: function() {
      if (!this.options.showSpinner) return;
      this.spinner = this.spinner || $('<div class="' + this.options.modalClass + '-spinner"></div>')
        .append(this.options.spinnerHtml);
      this.$body.append(this.spinner);
      this.spinner.show();
    },

    hideSpinner: function() {
      if (this.spinner) this.spinner.remove();
    },

    //Return context for custom events
    _ctx: function() {
      return { elm: this.$elm, $blocker: this.$blocker, options: this.options };
    }
  };

  $.modal.close = function(event) {
    if (!$.modal.isActive()) return;
    if (event) event.preventDefault();
    var current = getCurrent();
    current.close();
    return current.$elm;
  };

  // Returns if there currently is an active modal
  $.modal.isActive = function () {
    return modals.length > 0;
  }

  $.modal.defaults = {
    closeExisting: true,
    escapeClose: true,
    clickClose: true,
    closeText: 'Close',
    closeClass: '',
    modalClass: "modal",
    spinnerHtml: null,
    showSpinner: true,
    showClose: true,
    fadeDuration: 200,   // Number of milliseconds the fade animation takes.
    fadeDelay: 1.0        // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
  };

  // Event constants
  $.modal.BEFORE_BLOCK = 'modal:before-block';
  $.modal.BLOCK = 'modal:block';
  $.modal.BEFORE_OPEN = 'modal:before-open';
  $.modal.OPEN = 'modal:open';
  $.modal.BEFORE_CLOSE = 'modal:before-close';
  $.modal.CLOSE = 'modal:close';
  $.modal.AFTER_CLOSE = 'modal:after-close';
  $.modal.AJAX_SEND = 'modal:ajax:send';
  $.modal.AJAX_SUCCESS = 'modal:ajax:success';
  $.modal.AJAX_FAIL = 'modal:ajax:fail';
  $.modal.AJAX_COMPLETE = 'modal:ajax:complete';

  $.fn.modal = function(options){
    if (this.length === 1) {
      new $.modal(this, options);
    }
    return this;
  };

  // Automatically bind links with rel="modal:close" to, well, close the modal.
  $(document).on('click.modal', 'a[rel="modal:close"]', $.modal.close);
  $(document).on('click.modal', 'a[rel="modal:open"]', function(event) {
    event.preventDefault();
    $(this).modal();
  });
})(jQuery);


























































// Blake2B in pure Javascript
// Adapted from the reference implementation in RFC7693
// Ported to Javascript by DC - https://github.com/dcposch

/* util */
var ERROR_MSG_INPUT = 'Input must be an string, Buffer or Uint8Array'

// For convenience, let people hash a string, not just a Uint8Array
function normalizeInput (input) {
    var ret
    if (input instanceof Uint8Array) {
        ret = input
    } else if (input instanceof Buffer) {
        ret = new Uint8Array(input)
    } else if (typeof (input) === 'string') {
        ret = new Uint8Array(new Buffer(input, 'utf8'))
    } else {
        throw new Error(ERROR_MSG_INPUT)
    }
    return ret
}

// Converts a Uint8Array to a hexadecimal string
// For example, toHex([255, 0, 255]) returns "ff00ff"
function toHex (bytes) {
    return Array.prototype.map.call(bytes, function (n) {
        return (n < 16 ? '0' : '') + n.toString(16)
    }).join('')
}

// Converts any value in [0...2^32-1] to an 8-character hex string
function uint32ToHex (val) {
    return (0x100000000 + val).toString(16).substring(1)
}

// For debugging: prints out hash state in the same format as the RFC
// sample computation exactly, so that you can diff
function debugPrint (label, arr, size) {
    var msg = '\n' + label + ' = '
    for (var i = 0; i < arr.length; i += 2) {
        if (size === 32) {
            msg += uint32ToHex(arr[i]).toUpperCase()
            msg += ' '
            msg += uint32ToHex(arr[i + 1]).toUpperCase()
        } else if (size === 64) {
            msg += uint32ToHex(arr[i + 1]).toUpperCase()
            msg += uint32ToHex(arr[i]).toUpperCase()
        } else throw new Error('Invalid size ' + size)
        if (i % 6 === 4) {
            msg += '\n' + new Array(label.length + 4).join(' ')
        } else if (i < arr.length - 2) {
            msg += ' '
        }
    }
    console.log(msg)
}

// For performance testing: generates N bytes of input, hashes M times
// Measures and prints MB/second hash performance each time
function testSpeed (hashFn, N, M) {
    var startMs = new Date().getTime()

    var input = new Uint8Array(N)
    for (var i = 0; i < N; i++) {
        input[i] = i % 256
    }
    var genMs = new Date().getTime()
    console.log('Generated random input in ' + (genMs - startMs) + 'ms')
    startMs = genMs

    for (i = 0; i < M; i++) {
        var hashHex = hashFn(input)
        var hashMs = new Date().getTime()
        var ms = hashMs - startMs
        startMs = hashMs
        console.log('Hashed in ' + ms + 'ms: ' + hashHex.substring(0, 20) + '...')
        console.log(Math.round(N / (1 << 20) / (ms / 1000) * 100) / 100 + ' MB PER SECOND')
    }
}


/********/

// 64-bit unsigned addition
// Sets v[a,a+1] += v[b,b+1]
// v should be a Uint32Array
function ADD64AA (v, a, b) {
    var o0 = v[a] + v[b]
    var o1 = v[a + 1] + v[b + 1]
    if (o0 >= 0x100000000) {
        o1++
    }
    v[a] = o0
    v[a + 1] = o1
}

// 64-bit unsigned addition
// Sets v[a,a+1] += b
// b0 is the low 32 bits of b, b1 represents the high 32 bits
function ADD64AC (v, a, b0, b1) {
    var o0 = v[a] + b0
    if (b0 < 0) {
        o0 += 0x100000000
    }
    var o1 = v[a + 1] + b1
    if (o0 >= 0x100000000) {
        o1++
    }
    v[a] = o0
    v[a + 1] = o1
}

// Little-endian byte access
function B2B_GET32 (arr, i) {
    return (arr[i] ^
    (arr[i + 1] << 8) ^
    (arr[i + 2] << 16) ^
    (arr[i + 3] << 24))
}

// G Mixing function
// The ROTRs are inlined for speed
function B2B_G (a, b, c, d, ix, iy) {
    var x0 = m[ix]
    var x1 = m[ix + 1]
    var y0 = m[iy]
    var y1 = m[iy + 1]

    ADD64AA(v, a, b) // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
    ADD64AC(v, a, x0, x1) // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
    var xor0 = v[d] ^ v[a]
    var xor1 = v[d + 1] ^ v[a + 1]
    v[d] = xor1
    v[d + 1] = xor0

    ADD64AA(v, c, d)

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
    xor0 = v[b] ^ v[c]
    xor1 = v[b + 1] ^ v[c + 1]
    v[b] = (xor0 >>> 24) ^ (xor1 << 8)
    v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8)

    ADD64AA(v, a, b)
    ADD64AC(v, a, y0, y1)

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
    xor0 = v[d] ^ v[a]
    xor1 = v[d + 1] ^ v[a + 1]
    v[d] = (xor0 >>> 16) ^ (xor1 << 16)
    v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16)

    ADD64AA(v, c, d)

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
    xor0 = v[b] ^ v[c]
    xor1 = v[b + 1] ^ v[c + 1]
    v[b] = (xor1 >>> 31) ^ (xor0 << 1)
    v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1)
}

// Initialization Vector
var BLAKE2B_IV32 = new Uint32Array([
    0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
    0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
    0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
    0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
])

var SIGMA8 = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
    11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
    7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
    9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
    2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
    12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
    13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
    6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
    10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3
]

// These are offsets into a uint64 buffer.
// Multiply them all by 2 to make them offsets into a uint32 buffer,
// because this is Javascript and we don't have uint64s
var SIGMA82 = new Uint8Array(SIGMA8.map(function (x) { return x * 2 }))

// Compression function. 'last' flag indicates last block.
// Note we're representing 16 uint64s as 32 uint32s
var v = new Uint32Array(32)
var m = new Uint32Array(32)
function blake2b_compress (ctx, last) {
    var i = 0

    // init work variables
    for (i = 0; i < 16; i++) {
        v[i] = ctx.h[i]
        v[i + 16] = BLAKE2B_IV32[i]
    }

    // low 64 bits of offset
    v[24] = v[24] ^ ctx.t
    v[25] = v[25] ^ (ctx.t / 0x100000000)
    // high 64 bits not supported, offset may not be higher than 2**53-1

    // last block flag set ?
    if (last) {
        v[28] = ~v[28]
        v[29] = ~v[29]
    }

    // get little-endian words
    for (i = 0; i < 32; i++) {
        m[i] = B2B_GET32(ctx.b, 4 * i)
    }

    // twelve rounds of mixing
    // uncomment the DebugPrint calls to log the computation
    // and match the RFC sample documentation
    // util.debugPrint('          m[16]', m, 64)
    for (i = 0; i < 12; i++) {
        // util.debugPrint('   (i=' + (i < 10 ? ' ' : '') + i + ') v[16]', v, 64)
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1])
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3])
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5])
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7])
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9])
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11])
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13])
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15])
    }
    // util.debugPrint('   (i=12) v[16]', v, 64)

    for (i = 0; i < 16; i++) {
        ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16]
    }
    // util.debugPrint('h[8]', ctx.h, 64)
}

// Creates a BLAKE2b hashing context
// Requires an output length between 1 and 64 bytes
// Takes an optional Uint8Array key
function blake2b_init (outlen, key) {
    if (outlen === 0 || outlen > 64) {
        throw new Error('Illegal output length, expected 0 < length <= 64')
    }
    if (key && key.length > 64) {
        throw new Error('Illegal key, expected Uint8Array with 0 < length <= 64')
    }

    // state, 'param block'
    var ctx = {
        b: new Uint8Array(128),
        h: new Uint32Array(16),
        t: 0, // input count
        c: 0, // pointer within buffer
        outlen: outlen // output length in bytes
    }

    // initialize hash state
    for (var i = 0; i < 16; i++) {
        ctx.h[i] = BLAKE2B_IV32[i]
    }
    var keylen = key ? key.length : 0
    ctx.h[0] ^= 0x01010000 ^ (keylen << 8) ^ outlen

    // key the hash, if applicable
    if (key) {
        blake2b_update(ctx, key)
        // at the end
        ctx.c = 128
    }

    return ctx
}

// Updates a BLAKE2b streaming hash
// Requires hash context and Uint8Array (byte array)
function blake2b_update (ctx, input) {
    for (var i = 0; i < input.length; i++) {
        if (ctx.c === 128) { // buffer full ?
            ctx.t += ctx.c // add counters
            blake2b_compress(ctx, false) // compress (not last)
            ctx.c = 0 // counter to zero
        }
        ctx.b[ctx.c++] = input[i]
    }
}

// Completes a BLAKE2b streaming hash
// Returns a Uint8Array containing the message digest
function blake2b_final (ctx) {
    ctx.t += ctx.c // mark last block offset

    while (ctx.c < 128) { // fill up with zeros
        ctx.b[ctx.c++] = 0
    }
    blake2b_compress(ctx, true) // final block flag = 1

    // little endian convert and store
    var out = new Uint8Array(ctx.outlen)
    for (var i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> (8 * (i & 3))
    }
    return out
}

// Computes the BLAKE2B hash of a string or byte array, and returns a Uint8Array
//
// Returns a n-byte Uint8Array
//
// Parameters:
// - input - the input bytes, as a string, Buffer or Uint8Array
// - key - optional key Uint8Array, up to 64 bytes
// - outlen - optional output length in bytes, default 64
function blake2b (input, key, outlen) {
    // preprocess inputs
    outlen = outlen || 64
    input = normalizeInput(input)

    // do the math
    var ctx = blake2b_init(outlen, key)
    blake2b_update(ctx, input)
    return blake2b_final(ctx)
}

// Computes the BLAKE2B hash of a string or byte array
//
// Returns an n-byte hash in hex, all lowercase
//
// Parameters:
// - input - the input bytes, as a string, Buffer, or Uint8Array
// - key - optional key Uint8Array, up to 64 bytes
// - outlen - optional output length in bytes, default 64
function blake2bHex (input, key, outlen) {
    var output = blake2b(input, key, outlen)
    return toHex(output)
}
