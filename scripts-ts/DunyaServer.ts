import DunyaServerArgs from './DunyaServerArgs';

export default interface DunyaServer {
  onStart?(args: DunyaServerArgs): void;
  onStop?(): void;
}
