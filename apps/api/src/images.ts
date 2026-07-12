import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Resvg } from "@resvg/resvg-js";
import { renderScoutCardSvg, type ScoutCard } from "@haahaaland/shared";

export type StoredCardImages = {
  svgUrl: string;
  pngUrl: string;
  ogUrl: string;
};

export interface CardImageStore {
  store(cardId: string, card: ScoutCard): Promise<StoredCardImages>;
}

export function renderCardImageAssets(cardId: string, card: ScoutCard) {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(cardId))
    throw new Error("Invalid card image key");
  const squareSvg = renderScoutCardSvg(card, cardId, "square");
  const ogSvg = renderScoutCardSvg(card, cardId, "og");
  const squarePng = new Resvg(squareSvg, {
    fitTo: { mode: "width", value: 1080 },
  })
    .render()
    .asPng();
  const ogPng = new Resvg(ogSvg, {
    fitTo: { mode: "width", value: 1200 },
  })
    .render()
    .asPng();
  return { squareSvg, squarePng, ogPng };
}

export class R2CardImageStore implements CardImageStore {
  private readonly client: S3Client;
  private readonly publicBaseUrl: string;

  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    private readonly bucket: string,
    publicBaseUrl: string,
  ) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
    const parsedPublicUrl = new URL(publicBaseUrl);
    if (
      parsedPublicUrl.protocol !== "https:" ||
      parsedPublicUrl.username ||
      parsedPublicUrl.password
    )
      throw new Error("R2 public base URL must be credential-free HTTPS");
    this.publicBaseUrl = parsedPublicUrl.toString().replace(/\/$/, "");
  }

  async store(cardId: string, card: ScoutCard): Promise<StoredCardImages> {
    const { squareSvg, squarePng, ogPng } = renderCardImageAssets(cardId, card);
    const prefix = `cards/${cardId}`;
    const objects = [
      {
        key: `${prefix}/card.svg`,
        body: Buffer.from(squareSvg),
        contentType: "image/svg+xml; charset=utf-8",
      },
      {
        key: `${prefix}/card.png`,
        body: squarePng,
        contentType: "image/png",
      },
      {
        key: `${prefix}/og.png`,
        body: ogPng,
        contentType: "image/png",
      },
    ];
    await Promise.all(
      objects.map((object) =>
        this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: object.key,
            Body: object.body,
            ContentType: object.contentType,
            CacheControl: "public, max-age=31536000, immutable",
          }),
        ),
      ),
    );
    return {
      svgUrl: `${this.publicBaseUrl}/${objects[0]!.key}`,
      pngUrl: `${this.publicBaseUrl}/${objects[1]!.key}`,
      ogUrl: `${this.publicBaseUrl}/${objects[2]!.key}`,
    };
  }
}
