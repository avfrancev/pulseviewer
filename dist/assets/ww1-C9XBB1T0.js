(function() {
  "use strict";
  /**
          @file Hexbuffer JS.
  
          @author Christian W. Zuckschwerdt <zany@triq.net>
          @copyright Christian W. Zuckschwerdt, 2020
          @license
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU General Public License as published by
          the Free Software Foundation, either version 2 of the License, or
          (at your option) any later version.
      */
  function dec2hex(i, w = 2) {
    return (i + 65536).toString(16).substr(-w).toUpperCase();
  }
  class Hexbuffer {
    constructor(line = "") {
      this.fromString(line);
    }
    fromString(s) {
      this.line = s.replace(/\s/g, "");
      this.index = 0;
    }
    hasNibble() {
      return this.index + 1 <= this.line.length;
    }
    hasByte() {
      return this.index + 2 <= this.line.length;
    }
    hasWord() {
      return this.index + 4 <= this.line.length;
    }
    peekNibble() {
      return parseInt(this.line.substr(this.index, 1), 16);
    }
    peekByte() {
      return parseInt(this.line.substr(this.index, 2), 16);
    }
    peekWord() {
      return parseInt(this.line.substr(this.index, 4), 16);
    }
    getNibble() {
      const r = parseInt(this.line.substr(this.index, 1), 16);
      this.index += 1;
      return r;
    }
    getByte() {
      const r = parseInt(this.line.substr(this.index, 2), 16);
      this.index += 2;
      return r;
    }
    getWord() {
      const r = parseInt(this.line.substr(this.index, 4), 16);
      this.index += 4;
      return r;
    }
    pushNibble(v) {
      this.line += dec2hex(v, 1);
    }
    pushByte(v) {
      this.line += dec2hex(v, 2);
    }
    pushWord(v) {
      this.line += dec2hex(v, 4);
    }
  }
  /**
          @file Histogram JS.
  
          @author Christian W. Zuckschwerdt <zany@triq.net>
          @copyright Christian W. Zuckschwerdt, 2020
          @license
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU General Public License as published by
          the Free Software Foundation, either version 2 of the License, or
          (at your option) any later version.
      */
  class Bin {
    constructor(num) {
      if (typeof num !== "undefined") {
        this.count = 1;
        this.sum = num;
        this.mean = num;
        this.devi = 0;
        this.min = num;
        this.max = num;
      } else {
        this.count = 0;
        this.sum = 0;
        this.mean = null;
        this.devi = 0;
        this.min = null;
        this.max = null;
      }
    }
    add(num) {
      this.count++;
      this.sum += num;
      this.mean = this.sum / this.count;
      this.min = this.min === null ? num : Math.min(num, this.min);
      this.max = this.max === null ? num : Math.max(num, this.max);
      this.devi = (this.max - this.min) / 2;
    }
    fuse(bin) {
      this.count += bin.count;
      this.sum += bin.sum;
      this.mean = this.sum / this.count;
      this.min = Math.min(this.min, bin.min);
      this.max = Math.max(this.max, bin.max);
      this.devi = (this.max - this.min) / 2;
    }
    contains(num) {
      return num >= this.min && num <= this.max;
    }
  }
  class Histogram {
    constructor(data, tolerance = 0.2) {
      this.max_hist_bins = 16;
      this.bins = [];
      this.histogram_sum(data, tolerance);
    }
    get length() {
      return this.bins.length;
    }
    /// Generate a histogram (unsorted)
    histogram_sum(data, tolerance = 0.2) {
      const len = data.length;
      for (let n = 0; n < len; ++n) {
        let bin;
        for (bin = 0; bin < this.bins.length; ++bin) {
          const bn = data[n];
          const bm = this.bins[bin].mean;
          if (Math.abs(bn - bm) < tolerance * Math.max(bn, bm)) {
            this.bins[bin].add(data[n]);
            break;
          }
        }
        if (bin == this.bins.length && bin < this.max_hist_bins) {
          this.bins.push(new Bin(data[n]));
        }
      }
    }
    /// Delete bin from histogram
    delete_bin(index) {
      this.bins.splice(index, 1);
    }
    /// Swap two bins in histogram
    swap_bins(index1, index2) {
      if (index1 < this.bins.length && index2 < this.bins.length) {
        const tempbin = this.bins[index1];
        this.bins[index1] = this.bins[index2];
        this.bins[index2] = tempbin;
      }
    }
    /// Sort histogram with mean value (order lowest to highest)
    sort_mean() {
      if (this.bins.length < 2) return;
      for (let n = 0; n < this.bins.length - 1; ++n) {
        for (let m = n + 1; m < this.bins.length; ++m) {
          if (this.bins[m].mean < this.bins[n].mean) {
            this.swap_bins(m, n);
          }
        }
      }
    }
    /// Sort histogram with count value (order lowest to highest)
    sort_count() {
      if (this.bins.length < 2) return;
      for (let n = 0; n < this.bins.length - 1; ++n) {
        for (let m = n + 1; m < this.bins.length; ++m) {
          if (this.bins[m].count < this.bins[n].count) {
            this.swap_bins(m, n);
          }
        }
      }
    }
    /// Fuse histogram bins with means within tolerance
    fuse_bins(tolerance = 0.2) {
      if (this.bins.length < 2) return;
      for (let n = 0; n < this.bins.length - 1; ++n) {
        for (let m = n + 1; m < this.bins.length; ++m) {
          const bn = this.bins[n].mean;
          const bm = this.bins[m].mean;
          if (Math.abs(bn - bm) < tolerance * Math.max(bn, bm)) {
            this.bins[n].fuse(this.bins[m]);
            this.delete_bin(m);
            m--;
          }
        }
      }
    }
    /// Trim zero-width bins
    trim_bins(tolerance = 0) {
      for (let n = 0; n < this.bins.length; ++n) {
        if (this.bins[n].mean <= tolerance) {
          this.delete_bin(n);
        }
      }
    }
    /// Find bin index
    find_bin_index(width) {
      for (let n = 0; n < this.bins.length; ++n) {
        if (this.bins[n].contains(width)) {
          return n;
        }
      }
      return -1;
    }
    /// Print a histogram
    console_print() {
      for (let n = 0; n < this.bins.length; ++n) {
        const b = this.bins[n];
        console.log(`[${n}] ${b.count} × ${b.mean.toFixed(1)} ±${b.devi.toFixed(1)} µs [${b.min};${b.max}]`);
      }
    }
    string_print(separator = ", ") {
      let ret = [];
      for (let n = 0; n < this.bins.length; ++n) {
        const b = this.bins[n];
        ret.push(`${b.count}× ${b.mean.toFixed(1)} <small>±${b.devi.toFixed(1)}</small> µs`);
      }
      return ret.join(separator);
    }
  }
  class Analyzer {
    constructor(data, tolerance = 0.2) {
      this.analyse_pulses(data, tolerance);
      this.create_rfraw(data);
    }
    /// Create histograms from pulse data
    analyse_pulses(data, messages, tolerance = 0.2) {
      this.pulses = [];
      this.gaps = [];
      this.periods = [];
      this.pulse_sum = 0;
      this.gap_sum = 0;
      for (let j = 0; j < data.length - 2; j += 2) {
        const m2 = data[j];
        const s = data[j + 1];
        this.pulses.push(m2);
        this.gaps.push(s);
        this.periods.push(m2 + s);
        this.pulse_sum += m2;
        this.gap_sum += s;
      }
      const m = data[data.length - 2];
      this.pulses.push(m);
      this.pulse_sum += m;
      this.pulse_gap_ratio = this.pulse_sum / this.gap_sum;
      this.pulse_gap_skew = this.pulse_gap_ratio - 1;
      this.hist_pulses = new Histogram(this.pulses, tolerance);
      this.hist_gaps = new Histogram(this.gaps, tolerance);
      this.hist_periods = new Histogram(this.periods, tolerance);
      this.hist_timings = new Histogram(data, tolerance);
      this.hist_pulses.trim_bins(tolerance);
      this.hist_gaps.trim_bins(tolerance);
      this.hist_periods.trim_bins(tolerance);
      this.hist_timings.trim_bins(tolerance);
      this.hist_pulses.fuse_bins(tolerance);
      this.hist_gaps.fuse_bins(tolerance);
      this.hist_periods.fuse_bins(tolerance);
      this.hist_timings.fuse_bins(tolerance);
    }
    guess() {
      const pulses = this.hist_pulses;
      const gaps = this.hist_gaps;
      const periods = this.hist_periods;
      pulses.sort_mean();
      gaps.sort_mean();
      if (pulses.bins.length > 0 && pulses.bins[0].mean == 0) {
        pulses.delete_bin(0);
      }
      if (this.pulses.length == 1) {
        return {
          name: "Single pulse detected. Probably Frequency Shift Keying or just noise..."
        };
      } else if (pulses.length == 1 && gaps.length == 1) {
        return {
          name: "Un-modulated signal. Maybe a preamble..."
        };
      } else if (pulses.length == 1 && gaps.length > 1) {
        return {
          name: "Pulse Position Modulation with fixed pulse width",
          modulation: "PPM",
          short: gaps.bins[0].mean,
          long: gaps.bins[1].mean,
          gap: gaps.bins[1].max * 1.2,
          // Set limit above next lower gap
          reset: gaps.bins[gaps.length - 1].max * 1.2
          // Set limit above biggest gap
        };
      } else if (pulses.length == 2 && gaps.length == 1) {
        const short = pulses.bins[0].mean;
        const long = pulses.bins[1].mean;
        return {
          name: "Pulse Width Modulation with fixed gap",
          modulation: "PWM",
          short,
          long,
          tolerance: (long - short) * 0.4,
          reset: gaps.bins[gaps.length - 1].max * 1.2
          // Set limit above biggest gap
        };
      } else if (pulses.length == 2 && gaps.length == 2 && periods.length == 1) {
        const short = pulses.bins[0].mean;
        const long = pulses.bins[1].mean;
        return {
          name: "Pulse Width Modulation with fixed period",
          modulation: "PWM",
          short,
          long,
          tolerance: (long - short) * 0.4,
          reset: gaps.bins[gaps.length - 1].max * 1.2
          // Set limit above biggest gap
        };
      } else if (pulses.length == 2 && gaps.length == 2 && periods.length == 3) {
        const short = pulses.bins[0].mean;
        return {
          name: "Manchester coding (PCM)",
          modulation: "MC",
          short,
          // Assume shortest pulse is half period
          long: short,
          // Not used
          reset: gaps.bins[gaps.length - 1].max * 1.2
          // Set limit above biggest gap
        };
      } else if (pulses.length == 2 && gaps.length >= 3) {
        const short = pulses.bins[0].mean;
        const long = pulses.bins[1].mean;
        return {
          name: "Pulse Width Modulation with multiple packets",
          modulation: "PWM",
          short,
          long,
          gap: gaps.bins[1].max * 1.2,
          // Set limit above second gap
          tolerance: (long - short) * 0.4,
          reset: gaps.bins[gaps.length - 1].max * 1.2
          // Set limit above biggest gap
        };
      } else if (pulses.length >= 3 && gaps.length >= 3 && Math.abs(pulses.bins[1].mean - 2 * pulses.bins[0].mean) <= pulses.bins[0].mean / 8 && Math.abs(pulses.bins[2].mean - 3 * pulses.bins[0].mean) <= pulses.bins[0].mean / 8 && Math.abs(gaps.bins[0].mean - pulses.bins[0].mean) <= pulses.bins[0].mean / 8 && Math.abs(gaps.bins[1].mean - 2 * pulses.bins[0].mean) <= pulses.bins[0].mean / 8 && Math.abs(gaps.bins[2].mean - 3 * pulses.bins[0].mean) <= pulses.bins[0].mean / 8) {
        return {
          name: "Pulse Code Modulation (Not Return to Zero)",
          modulation: "PCM",
          short: pulses.bins[0].mean,
          // Shortest pulse is bit width
          long: pulses.bins[0].mean,
          // Bit period equal to pulse length (NRZ)
          reset: pulses.bins[0].mean * 1024
          // No limit to run of zeros...
        };
      } else if (pulses.length == 3) {
        pulses.sort_count();
        const p1 = pulses.bins[1].mean;
        const p2 = pulses.bins[2].mean;
        const short = p1 < p2 ? p1 : p2;
        const long = p1 < p2 ? p2 : p1;
        return {
          name: "Pulse Width Modulation with sync/delimiter",
          modulation: "PWM",
          short,
          long,
          sync: pulses.bins[0].mean,
          // Set to lowest count pulse width
          reset: gaps.bins[gaps.length - 1].max * 1.2
          // Set limit above biggest gap
        };
      } else {
        return {
          name: "No clue..."
        };
      }
    }
    create_rfraw(data) {
      const timings = this.hist_timings;
      if (timings.bins.length < 1) {
        return "";
      }
      if (timings.bins.length > 8) {
        return "";
      }
      if (data.length > 494) {
        return "";
      }
      let raw = new Hexbuffer();
      for (let b of timings.bins) {
        raw.pushWord(b.mean);
      }
      for (let j = 0; j < data.length - 1; j += 2) {
        const m = data[j];
        const s = data[j + 1];
        const mi = timings.find_bin_index(m);
        if (mi >= 0) {
          raw.pushNibble(mi | 8);
        } else if (m == 0) ;
        else {
          console.error("RfRaw encoding mark bucket not found:", m, mi);
        }
        const si = timings.find_bin_index(s);
        if (si >= 0) {
          raw.pushNibble(si);
        } else if (s == 0) ;
        else {
          console.error("RfRaw encoding space bucket not found:", s, si);
        }
      }
      if (raw.line.length % 2) {
        raw.pushNibble(0);
      }
      raw.pushByte(85);
      let raw0 = new Hexbuffer();
      raw0.pushByte(170);
      raw0.pushByte(176);
      raw0.pushByte(2 + raw.line.length / 2 - 1);
      raw0.pushByte(timings.bins.length);
      raw0.pushByte(1);
      let raw1 = new Hexbuffer();
      raw1.pushByte(170);
      raw1.pushByte(177);
      raw1.pushByte(timings.bins.length);
      this.rfrawB0 = raw0.line + raw.line;
      this.rfrawB1 = raw1.line + raw.line;
    }
    console_log() {
      const guess = this.guess();
      console.log("Analyzing pulses...");
      console.log(`Total count: ${this.pulses.length}`);
      console.log("Pulse width distribution:");
      this.hist_pulses.console_print();
      console.log("Gap width distribution:");
      this.hist_gaps.console_print();
      console.log("Pulse period distribution:");
      this.hist_periods.console_print();
      console.log("Pulse timing distribution:");
      this.hist_timings.console_print();
      console.log(`DC bias (Pulse/Gap skew): ${(this.pulse_gap_skew * 100).toFixed(1)}`);
      console.log("Guessing modulation:");
      console.log(guess);
    }
    print_plain(messages) {
      const guess = this.guess();
      messages.innerHTML = `
        <div>Pulses: ${this.hist_pulses.string_print()}</div>
        <div>Gaps: ${this.hist_gaps.string_print()}</div>
        <div>Periods: ${this.hist_periods.string_print()}</div>
        <div>Timings: ${this.hist_timings.string_print()}</div>
        <div>${guess.name}</div>
        `;
    }
    /*
    const locale = new Intl.NumberFormat().resolvedOptions().locale
    const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        signDisplay: 'exceptZero',
        maximumFractionDigits: 1,
    })
    formatter.format(0.5)
    */
    print(timings, messages) {
      const guess = this.guess();
      if (timings) {
        timings.innerHTML = `<table>
            <tr><th>Pulses</th><td>${this.hist_pulses.string_print("</td><td>")}</td></tr>
            <tr><th>Gaps</th><td>${this.hist_gaps.string_print("</td><td>")}</td></tr>
            <tr><th>Periods</th><td>${this.hist_periods.string_print("</td><td>")}</td></tr>
            <tr><th>Timings</th><td>${this.hist_timings.string_print("</td><td>")}</td></tr>
            </table>
            `;
      }
      if (messages) {
        messages.innerHTML = `
            <div><small>DC bias (Pulse/Gap skew): ${(this.pulse_gap_skew * 100).toFixed(1)}%</small><br>
            Guessing modulation: <strong>${guess.name}</strong><br>
            modulation: <strong>${guess.modulation}</strong>
            short: <strong>${guess.short ? guess.short.toFixed(1) : "-"}</strong>
            long: <strong>${guess.long ? guess.long.toFixed(1) : "-"}</strong>
            sync: <strong>${guess.sync ? guess.sync.toFixed(1) : "-"}</strong>
            gap: <strong>${guess.gap ? guess.gap.toFixed(1) : "-"}</strong>
            reset: <strong>${guess.reset ? guess.reset.toFixed(1) : "-"}</strong><br>
            <small>RfRaw (rx): <strong>${this.rfrawB1 ? this.rfrawB1 : "-"}</strong></small><br>
            <small>RfRaw (tx): <strong>${this.rfrawB0 ? this.rfrawB0 : "-"}</strong></small>
            </div>
            `;
      }
    }
  }
  onmessage = function(e) {
    console.log(Analyzer);
    console.log(new Analyzer([24, 24, 24, 44, 25, 54, 5, 235, 235]));
    console.log("Worker: Message received from main script");
    const result = e.data[0] * e.data[1];
    if (isNaN(result)) {
      postMessage("Please write two numbers");
    } else {
      const workerResult = "Result: " + result;
      console.log("Worker: Posting message back to main script");
      postMessage(workerResult);
    }
  };
})();
