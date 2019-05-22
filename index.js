(() => {

    const DL_URL = "https://us-central1-whiteclouds-share.cloudfunctions.net/whitecloudsShare";

    const overlay = document.querySelector("#overlay"),
        dlModalOpen = document.querySelectorAll(".dl-modal-open"),
        dlModal = document.querySelector("#download-modal"),
        loadingModal = document.querySelector("#loading-modal"),
        dlModalClose = dlModal.querySelector(".close"),
        dlPassword = dlModal.querySelector("#dl-password"),
        download = document.querySelector("#dl-book");

    let currentModal = null;

    const closeModal = () => {
        currentModal.removeEventListener("click", handleClickOutsideModal);
        currentModal.classList.remove("flex");
        overlay.classList.add("hidden");
        currentModal = null;
    };

    const handleClickOutsideModal = () => {
        closeModal();
    };

    const openModal = (modal) => {
        currentModal = modal;
        currentModal.classList.add("flex");
        overlay.classList.remove("hidden");
        overlay.addEventListener("click", handleClickOutsideModal);
    };

    const openDownloadModal = () => openModal(dlModal);

    const openLoadingModal = (text) => {
        if (currentModal !== loadingModal) {
            openModal(loadingModal);
        }

        loadingModal.querySelector("h3").textContent = text;
    }

    [...dlModalOpen]
        .forEach((button) => {
            button.addEventListener("click", openDownloadModal)
        });

    dlModalClose.addEventListener("click", () => {
        closeDownloadOverlay();
    });

    download.addEventListener("click", () => {

        closeModal();
        openLoadingModal("Authenticating...");

        const processHandler = setTimeout(() => {
            openLoadingModal("Generating...");
        }, 1000);

        fetch(DL_URL, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: dlPassword.value })
        })
            .then((response) => {
                clearTimeout(processHandler);
                console.log("!!!!!!!!! got response = ", response);
            });
    });

})();