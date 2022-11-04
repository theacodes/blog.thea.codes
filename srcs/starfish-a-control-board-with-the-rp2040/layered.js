document.addEventListener("DOMContentLoaded", () => {
    for(const fig of document.querySelectorAll("figure[data-layered]")) {
        const images = fig.querySelectorAll("img");

        const show_image = (which) => {
            for(const img of images) {
                if(img == which) {
                    img.classList.add("active");
                } else {
                    img.classList.remove("active");
                }
            }
        };

        show_image(images[0]);

        const btn_div = document.createElement("div");
        btn_div.classList.add("buttons");

        for(const img of images) {
            const btn = document.createElement("button");
            btn_div.append(btn);
            btn.type = "button";
            btn.innerText = img.title;
            btn.addEventListener("click", () => {
                show_image(img);
            });
        }

        fig.append(btn_div);
    }
});
