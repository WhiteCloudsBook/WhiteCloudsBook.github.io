(() => {

    const DL_URL = "https://us-central1-whiteclouds-share.cloudfunctions.net/whitecloudsShare";

    const overlay = document.querySelector("#overlay"),
        dlModal = document.querySelector("#download-modal"),
        successModal = document.querySelector("#success-modal"),
        loadingModal = document.querySelector("#loading-modal"),
        dlPassword = dlModal.querySelector("#dl-password");

    let currentModal = null,
        downloadUrl = null,
        isDownloadSuccess = false;

    const addClick = (selector, cb) => {
        const elms = typeof selector === "string" ?
            document.querySelectorAll(selector) :
            [selector];

        [...elms]
            .forEach((elm) => {
                elm.addEventListener("click", cb);
            });
    };

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
        addClick(overlay, handleClickOutsideModal);
    };

    const openSuccessModal = () => openModal(successModal);

    const openDownloadModal = () => {
        if (isDownloadSuccess) {
            openSuccessModal();
        }
        else {
            openModal(dlModal);
            dlPassword.focus();
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

    addClick(".dl-modal-open", openDownloadModal);
    addClick(".close-modal", closeModal);

    const clearDownloadSuccess = () => {
        isDownloadSuccess = false;
        downloadUrl = null;
    };

    const handleAccessDenied = () => {
        handleDownloadError("Incorrect password, please try again");
    };

    const handleDownloadError = (text) => {
        openDownloadModal();
        dlModal.classList.add("modal-error");
        dlModal.querySelector(".input-error").textContent = text;
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
                handleDownloadError("Download failed... :(");
            });
    };

    addClick("#open-book", () => {
        if (downloadUrl) {
            window.open(downloadUrl);
        }
    });

    const downloadBook = () => {
        let password = dlPassword.value.replace(/^\s*|\s*$/g, "");

        if (password.length) {
            openLoadingModal("Authenticating...");

            const processHandler = setTimeout(() => {
                openLoadingModal("Generating...");
            }, 1500);

            fetch(DL_URL, {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password })
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
                        handleDownloadError("Download failed... :(");
                    }
                })
                .catch((err) => {
                    clearTimeout(processHandler);
                    console.log("failed to download", err);
                    handleDownloadError("Download failed... :(");
                });
        }
    };

    addClick("#dl-book", downloadBook);

    dlPassword.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            downloadBook();
        }
    });

    window.__modals = {
        openDownloadModal,
        openLoadingModal,
        openSuccessModal,
    };
})();