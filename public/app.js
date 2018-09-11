(function () {

    new Vue({
        el: '#app',
        data() {
            return {
                selectedFile: null,
                previewUrl: null,
                printDetails: null,
                price: null
            };
        },
        methods: {
            onFileChanged(event) {
                var file = event.target.files[0];
                if (!file) {
                    return;
                }

                this.selectedFile = file;

                const formData = new FormData();
                formData.append('model', this.selectedFile, this.selectedFile.name);
                axios.post('api/file', formData)
                    .then((response) => {
                        this.previewUrl = `/api/file/${response.data.name}`;
                        this.setDetails(response.data.name);
                    });
            },
            setDetails(fileName) {
                const url = `/api/file/${fileName}/details`;
                axios.get(url)
                    .then((response) => {
                        const details = response.data;
                        this.printDetails = details;
                        this.price = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: details.price.currency,
                            minimumFractionDigits: 2,
                        }).format(details.price.value);
                    });
            }
        }
    });

})();

