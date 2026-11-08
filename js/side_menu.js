const menuToggle =
    document.getElementById("menu-toggle");

const sideMenu =
    document.getElementById("side-menu");

if (menuToggle && sideMenu) {

    menuToggle.addEventListener(
        "click",
        () => {
            sideMenu.classList.toggle("open");
        }
    );
}