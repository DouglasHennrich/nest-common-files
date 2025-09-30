import { Module } from '@nestjs/common';
import { GCPStorageProvider } from './provider/gcp-storage.provider';
import { EnvModule } from '@/env/env.module';
import { TUploadProvider } from './models/upload-provider.struct';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: TUploadProvider,
      useClass: GCPStorageProvider,
    },
  ],
  exports: [TUploadProvider],
})
export class UploadProviderModule {}
