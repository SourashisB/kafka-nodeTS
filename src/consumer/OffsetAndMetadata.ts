export class OffsetAndMetadata {
    constructor(
      /**
       * The offset to be committed
       */
      public readonly offset: number,
      /**
       * Optional metadata for this offset commit
       */
      public readonly metadata: string = ""
    ) {}
  }
  