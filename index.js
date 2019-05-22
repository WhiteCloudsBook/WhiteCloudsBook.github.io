(() => {

    const DL_URL = "https://us-central1-whiteclouds-share.cloudfunctions.net/whitecloudsShare";

    const overlay = document.querySelector("#overlay"),
        dlModalOpen = document.querySelectorAll(".dl-modal-open"),
        dlModal = document.querySelector("#download-modal"),
        successModal = document.querySelector("#success-modal"),
        loadingModal = document.querySelector("#loading-modal"),
        closeModalBtn = dlModal.querySelector(".close-modal"),
        dlPassword = dlModal.querySelector("#dl-password"),
        download = document.querySelector("#dl-book"),
        openBook = document.querySelector("#open-book");

    let currentModal = null,
        downloadUrl = null,
        isDownloadSuccess = false;

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
        if (currentModal) {
            closeModal();
        }

        currentModal = modal;
        currentModal.classList.add("flex");
        overlay.classList.remove("hidden");
        overlay.addEventListener("click", handleClickOutsideModal);
    };

    const openSuccessModal = () => openModal(successModal);

    const openDownloadModal = () => {
        if (isDownloadSuccess) {
            openSuccessModal();
        }
        else {
            openModal(dlModal);
            dlModal.classList.remove("modal-error");
            dlModal.querySelector(".input-error").textContent = "";
        }
    };

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

    closeModalBtn.addEventListener("click", () => {
        closeModal();
    });

    const clearDownloadSuccess = () => {
        isDownloadSuccess = false;
        downloadUrl = null;
    };

    const handleAccessDenied = () => {
        openDownloadModal();
        dlModal.classList.add("modal-error");
        dlModal.querySelector(".input-error").textContent = "Incorrect password, please try again";
    };

    const handleDownloadError = () => {
        openDownloadModal();
    };

    const handleSuccessfulDownload = (response) => {
        response.json()
            .then((result) => {
                setTimeout(clearDownloadSuccess, 3.6e+6); //clear after an hour
                downloadUrl = result.info.downloadUrl;
                isDownloadSuccess = true;
                openSuccessModal();
            })
            .catch((error) => {
                console.log("failed to get response json", error);
                handleDownloadError();
            });
    };

    openBook.addEventListener("click", () => {
        if (downloadUrl) {
            window.open(downloadUrl);
        }
    });

    download.addEventListener("click", () => {
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

                if (response.ok) {
                    handleSuccessfulDownload(response);
                }
                else if (response.status === 401) {
                    handleAccessDenied();
                }
                else {
                    handleDownloadError();
                }
            });
    });

})();