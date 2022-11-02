

function start_animations() {
    "use strict";
    const padding_x = 30;
    const padding_y = 30;
    const font_name = "'IBM Plex Mono'"
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

            this.centered = false;
        }

        clear() {
            this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
        }

        draw_frame(x_label = "time", y_label="output") {
            const ctx = this.ctx;

            ctx.save();
            ctx.strokeStyle = "#333333";
            ctx.fillStyle = "#333333";
            ctx.lineWidth = 2;
            ctx.font = primary_font;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
    
            ctx.beginPath();
            ctx.moveTo(this.bottom_left_x, this.bottom_left_y)
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
    
            this.clear_text_area(this.bottom_left_x + this.width / 2, this.bottom_left_y, x_label);
            ctx.fillText(x_label, this.bottom_left_x + this.width / 2, this.bottom_left_y);
            
            ctx.beginPath();
            ctx.moveTo(this.bottom_left_x, this.bottom_left_y)
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


            if(this.centered) {
                ctx.strokeStyle = "#AAAAAA";
                ctx.beginPath();
                ctx.setLineDash([5, 20]);
                ctx.moveTo(this.top_left_x, this.top_left_y + this.height / 2);
                ctx.lineTo(this.bottom_right_x, this.top_left_y + this.height / 2);
                ctx.closePath();
                ctx.stroke();
                ctx.setLineDash([]);

                this.mask_out(this.top_right_x - padding_x / 2, this.top_right_y + this.height / 2, 30);
                ctx.fillStyle = "#888888";
                ctx.font = alt_font;
                ctx.fillText("+", this.top_right_x - padding_x / 2, this.top_right_y + this.height / 2 - 60);
                ctx.fillText("0", this.top_right_x - padding_x / 2, this.top_right_y + this.height / 2);
                ctx.fillText("-", this.top_right_x - padding_x / 2, this.top_right_y + this.height / 2 + 60);
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

        mask_out(x, y, size=50, extent=80) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            let gradient = ctx.createRadialGradient(
                x, y, size,
                x, y, extent
            );
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
            
            if(this.centered) {
                origin = this.height / 2;
                mult = 0.5;
            }

            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            for(let t = 0; t <= 1.0; t += 1 / this.width) {
                let out = func(t);
                let x = left + Math.min(t * max_width, max_width);
                let y = bottom - origin - (out * mult * max_height);
                if(y > bottom) y = bottom;
                if(y < top) y = top;
                t == 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }

        clear_text_area(x, y, text, line_width=20, alpha=0.8, blur=100, x_mult = 2, y_mult = 1) {
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
                (Math.abs(extents.actualBoundingBoxLeft) + Math.abs(extents.actualBoundingBoxRight)) * x_mult,
                (extents.actualBoundingBoxAscent + extents.actualBoundingBoxDescent) * y_mult);
            
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.restore();
        }

        draw_info(text) {
            this.ctx.font = info_font;
            this.ctx.textBaseline = "top";
            this.ctx.textAlign = "left"
            this.clear_text_area(this.top_left_x + padding_x, this.top_left_y, text, 20, 0.8, 100, 1, 1);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(text, this.top_left_x + padding_x, this.top_left_y);
        }
    }

    function params_from_form(form_elem) {
        let output = {};
        (new FormData(form_elem)).forEach(function(value, key){
            output[key] = value;
        });
        return output;
    }


    function form_driven_canvas(form_elem_id, draw_func) {
        const form_elem = document.getElementById(form_elem_id);
        form_elem.addEventListener("input", (e) => draw_func(params_from_form(form_elem)));
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

    (function discharge() {
        const speed = 0.003;
        const start_btn = document.getElementById("discharge-start");
        const reset_btn = document.getElementById("discharge-reset");
        const grapher = new Grapher("discharge");
        let running = false;
        let value = 0;
        let data = new Array(500);
        data.fill(0);

        function draw() {
            value += speed;
            data.shift();
            data.push(value);
            grapher.clear();
            grapher.plot_function((t) => data[Math.round(t * data.length)]);
            grapher.draw_frame();

            if(running) {
                window.requestAnimationFrame(draw);
            }
        }

        start_btn.addEventListener("click", function(e) {
            if(!running) {
                running = true;
                window.requestAnimationFrame(draw);
                start_btn.innerText = "stop";
            } else {
                running = false;
                start_btn.innerText = "start";
            }
        });

        reset_btn.addEventListener("click", function(e) {
            value = 0;
        });
          
        let observer = new IntersectionObserver(function(entries, observer) {
            for(let entry of entries) {
                if(entry.target != grapher.canvas) {
                    continue;
                }
                if(!entry.isIntersecting) {
                    running = false;
                    start_btn.innerText = "start";
                }
            }
        }, {
            threshold: 1.0
        });
        
        observer.observe(grapher.canvas);

        draw();
        
    })();

    function vout_at_time(vin, r, c, t) {
        return -(vin / (r * c)) * t;
    }

    (function integrator() {

        const grapher = new Grapher("integrator");
        grapher.centered = true;

        function draw(params) {
            grapher.clear();
            grapher.plot_function((t) => vout_at_time(params.voltage, params.resistance, params.capacitance, t));
            grapher.draw_frame();
            grapher.draw_info(`Input voltage: ${params.voltage}`);
        }

        form_driven_canvas("integrator-form", draw);
    }());

    (function vco() {
        const grapher = new Grapher("vco");

        function vco_func(control_voltage, t) {
            let out = vout_at_time(control_voltage, 0.5, 0.5, t);
            while(out < -1.0) {
                out += 1.0;
            }
            return -out;
        }

        function draw(params) {
            grapher.clear();
            grapher.plot_function((t) => vco_func(params.voltage, t));
            grapher.draw_info(`Control voltage: ${params.voltage}`);
            grapher.draw_frame();
        }

        form_driven_canvas("vco-form", draw);
    })();


    (function comparator(){
        function calc(form) {
            let over = form.voltage.valueAsNumber > form.reference.valueAsNumber;
            if(over) {
                form.output.classList.add("high");
            } else {
                form.output.classList.remove("high");
            }
            return over ? "High" : "Low";
        }

        calculator_form("comparator-form", calc);
    })();

    (function frequency_for_cv(){
        function calc(form) {
            let cv = (form.voltage.valueAsNumber);

            let time = -(2e-4 * 12) / -cv;
            let frequency = (1 / time).toFixed(0);

            return `${cv} Volts produces ${frequency} Hz`;
        }

        calculator_form("frequency-for-cv-form", calc);
    })();

    (function cv_for_frequency(){
        function calc(form) {
            let frequency = form.frequency.valueAsNumber;

            let time = 1 / frequency;
            let cv = -(2e-4 * 12) / -time;

            return `${cv.toFixed(2)} Volts produces ${frequency} Hz`;
        }

        calculator_form("cv-for-frequency-form", calc);
    })();

    function clock_func(frequency, t, duty = 0.5) {
        return frequency * t % 1.0 < duty;
    }

    (function clock() {
        const grapher = new Grapher("clock");

        function draw(params) {
            grapher.clear();
            grapher.plot_function((t) => clock_func(+params.frequency, t));
            grapher.draw_frame();
        }

        form_driven_canvas("clock-form", draw);
    })();


    (function rcdiff() {
        const grapher = new Grapher("rcdiff");
        grapher.centered = true;
        let data = new Array(500);
        let slice = 1 / data.length;

        function calc_rc_diff(frequency, rc) {
            for(let i = 0; i < data.length; i++) {
                let t = i / data.length
                let clock_a = clock_func(frequency, t - slice);
                let clock_b = clock_func(frequency, t);

                if(clock_a < clock_b) {
                    data[i] = 1;
                } else if (clock_a > clock_b) {
                    data[i] = -1;
                } else {
                    if(i > 0) {
                        data[i] = data[i - 1] * rc;
                    } else {
                        data[i] = 0;
                    }
                }
            }
        }

        function draw(params) {
            grapher.clear();
            calc_rc_diff(params.frequency, params.capacitance * params.resistance);
            grapher.plot_function((t) => clock_func(params.frequency, t), "#C7B8ED");
            grapher.plot_function((t) => data[Math.round(t * data.length)]);
            grapher.draw_frame();
        }

        form_driven_canvas("rcdiff-form", draw);
    })();

    (function rcdiff2() {
        const clock_voltage = 5;
        const grapher = new Grapher("rcdiff2");
        grapher.centered = true;
        let data = new Array(500);
        const slice = 1 / data.length;

        function calc_rc_diff(frequency, rc) {
            for(let i = 0; i < data.length; i++) {
                let t = i / data.length;
                let clock_a = clock_func(frequency, t - slice);
                let clock_b = clock_func(frequency, t);

                if(clock_a < clock_b) {
                    data[i] = 1;
                } else if (clock_a > clock_b) {
                    data[i] = -1;
                } else {
                    if(i > 0) {
                        data[i] = data[i - 1] * rc;
                    } else {
                        data[i] = 0;
                    }
                }
            }
        }

        function transistor_func(t) {
            let v_b = data[Math.round(t * data.length)] * clock_voltage;
            if(v_b > 0.7) {
                return 0.7;
            } else {
                return 0;
            }
        }

        function draw(params) {
            grapher.clear();
            calc_rc_diff(params.frequency, params.capacitance * params.resistance);
            grapher.plot_function((t) => data[Math.round(t * data.length)]);
            grapher.plot_function((t) => transistor_func(t), "#c35b7d");
            grapher.draw_frame();
        }

        form_driven_canvas("rcdiff2-form", draw);
    })();

    (function dco() {
        const grapher = new Grapher("dco");
        let data = new Array(1000);
        const slice = 1 / data.length;

        function calculate_dco(frequency) {
            let t = 0;
            for(let i = 0; i < data.length; i++) {
                let clock_a = clock_func(frequency, (i - 1) * slice);
                let clock_b = clock_func(frequency, i * slice);
                t += slice;

                if(clock_a < clock_b) {
                    t = 0;
                    data[i] = 0;
                } else {
                    data[i] = -vout_at_time(1.0, 0.5, 0.5, t);
                }
            }
        }

        function draw(params) {
            grapher.clear();
            calculate_dco(params.frequency / 10);
            grapher.plot_function((t) => data[Math.round(t * data.length)]);
            grapher.draw_frame();
        }

        form_driven_canvas("dco-form", draw);
    })();

    (function juno106() {
        const grapher = new Grapher("juno106");
        let data = new Array(1000);
        const slice = 1 / data.length;

        function charge_v_for_frequency(frequency) {
            return 10 * (frequency / 40);
        }

        function calculate_dco(frequency) {
            let t = 0;
            for(let i = 0; i < data.length; i++) {
                let clock_a = clock_func(frequency, (i - 1) * slice);
                let clock_b = clock_func(frequency, i * slice);
                t += slice;

                if(clock_a < clock_b) {
                    t = 0;
                    data[i] = 0;
                } else {
                    data[i] = -vout_at_time(charge_v_for_frequency(frequency), 0.5, 0.5, t);
                }
            }
        }

        function draw(params) {
            grapher.clear();
            calculate_dco(+params.frequency);
            grapher.plot_function((t) => data[Math.round(t * data.length)]);
            grapher.draw_frame();
        }

        form_driven_canvas("juno106-form", draw);
    })();

    (function juno6() {
        const grapher = new Grapher("juno6");
        let data = new Array(1000);
        const slice = 1 / data.length;

        function charge_v_for_frequency(frequency) {
            return 10 * (frequency / 40);
        }

        function calculate_dco(frequency) {
            let t = 0;
            for(let i = 0; i < data.length; i++) {
                let clock_a = clock_func(frequency, (i - 1) * slice);
                let clock_b = clock_func(frequency, i * slice);
                t += slice;

                if(clock_a < clock_b) {
                    t = 0;
                    data[i] = 0;
                } else {
                    data[i] = vout_at_time(charge_v_for_frequency(frequency), 0.5, 0.5, t);
                }
            }
        }

        function draw(params) {
            grapher.clear();
            calculate_dco(+params.frequency);
            grapher.plot_function((t) => 1.0 + data[Math.round(t * data.length)]);
            grapher.draw_frame();
        }

        form_driven_canvas("juno6-form", draw);
    })();

    (function pulse() {
        const grapher = new Grapher("pulse");

        function saw_func(frequency, t) {
            return (frequency * t) % 1.0;
        }

        function draw(params) {
            grapher.clear();
            grapher.plot_function((t) => saw_func(+params.frequency, t), "#7D61BA");
            grapher.plot_function((t) => clock_func(+params.frequency, t, +params.duty));
            grapher.ctx.strokeStyle = "#c35b7d";
            grapher.ctx.setLineDash([15, 20]);
            grapher.ctx.beginPath();
            grapher.ctx.moveTo(grapher.top_left_x, grapher.top_left_y + (grapher.height * (1.0 - params.duty)));
            grapher.ctx.lineTo(grapher.top_right_x, grapher.top_left_y + (grapher.height * (1.0 - params.duty)));
            grapher.ctx.stroke();
            grapher.ctx.closePath();
            grapher.ctx.setLineDash([]);
            grapher.draw_frame();
        }

        form_driven_canvas("pulse-form", draw);
    })();
}



WebFont.load({
    classes: false,
    google: {
        families: ['IBM Plex Mono:regular,italic']
    },
    active: start_animations
});