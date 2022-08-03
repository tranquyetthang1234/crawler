function getInfoItemProductMultiModel()
{
    /**
     * TH1
     */

    let infoProductItem = [];

    infoProductItem = await page.evaluate(() => {
        let ulz = document.querySelectorAll('#twisterContainer ul.a-unordered-list.a-button-list.a-horizontal.swatchesSquare.imageSwatches li');
        listPrices = Array.from(ulz)
        return listPrices.map(function(price) {
            let isSelected = false;
            let title = imgTag.getAttribute('alt');
            let priTag = price.querySelector('.olpMessageWrapper');
            let priceItem = priTag ? priTag.textContent.replace(/^.*[\\\¥/]/, '').trim() : '';
            if (price.matches('.swatchSelect')) {
                isSelected = true;
            }

            if (isSelected) {
                return {
                    title : title + 'aaa',
                    price : priceItem.replace(/[^\d]/g, ""),
                    currency: priceItem ? '¥' : '',
                };
            }
        })
    })

    if(infoProductItem.length == 0) {

    }

}