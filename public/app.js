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
        filters: {
            currency(value, options) {
                return accounting.formatMoney(value, options);
            }
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
                        this.printDetails = response.data;
                    });
            }
        }
    });

})();

