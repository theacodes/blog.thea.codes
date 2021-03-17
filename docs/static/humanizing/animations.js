function start_animations() {
  "use strict";
  const padding_x = 30;
  const padding_y = 30;
  const font_name = "'IBM Plex Mono'";
  const primary_font = `italic 25px ${font_name}`;
  const alt_font = `25px ${font_name}`;
  const info_font = `italic 30px ${font_name}`;

  class Grapher {
    constructor(canvas_elem_id) {
      this.canvas = document.getElementById(canvas_elem_id);
      this.ctx = this.canvas.getContext("2d");
      this.canvas_width = this.canvas.width;
      this.canvas_height = this.canvas.height;
      this.bottom_left_x = padding_x;
      this.bottom_left_y = this.canvas.height - padding_y;
      this.bottom_right_x = this.canvas.width - padding_x;
      this.bottom_right_y = this.canvas.height - padding_y;
      this.top_left_x = padding_x;
      this.top_left_y = padding_y;
      this.top_right_x = this.canvas.width - padding_x;
      this.top_right_y = padding_y;
      this.width = this.bottom_right_x - this.bottom_left_x;
      this.height = this.bottom_left_y - this.top_left_y;
      this.graph_offset = 10;

      this.ctx.strokeStyle = "teal";
      this.ctx.lineWidth = 8;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";

      this.centered = false;
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
    }

    draw_frame(x_label = "input", y_label = "output") {
      const ctx = this.ctx;

      ctx.save();
      ctx.strokeStyle = "#333333";
      ctx.fillStyle = "#333333";
      ctx.lineWidth = 2;
      ctx.font = primary_font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.beginPath();
      ctx.moveTo(this.bottom_left_x, this.bottom_left_y);
      ctx.lineTo(this.bottom_right_x, this.bottom_right_y);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.bottom_right_x - 20, this.bottom_right_y);
      ctx.lineTo(this.bottom_right_x - 30, this.bottom_right_y - 10);
      ctx.lineTo(this.bottom_right_x, this.bottom_right_y);
      ctx.lineTo(this.bottom_right_x - 30, this.bottom_right_y + 10);
      ctx.lineTo(this.bottom_right_x - 20, this.bottom_right_y);
      ctx.closePath();
      ctx.fill();

      this.clear_text_area(
        this.bottom_left_x + this.width / 2,
        this.bottom_left_y,
        x_label
      );
      ctx.fillText(
        x_label,
        this.bottom_left_x + this.width / 2,
        this.bottom_left_y
      );

      ctx.beginPath();
      ctx.moveTo(this.bottom_left_x, this.bottom_left_y);
      ctx.lineTo(this.top_left_x, this.top_left_y);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.top_left_x, this.top_left_y + 20);
      ctx.lineTo(this.top_left_x - 10, this.top_left_y + 30);
      ctx.lineTo(this.top_left_x, this.top_left_y);
      ctx.lineTo(this.top_left_x + 10, this.top_left_y + 30);
      ctx.lineTo(this.top_left_x, this.top_left_y + 20);
      ctx.closePath();
      ctx.fill();

      if (this.centered) {
        ctx.strokeStyle = "#AAAAAA";
        ctx.beginPath();
        ctx.setLineDash([5, 20]);
        ctx.moveTo(this.top_left_x, this.top_left_y + this.height / 2);
        ctx.lineTo(this.bottom_right_x, this.top_left_y + this.height / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        this.mask_out(
          this.top_right_x - padding_x / 2,
          this.top_right_y + this.height / 2,
          30
        );
        ctx.fillStyle = "#888888";
        ctx.font = alt_font;
        ctx.fillText(
          "+",
          this.top_right_x - padding_x / 2,
          this.top_right_y + this.height / 2 - 60
        );
        ctx.fillText(
          "0",
          this.top_right_x - padding_x / 2,
          this.top_right_y + this.height / 2
        );
        ctx.fillText(
          "-",
          this.top_right_x - padding_x / 2,
          this.top_right_y + this.height / 2 + 60
        );
        ctx.font = primary_font;
      }

      ctx.fillStyle = "#333333";
      ctx.translate(this.top_left_x - 2, this.top_left_y + this.height / 2 + 5);
      ctx.rotate(-Math.PI / 2);
      this.clear_text_area(0, 0, y_label, 20, 0.8, 100, 1.5, 1);
      ctx.fillText(y_label, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.restore();
    }

    mask_out(x, y, size = 50, extent = 80) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      let gradient = ctx.createRadialGradient(x, y, size, x, y, extent);
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, extent, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }

    plot_function(func, color = "#408C94") {
      const max_width = this.width - this.graph_offset * 0.96;
      const max_height = this.height - this.graph_offset * 0.96;
      const left = this.bottom_left_x + (this.centered ? this.graph_offset : 0);
      const top = this.top_left_y;
      const bottom = this.bottom_left_y;
      let origin = 0;
      let mult = 1.0;

      if (this.centered) {
        origin = this.height / 2;
        mult = 0.5;
      }

      this.ctx.strokeStyle = color;
      this.ctx.beginPath();
      for (let t = 0; t <= 1.0; t += 1 / this.width) {
        let out = func(t);
        let x = left + Math.min(t * max_width, max_width);
        let y = bottom - origin - out * mult * max_height;
        if (y > bottom) y = bottom;
        if (y < top) y = top;
        t == 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }

    plot_crossing(x_in, y_in, color="rgb(66, 155, 245)", size=15) {
      const max_width = this.width - this.graph_offset * 0.96;
      const max_height = this.height - this.graph_offset * 0.96;
      const left = this.bottom_left_x + (this.centered ? this.graph_offset : 0);
      const bottom = this.bottom_left_y;
      let origin = 0;
      let mult = 1.0;

      if (this.centered) {
        origin = this.height / 2;
        mult = 0.5;
      }

      let x = left + Math.min(x_in * max_width, max_width);
      let y = bottom - origin - y_in * mult * max_height;

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    clear_text_area(
      x,
      y,
      text,
      line_width = 20,
      alpha = 0.8,
      blur = 100,
      x_mult = 2,
      y_mult = 1
    ) {
      let extents = this.ctx.measureText(text);
      this.ctx.save();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = line_width;
      this.ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
      this.ctx.fillStyle = "black";
      this.ctx.shadowColor = "black";
      this.ctx.shadowBlur = blur;
      this.ctx.beginPath();
      this.ctx.rect(
        x - extents.actualBoundingBoxLeft * x_mult,
        y - extents.actualBoundingBoxAscent * y_mult,
        (Math.abs(extents.actualBoundingBoxLeft) +
          Math.abs(extents.actualBoundingBoxRight)) *
          x_mult,
        (extents.actualBoundingBoxAscent + extents.actualBoundingBoxDescent) *
          y_mult
      );

      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.restore();
    }

    draw_info(text) {
      this.ctx.font = info_font;
      this.ctx.textBaseline = "top";
      this.ctx.textAlign = "left";
      this.clear_text_area(
        this.top_left_x + padding_x,
        this.top_left_y,
        text,
        20,
        0.8,
        100,
        1,
        1
      );
      this.ctx.fillStyle = "black";
      this.ctx.fillText(text, this.top_left_x + padding_x, this.top_left_y);
    }
  }

  class PlayPause {
    constructor(btn_id, update_animation) {
      this.update_animation = update_animation;
      this.btn = document.getElementById(btn_id);
      this.playing = false;
      this.start_time = performance.now();
      this.btn.addEventListener("click", () => this.on_click());
    }

    on_click() {
      this.playing = !this.playing;
      this.start_time = performance.now();

      if(this.playing) {
        this.btn.innerText = "Stop";
        this.btn.classList.remove("btn-primary");
        this.btn.classList.add("btn-secondary");
        this.update_animation();
      } else {
        this.btn.innerText = "Play";
        this.btn.classList.remove("btn-secondary");
        this.btn.classList.add("btn-primary");
      }
    }

    now() {
      return performance.now() - this.start_time;
    }
  }

  function params_from_form(form_elem) {
    let output = {};
    new FormData(form_elem).forEach(function (value, key) {
      output[key] = value;
    });
    return output;
  }

  function form_driven_canvas(form_elem_id, draw_func) {
    const form_elem = document.getElementById(form_elem_id);
    form_elem.addEventListener("input", (e) =>
      draw_func(params_from_form(form_elem))
    );
    draw_func(params_from_form(form_elem));
  }

  function calculator_form(form_elem_id, calc_func) {
    const form = document.getElementById(form_elem_id);

    function update() {
      form.output.value = calc_func(form);
    }

    form.addEventListener("input", (e) => update());
    update();
  }

  function draw_response_heatmap(canvas, color, func, selected) {
    const ctx = canvas.getContext("2d");
    const iterations = 40;
    const radius = canvas.height * 0.4;
    const padding = radius * 1.3;

    ctx.lineWidth = 2.2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let n = 0; n < iterations + 1; n++) {
      const progress = n / iterations;
      const output = func(progress);
      const alpha = Math.max(0.2, 1.0 - Math.abs(progress - selected) * 20);
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        padding + output * (canvas.width - padding * 2),
        canvas.height / 2,
        radius,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }
  }

  function bezier_1d_2c(c1, c2, t) {
    return (
      3 * c1 * t * Math.pow(1 - t, 2) +
      3 * c2 * (1 - t) * Math.pow(t, 2) +
      Math.pow(t, 3)
    );
  }

  function bezier_quad_1d(p0, p1, p2, p3, t) {
    return (
      Math.pow(1 - t, 3) * p0 +
      Math.pow(1 - t, 2) * t * 3 * p1 +
      Math.pow(t, 2) * (1 - t) * 3 * p2 +
      Math.pow(t, 3) * p3
    );
  }

  function bezier_spline(segments, t) {
    for (const segment of segments) {
      if (t >= segment.start && t <= segment.end) {
        const segment_range = segment.end - segment.start;
        const interpolant = (t - segment.start) / segment_range;
        return bezier_quad_1d(
          segment.start,
          segment.c1,
          segment.c2,
          segment.end,
          interpolant
        );
      }
    }
    return 0;
  }

  function make_segment(offset, c1, c2, length) {
    return {
      start: offset,
      c1: offset + c1 * length,
      c2: offset + c2 * length,
      end: offset + length,
    };
  }

  /* Interactive animations implementations */

  (function led_1_animation() {
    const canvas = document.getElementById("led-1");
    const ctx = canvas.getContext("2d");

    function draw(params) {
      ctx.fillStyle = "black";
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fill();

      /*
        Modern display systems make the brightness of colors linear, so we have
        to undo the monitor's gamma correction.
      */
      let brightness = parseFloat(params.brightness);
      let gamma_brightness = Math.pow(brightness, 1.0 / 2.2);

      ctx.fillStyle = `rgba(79, 146, 255, ${gamma_brightness})`;
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    form_driven_canvas("led-1-form", draw);
  })();

  (function led_2_animation() {
    const canvas = document.getElementById("led-2");
    const ctx = canvas.getContext("2d");

    function draw(params) {
      ctx.fillStyle = "black";
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fill();

      let brightness = parseFloat(params.brightness);
      let gamma_brightness = Math.pow(brightness, 1.0 / 2);
      let expo_brightness = Math.pow(gamma_brightness, 2);

      ctx.fillStyle = `rgba(79, 146, 255, ${gamma_brightness})`;
      ctx.beginPath();
      ctx.arc(
        canvas.width / 4,
        canvas.height / 2,
        canvas.width / 5,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.fillStyle = `rgba(79, 146, 255, ${expo_brightness})`;
      ctx.beginPath();
      ctx.arc(
        (canvas.width / 4) * 3,
        canvas.height / 2,
        canvas.width / 5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    form_driven_canvas("led-2-form", draw);
  })();

  (function led_3_animation() {
    const canvas = document.getElementById("led-3");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    for (let i = 0; i <= 1.0; i += 0.1) {
      let gamma_brightness = Math.pow(i, 1.0 / 2);
      let expo_brightness = Math.pow(gamma_brightness, 2);
      let padding = canvas.width / 15;
      let x = padding + (canvas.width - padding * 2) * i;
      let radius = canvas.width / 23;

      ctx.fillStyle = `rgba(79, 146, 255, ${gamma_brightness})`;
      ctx.beginPath();
      ctx.arc(x, canvas.height / 4, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = `rgba(79, 146, 255, ${expo_brightness})`;
      ctx.beginPath();
      ctx.arc(x, (canvas.height / 4) * 3, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  })();


  (function led_4() {
    const grapher = new Grapher("led-4");

    grapher.clear();
    grapher.plot_function((t) => t, "rgb(255, 0, 127)");
    grapher.plot_function((t) => Math.pow(t, 2), "rgb(0, 127, 255)");

    grapher.draw_frame();
  })();


  (function easing() {
    const anim_canvas = document.getElementById("easing-animation");
    const anim_ctx = anim_canvas.getContext("2d");
    const grapher = new Grapher("easing");
    const play = new PlayPause("easing-play", update_animation);

    let ease_func = (t) => Math.pow(t, 2);

    function draw_graph(t) {
      grapher.clear();
      grapher.plot_function((t) => t, "rgb(255, 0, 127)");
      grapher.plot_function(ease_func, "rgb(0, 127, 255)");
      grapher.plot_crossing(t, ease_func(t));
      grapher.draw_frame();
    }

    function draw_animation(t) {
      let padding = anim_canvas.width / 15;
      let x1 = padding + (anim_canvas.width - padding * 2) * t;
      let x2 = padding + (anim_canvas.width - padding * 2) * ease_func(t);
      let radius = anim_canvas.width / 23;

      anim_ctx.clearRect(0, 0, anim_canvas.width, anim_canvas.height);

      anim_ctx.fillStyle = "rgb(255, 0, 127)";
      anim_ctx.beginPath();
      anim_ctx.arc(x1, anim_canvas.height / 4, radius, 0, 2 * Math.PI);
      anim_ctx.fill();

      anim_ctx.fillStyle = "rgb(0, 127, 255)";
      anim_ctx.beginPath();
      anim_ctx.arc(x2, (anim_canvas.height / 4) * 3, radius, 0, 2 * Math.PI);
      anim_ctx.fill();

      draw_graph(t);
    }


    function update_animation() {
      let now = performance.now() - play.start_time;
      let s = (now % 2500);
      if(s <= 2000) {
        draw_animation(s / 2000);
      } else {
        draw_animation(1);
      }
      if(play.playing) {
        window.requestAnimationFrame(update_animation);
      }
    }

    window.requestAnimationFrame(update_animation);

    function update_easing(params) {
      switch(params.easing) {
        case "in_quad":
          ease_func = (t) => Math.pow(t, 2);
          break;
        case "out_quad":
          ease_func = (t) => 1 - Math.pow(1 - t, 2);
          break;
        case "in_cubic":
          ease_func = (t) => Math.pow(t, 3);
          break;
        case "out_cubic":
          ease_func = (t) => 1 - Math.pow(1 - t, 3);
          break;
        case "in_expo":
          ease_func = (t) => Math.pow(2, t * 10 - 10);
          break;
        case "out_expo":
          ease_func = (t) => 1 - Math.pow(2, (1 - t) * 10 - 10);
          break;
        default:
          break;
      }
    }

    form_driven_canvas("easing-form", update_easing);
  })();

  (function test_animation() {
    const grapher = new Grapher("test");

    function draw(params) {
      grapher.clear();
      grapher.plot_function(
        (t) => bezier_quad_1d(0, 0.4, 0.6, 1, t),
        "rgb(255, 0, 127)"
      );

      const nonlinearity = params.nonlinearity;
      const spline_func = (t) =>
        bezier_spline(
          [
            make_segment(0.0, nonlinearity, 1.0 - nonlinearity, 0.2),
            make_segment(0.2, nonlinearity, 1.0 - nonlinearity, 0.2),
            make_segment(0.4, nonlinearity, 1.0 - nonlinearity, 0.2),
            make_segment(0.6, nonlinearity, 1.0 - nonlinearity, 0.2),
            make_segment(0.8, nonlinearity, 1.0 - nonlinearity, 0.2),
          ],
          t
        );

      // const spline_func = (t) => bezier_quad_1d(0, params.nonlinearity, 1.0 - params.nonlinearity, 1.0, t);

      grapher.plot_function(spline_func, "rgb(0, 127, 255)");

      grapher.draw_frame();

      draw_response_heatmap(
        document.getElementById("test-input-canvas"),
        "255, 0, 127",
        (t) => t,
        params.slider
      );
      draw_response_heatmap(
        document.getElementById("test-output-canvas"),
        "0, 127, 255",
        spline_func,
        params.slider
      );
    }

    form_driven_canvas("test-form", draw);
  })();
}

start_animations();
