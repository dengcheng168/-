export function TranslationMeta({
  translationStatus,
  updatedAt,
  updatedBy,
}: {
  translationStatus?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}) {
  if (!translationStatus) {
    return <p className="text-sm text-muted-foreground">尚未创建西班牙语译文，保存后将自动创建为草稿。</p>;
  }
  return (
    <p className="text-sm text-muted-foreground">
      翻译状态：{translationStatus === 'PUBLISHED' ? '已发布' : '草稿'}
      {updatedAt && <> · 最后修改：{new Date(updatedAt).toLocaleString('zh-CN')}</>}
      {updatedBy != null && <> · 修改人 #{updatedBy}</>}
    </p>
  );
}
