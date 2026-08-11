/** 判断实际图片尺寸是否符合调用方声明的目标宽高比（如产品图的 1:1），以及是否低于建议最低分辨率。
 * 两个阈值都是可选的——调用方不传就不做对应判断，避免把"产品图 1:1 / 不低于 1000px"这类
 * 场景化规则错误地套用到 Logo、Hero 横幅等本来就不是正方形/本来就可以很小的图片字段上。 */
export function describeImageDimensions(
  width: number,
  height: number,
  expectedAspectRatio?: number,
  minRecommendedSize?: number,
) {
  const matchesExpectedRatio =
    expectedAspectRatio === undefined ? null : Math.abs(width / height - expectedAspectRatio) < 0.02;
  const isLowResolution =
    minRecommendedSize === undefined ? false : width < minRecommendedSize || height < minRecommendedSize;
  return { matchesExpectedRatio, isLowResolution };
}
