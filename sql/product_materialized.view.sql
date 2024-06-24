create materialized view product_materialized as
 WITH product_images AS (
  SELECT
    info_product.id AS info_product_id,
    array_agg(DISTINCT product_image.url) AS productImages
  FROM
    info_product
  LEFT JOIN
    product_image ON info_product.id = product_image."infoProductId"
  GROUP BY
    info_product.id
),
product_details AS (
  SELECT
    product."infoProductId" AS info_product_id,
    product.id AS product_id,
    product."pricePrimary",
    product."priceSecondary",
    product."price",
    product."createAt",
    jsonb_build_object(
      'id', platform.id,
      'namePlatform', platform."namePlatform"
    ) AS platform,
    jsonb_build_object(
      'id', sale.id,
      'sale', sale."sale",
      'salePrimary', sale."salePrimary",
      'saleSecondary', sale."saleSecondary",
      'salePrice', sale."salePrice",
      'finallySaleAt', sale."finallySaleAt"
    ) AS sale
  FROM
    product
  LEFT JOIN
    platform ON product."platformId" = platform.id
  LEFT JOIN
    sale ON sale."productId" = product.id
)
SELECT DISTINCT ON (info_product.title)
  info_product.id AS "id",
  info_product.title AS "title",
  info_product.description AS "description",
  info_product.slug AS "slug",
  info_product.tags AS "tags",
  pi.productImages AS "productImages",
  jsonb_agg(
    jsonb_build_object(
      'id', pd.product_id,
      'pricePrimary', pd."pricePrimary",
      'priceSecondary', pd."priceSecondary",
      'price', pd."price",
      'createAt', pd."createAt",
      'platform', pd.platform,
      'sale', pd.sale
    )
  ) AS "products"
FROM
  info_product
LEFT JOIN
  product_details pd ON info_product.id = pd.info_product_id
LEFT JOIN
  product_images pi ON info_product.id = pi.info_product_id
GROUP BY
  info_product.id, 
  info_product.title, 
  info_product.description, 
  info_product.slug, 
  info_product.tags, 
  pi.productImages
ORDER BY
  info_product."createAt";