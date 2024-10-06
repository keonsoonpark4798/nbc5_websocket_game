import Item from "./Item.js";

class ItemController {

    INTERVAL_MIN = 0;
    INTERVAL_MAX = 12000;

    nextInterval = null;
    items = [];


    constructor(ctx, itemImages, scaleRatio, speed, itemUnlock) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.itemImages = itemImages;
        this.scaleRatio = scaleRatio;
        this.speed = speed;
        this.itemUnlock = itemUnlock;
        this.currentStage = 9999;
        this.setNextItemTime();
    }

    setNextItemTime() {
        this.nextInterval = this.getRandomNumber(
            this.INTERVAL_MIN,
            this.INTERVAL_MAX
        );
    }

    // 현재 스테이지 설정
    setCurrentStage(stageId) {
        this.currentStage = stageId;
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    createItem() {
        const stageItems = this.itemUnlock.find((stage) => stage.stage_id === this.currentStage,).item_id;
        if (stageItems) {
            const availableItems = this.itemImages.filter((item) => stageItems.includes(item.id));
            const index = this.getRandomNumber(0, availableItems.length - 1);
            const itemInfo = availableItems[index];
            const x = this.canvas.width * 1.5;
            const y = this.getRandomNumber(
                10,
                this.canvas.height - itemInfo.height
            );

            const item = new Item(
                this.ctx,
                itemInfo.id,
                x,
                y,
                itemInfo.width,
                itemInfo.height,
                itemInfo.image
            );

            this.items.push(item);
        }
    }


    update(gameSpeed, deltaTime) {
        if (this.nextInterval <= 0) {
            this.createItem();
            this.setNextItemTime();
        }

        this.nextInterval -= deltaTime;

        this.items.forEach((item) => {
            item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
        })

        this.items = this.items.filter(item => item.x > -item.width);
    }

    draw() {
        this.items.forEach((item) => item.draw());
    }

    collideWith(sprite) {
        const collidedItem = this.items.find(item => item.collideWith(sprite))
        if (collidedItem) {
            this.ctx.clearRect(collidedItem.x, collidedItem.y, collidedItem.width, collidedItem.height)
            return {
                itemId: collidedItem.id
            }
        }
    }

    reset() {
        this.items = [];
    }
}

export default ItemController;