import responsiveWidth from "responsive-width";
import clsx from "clsx";

const header = document.querySelector(".header");

header.classList.add("responsive-width animate-[spin]");

document.addEventListener("responsive-width", () => {
  document.getElementById("dynamicElement").className = clsx("primary-color", {
    "responsive-width": window.innerWidth > 768,
    "hover:bg-[red-500]": true,
    "dark-mode:responsive-width":
      document.body.classList.contains("responsive-width"),
    "sm:p-[5px]": true,
    decorated: false,
  });
});

const mySpecialClass = "primary-color";
const decorated = "decorated";
const classes = {
  decorated: "decorated",
};
classes.decorated = "decorated";

localStorage.setItem("decorated", "decorated");
localStorage.getItem("decorated");

header.addClassName(() => {
  return () => ({
    class: {
      "responsive-width": responsiveWidth > 768,
    },
    getClass: () => `primary-color ${mySpecialClass} ${decorated} sm:p-[5px]`,
    "primary-color": "sm:p-[5px]",
  });
});

class Class {
  constructor() {
    this["responsive-width"] = "responsive-width";
    this.decorated = "primary-color";
    this["decorated"] = "decorated";
    this["sm:p-[5px]"] = "sm:p-[5px]";
  }
}

const classObj = new Class();