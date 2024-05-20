create materialized view product_materialized as
select   
  info_product."id" AS info_product_id,
  product."id" AS product_id,
  product_image."id" AS product_image_id,
  platform."id" AS platform_id, 
  info_product.title,
  info_product.description,
  info_product.slug,
  info_product.tags,
  product."pricePrimary",
  product."priceSecondary",
  product.price,
  product."createAt",
  platform."namePlatform",
  product_image.url
from info_product
inner join product on info_product."id" = product."infoProductId"
inner join product_image on info_product."id" = product_image."infoProductId" 
inner join platform on product."platformId" = platform."id"
order by product."createAt" asc;