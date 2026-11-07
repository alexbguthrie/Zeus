import type { EmbeddedToolProps } from '../embedded';
import ToolSurface from '../ToolSurface';
import StocksView from './StocksView';
import { useWatchlist } from './useWatchlist';
import './styles.css';

export default function StocksTool({ presentation, storageScope }: EmbeddedToolProps) {
  const watchlist = useWatchlist(storageScope);
  return (
    <ToolSurface presentation={presentation}>
      <StocksView watchlist={watchlist} inline={presentation === 'inline'} />
    </ToolSurface>
  );
}
