// 等待页面加载完成
document.addEventListener('DOMContentLoaded', async () => {
  const goodsList = document.getElementById('goods-list');

  try {
    // 加载JSON数据
    const response = await fetch('data/goods.json');
    if (!response.ok) {
      throw new Error('JSON数据加载失败');
    }
    const data = await response.json();
    const goods = data.goods;

    // 清空加载提示
    goodsList.innerHTML = '';

    // 遍历商品数据，生成卡片
    goods.forEach(good => {
      const card = document.createElement('div');
      card.className = 'goods-card';

      // 商品卡片内容（优先显示本地图片，备用占位图）
      card.innerHTML = `
        <img src="${good.images[0]}" alt="${good.name}" class="goods-img" 
             onerror="this.src='${good.images[1]}'">
        <div class="goods-content">
          <h3>${good.name}</h3>
          <div class="goods-price">$${good.price}</div>
          <p class="goods-desc">${good.description}</p>
          <div class="goods-meta">
            <p>创作者：${good.creator}</p>
            <p>发布日期：${good.date}</p>
          </div>
        </div>
      `;

      goodsList.appendChild(card);
    });
  } catch (error) {
    // 错误处理
    goodsList.innerHTML = `<div class="loading">加载失败：${error.message}</div>`;
    console.error('加载商品数据出错：', error);
  }
});
