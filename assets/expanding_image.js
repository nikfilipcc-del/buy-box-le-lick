const images = document.querySelectorAll(".expanding_image");

const expandImage = () => {
	images.forEach((image) => {
		image.addEventListener("mouseover", () => {
			const active = document.querySelector(".active");
			active.classList.remove("active");

			image.classList.add("active");
		});
	});
};

expandImage();
